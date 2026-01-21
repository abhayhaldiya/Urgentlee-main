#!/bin/bash

# Database Restore Script for Tailor Booking Platform
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Example:"
    echo "  $0 backups/backup_20240101_120000.sql.gz"
    echo "  $0 backups/backup_20240101_120000.sql"
    echo ""
    echo "Available backups:"
    ls -1 backups/backup_*.sql* 2>/dev/null || echo "  No backups found"
}

# Check arguments
if [ $# -eq 0 ]; then
    print_error "No backup file specified"
    show_usage
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    show_usage
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is not set"
    exit 1
fi

# Confirm restore operation
echo "⚠️  WARNING: This will replace all data in the database!"
echo "Database: $DATABASE_URL"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_warning "Restore operation cancelled"
    exit 0
fi

# Create temporary file for decompressed backup if needed
TEMP_FILE=""
SQL_FILE="$BACKUP_FILE"

if [[ "$BACKUP_FILE" == *.gz ]]; then
    print_status "Decompressing backup file..."
    TEMP_FILE="/tmp/restore_$(date +%s).sql"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    SQL_FILE="$TEMP_FILE"
    print_status "Backup decompressed to temporary file"
fi

# Restore database
echo "Starting database restore..."
echo "This may take several minutes depending on the backup size..."

if psql "$DATABASE_URL" < "$SQL_FILE"; then
    print_status "Database restored successfully"
else
    print_error "Failed to restore database"
    
    # Clean up temporary file
    if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
        rm "$TEMP_FILE"
    fi
    
    exit 1
fi

# Clean up temporary file
if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
    print_status "Temporary file cleaned up"
fi

# Verify restore
echo "Verifying database connection..."
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "Database connection verified"
else
    print_warning "Database connection could not be verified"
fi

print_status "Database restore completed successfully"
print_warning "Remember to restart your application services"
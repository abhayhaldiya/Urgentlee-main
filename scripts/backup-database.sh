#!/bin/bash

# Database Backup Script for Tailor Booking Platform
set -e

# Configuration
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
RETENTION_DAYS=7

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

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is not set"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting database backup..."
echo "Backup file: $BACKUP_FILE"

# Create backup
if pg_dump $DATABASE_URL > $BACKUP_FILE; then
    print_status "Database backup created successfully"
else
    print_error "Failed to create database backup"
    exit 1
fi

# Compress backup
if gzip $BACKUP_FILE; then
    print_status "Backup compressed: $BACKUP_FILE.gz"
else
    print_warning "Failed to compress backup, but backup file exists"
fi

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
print_status "Backup size: $BACKUP_SIZE"

# Clean up old backups
echo "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
DELETED_COUNT=$(find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ $DELETED_COUNT -gt 0 ]; then
    print_status "Deleted $DELETED_COUNT old backup(s)"
else
    print_status "No old backups to delete"
fi

# List current backups
echo ""
echo "Current backups:"
ls -lh $BACKUP_DIR/backup_*.sql.gz 2>/dev/null || echo "No backups found"

print_status "Backup process completed successfully"
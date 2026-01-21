#!/bin/bash

# End-to-End Test Runner for Tailor Booking Platform
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Configuration
TEST_ENV=${1:-"development"}
HEADLESS=${2:-"true"}
BROWSER=${3:-"chromium"}

echo "🧪 Starting End-to-End Tests"
echo "================================"
echo "Environment: $TEST_ENV"
echo "Headless: $HEADLESS"
echo "Browser: $BROWSER"
echo ""

# Set environment variables based on test environment
case $TEST_ENV in
  "development")
    export API_BASE_URL="http://localhost:3000"
    export BASE_URL="http://localhost:3001"
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tailor_booking_test"
    export REDIS_URL="redis://localhost:6379"
    ;;
  "staging")
    export API_BASE_URL="https://tailor-booking-backend-staging.vercel.app"
    export BASE_URL="https://tailor-booking-admin-staging.vercel.app"
    ;;
  "production")
    export API_BASE_URL="https://tailor-booking-backend.vercel.app"
    export BASE_URL="https://tailor-booking-admin.vercel.app"
    ;;
  *)
    print_error "Invalid environment: $TEST_ENV"
    echo "Usage: $0 [development|staging|production] [true|false] [chromium|firefox|webkit]"
    exit 1
    ;;
esac

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        exit 1
    fi
    
    print_status "Dependencies check passed"
}

# Setup test environment
setup_test_environment() {
    print_info "Setting up test environment..."
    
    # Install dependencies if not already installed
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        pnpm install
    fi
    
    # Install Playwright browsers
    if [ ! -d "node_modules/@playwright" ]; then
        print_info "Installing Playwright..."
        pnpm add -D @playwright/test
    fi
    
    print_info "Installing Playwright browsers..."
    npx playwright install
    
    print_status "Test environment setup complete"
}

# Start services for development environment
start_services() {
    if [ "$TEST_ENV" = "development" ]; then
        print_info "Starting local services..."
        
        # Check if services are already running
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            print_status "Backend is already running"
        else
            print_info "Starting backend service..."
            cd apps/backend
            pnpm dev &
            BACKEND_PID=$!
            cd ../..
            
            # Wait for backend to start
            for i in {1..30}; do
                if curl -s http://localhost:3000/health > /dev/null 2>&1; then
                    print_status "Backend started successfully"
                    break
                fi
                sleep 2
            done
        fi
        
        if curl -s http://localhost:3001 > /dev/null 2>&1; then
            print_status "Admin panel is already running"
        else
            print_info "Starting admin panel..."
            cd apps/admin-panel
            pnpm dev &
            ADMIN_PID=$!
            cd ../..
            
            # Wait for admin panel to start
            for i in {1..30}; do
                if curl -s http://localhost:3001 > /dev/null 2>&1; then
                    print_status "Admin panel started successfully"
                    break
                fi
                sleep 2
            done
        fi
    fi
}

# Run specific test suites
run_test_suite() {
    local suite=$1
    local description=$2
    
    print_info "Running $description..."
    
    local cmd="npx playwright test tests/e2e/$suite.test.ts"
    
    if [ "$HEADLESS" = "false" ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "$BROWSER" != "all" ]; then
        cmd="$cmd --project=$BROWSER"
    fi
    
    if $cmd; then
        print_status "$description completed successfully"
        return 0
    else
        print_error "$description failed"
        return 1
    fi
}

# Main test execution
run_tests() {
    print_info "Starting test execution..."
    
    local failed_tests=0
    
    # Run test suites in order
    if ! run_test_suite "user-journey" "Complete User Journey Tests"; then
        ((failed_tests++))
    fi
    
    if ! run_test_suite "admin-panel" "Admin Panel Tests"; then
        ((failed_tests++))
    fi
    
    if ! run_test_suite "mobile-apps" "Mobile Apps Integration Tests"; then
        ((failed_tests++))
    fi
    
    if ! run_test_suite "performance" "Performance Tests"; then
        ((failed_tests++))
    fi
    
    return $failed_tests
}

# Generate test report
generate_report() {
    print_info "Generating test report..."
    
    if [ -f "test-results/results.json" ]; then
        # Generate HTML report
        npx playwright show-report --host=0.0.0.0 &
        REPORT_PID=$!
        
        print_status "Test report generated"
        print_info "HTML report available at: http://localhost:9323"
        print_info "JSON report available at: test-results/results.json"
        print_info "JUnit report available at: test-results/results.xml"
    else
        print_warning "No test results found"
    fi
}

# Cleanup function
cleanup() {
    print_info "Cleaning up..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$ADMIN_PID" ]; then
        kill $ADMIN_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$REPORT_PID" ]; then
        kill $REPORT_PID 2>/dev/null || true
    fi
    
    print_status "Cleanup complete"
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    check_dependencies
    setup_test_environment
    start_services
    
    # Run tests
    if run_tests; then
        print_status "All tests passed! 🎉"
        generate_report
        exit 0
    else
        print_error "Some tests failed! ❌"
        generate_report
        exit 1
    fi
}

# Show usage if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [environment] [headless] [browser]"
    echo ""
    echo "Arguments:"
    echo "  environment  Test environment (development|staging|production) [default: development]"
    echo "  headless     Run in headless mode (true|false) [default: true]"
    echo "  browser      Browser to use (chromium|firefox|webkit|all) [default: chromium]"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run in development with default settings"
    echo "  $0 development false chromium         # Run in development with browser UI"
    echo "  $0 staging true all                   # Run in staging across all browsers"
    echo "  $0 production                         # Run in production environment"
    exit 0
fi

# Run main function
main "$@"
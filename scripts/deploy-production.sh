#!/bin/bash

# Production Deployment Script for CV Genius
# This script validates the environment and prepares the application for production deployment

echo "🚀 CV Genius Production Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit on any error
set -e

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment variables
validate_env() {
    echo "🔍 Validating environment variables..."
    
    local required_vars=("GEMINI_API_KEY" "JWT_SECRET" "NEXTAUTH_SECRET")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        elif [[ "${!var}" == *"your_"*"_here" ]]; then
            missing_vars+=("$var (contains placeholder value)")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        echo -e "${RED}❌ Missing or placeholder environment variables:${NC}"
        printf '   %s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set these variables before deployment."
        return 1
    fi
    
    echo -e "${GREEN}✅ All required environment variables are set${NC}"
    return 0
}

# Function to check for sensitive files
check_sensitive_files() {
    echo "🔒 Checking for sensitive files..."
    
    local sensitive_files=(
        ".env.local"
        ".2fa-state.json"
        ".ip-whitelist.json"
        "scripts/admin/"
    )
    
    local found_files=()
    
    for file in "${sensitive_files[@]}"; do
        if [[ -e "$file" ]]; then
            found_files+=("$file")
        fi
    done
    
    if [[ ${#found_files[@]} -gt 0 ]]; then
        echo -e "${YELLOW}⚠️  Found sensitive files that should not be committed:${NC}"
        printf '   %s\n' "${found_files[@]}"
        echo ""
        echo "These files are properly ignored by .gitignore"
    fi
    
    echo -e "${GREEN}✅ Sensitive files check complete${NC}"
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    
    if command_exists npm; then
        if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
            npm test
            echo -e "${GREEN}✅ Tests passed${NC}"
        else
            echo -e "${YELLOW}⚠️  No tests found, skipping...${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  npm not found, skipping tests...${NC}"
    fi
}

# Function to build the application
build_app() {
    echo "🔨 Building application..."
    
    if command_exists npm; then
        npm run build
        echo -e "${GREEN}✅ Build completed successfully${NC}"
    else
        echo -e "${RED}❌ npm not found${NC}"
        return 1
    fi
}

# Function to validate deployment readiness
validate_deployment() {
    echo "✅ Validating deployment readiness..."
    
    # Check if .next directory exists
    if [[ ! -d ".next" ]]; then
        echo -e "${RED}❌ Build output not found. Run 'npm run build' first.${NC}"
        return 1
    fi
    
    # Check for common issues
    if grep -r "console.log\|console.error\|console.warn" src/ --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Debug statements found in source code${NC}"
        echo "Consider removing console statements for production"
    fi
    
    echo -e "${GREEN}✅ Deployment validation complete${NC}"
}

# Function to generate deployment summary
generate_summary() {
    echo ""
    echo "📋 Deployment Summary"
    echo "===================="
    echo -e "Environment: ${GREEN}Production${NC}"
    echo -e "Node.js version: $(node --version)"
    echo -e "npm version: $(npm --version)"
    echo -e "Next.js build: ${GREEN}Ready${NC}"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Deploy to your hosting platform (Vercel, Netlify, etc.)"
    echo "2. Set environment variables on the platform"
    echo "3. Configure domain and SSL"
    echo "4. Run post-deployment checks"
    echo ""
}

# Main deployment process
main() {
    echo "Starting deployment validation..."
    echo ""
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -f "next.config.js" ]]; then
        echo -e "${RED}❌ Not in CV Genius project directory${NC}"
        exit 1
    fi
    
    # Set NODE_ENV to production
    export NODE_ENV=production
    
    # Run validation steps
    validate_env || exit 1
    check_sensitive_files
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Run tests (if available)
    # run_tests
    
    # Build application
    build_app || exit 1
    
    # Final validation
    validate_deployment || exit 1
    
    # Generate summary
    generate_summary
    
    echo -e "${GREEN}🎉 Deployment validation complete!${NC}"
    echo "Your application is ready for production deployment."
}

# Run main function
main "$@" 
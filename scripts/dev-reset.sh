#!/bin/bash

# CV Genius - Development Reset Script
# Prevents cache-related template issues

echo "🚀 Starting CV Genius Development Reset..."

# 1. Kill all Next.js processes
echo "⏹️  Stopping all Next.js processes..."
pkill -f "next dev" || echo "No running Next.js processes found"
pkill -f "node.*next" || echo "No Node Next processes found"

# 2. Clear all Next.js caches
echo "🧹 Clearing Next.js caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# 3. Clear npm cache (if needed)
echo "🧹 Clearing npm cache..."
npm cache clean --force

# 4. Verify critical files exist
echo "✅ Verifying critical template files..."
FILES_TO_CHECK=(
    "src/components/ui/dropdown-menu.tsx"
    "src/lib/irish-cv-template-manager.ts"
    "src/components/cv/template-thumbnail.tsx"
    "src/app/builder/web/components/template-gallery.tsx"
)

MISSING_FILES=()
for file in "${FILES_TO_CHECK[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo "❌ Missing critical files:"
    printf '%s\n' "${MISSING_FILES[@]}"
    exit 1
fi

# 5. Check dependencies
echo "📦 Checking critical dependencies..."
REQUIRED_DEPS=(
    "@radix-ui/react-dropdown-menu"
    "framer-motion"
    "lucide-react"
)

for dep in "${REQUIRED_DEPS[@]}"; do
    if ! npm list "$dep" >/dev/null 2>&1; then
        echo "❌ Missing dependency: $dep"
        echo "Installing $dep..."
        npm install "$dep"
    fi
done

# 6. Port cleanup
echo "🔌 Checking port availability..."
if lsof -ti:3000 >/dev/null; then
    echo "⚠️  Port 3000 is in use. Killing processes..."
    lsof -ti:3000 | xargs kill -9
fi

# 7. Start development server
echo "🚀 Starting clean development server..."
sleep 2
npm run dev &

# 8. Wait for server and test
echo "⏳ Waiting for server to start..."
sleep 5

# Test if server is responding
if curl -s http://localhost:3000 >/dev/null; then
    echo "✅ Server is running at http://localhost:3000"
    echo "✅ Builder available at http://localhost:3000/builder"
else
    echo "❌ Server failed to start properly"
    exit 1
fi

echo "🎉 Development reset complete!"
echo "📝 Next steps:"
echo "   1. Open http://localhost:3000/builder"
echo "   2. Hard refresh browser (Cmd+Shift+R)"
echo "   3. Check DevTools console for errors" 
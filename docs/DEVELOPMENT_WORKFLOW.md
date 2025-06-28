# CV Genius - Development Workflow & Issue Prevention

## 🎯 **Purpose**
This document outlines the development workflow to prevent template visibility issues, cache conflicts, and other recurring problems.

## ⚡ **Quick Start Commands**

### Start Development (Clean)
```bash
# Use the development reset script for a clean start
chmod +x scripts/dev-reset.sh
./scripts/dev-reset.sh
```

### Manual Clean Start
```bash
# 1. Kill all processes
pkill -f "next dev"

# 2. Clear all caches  
rm -rf .next && rm -rf node_modules/.cache && rm -rf .swc

# 3. Start development
npm run dev
```

## 🛡️ **Issue Prevention Checklist**

### Before Starting Development
- [ ] Check if port 3000 is free: `lsof -ti:3000`
- [ ] Verify critical files exist (see File Checklist below)
- [ ] Ensure dependencies are installed: `npm install`
- [ ] Clear browser cache if switching projects

### File Checklist - Critical Template Files
```bash
✅ Required Files:
- src/components/ui/dropdown-menu.tsx
- src/lib/irish-cv-template-manager.ts  
- src/components/cv/template-thumbnail.tsx
- src/app/builder/web/components/template-gallery.tsx
- src/components/cv/templates/classic-template.tsx
- src/lib/template-health-checker.ts
- src/components/cv/template-error-boundary.tsx
```

## 🔧 **Common Issues & Solutions**

### Issue 1: Templates Not Showing
**Symptoms:** Empty template gallery, no template previews
**Causes:** Cache conflicts, missing dependencies, port switching
**Solutions:**
```bash
# Solution A - Browser Fix
1. Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
2. Clear browser storage: F12 → Application → Storage → Clear
3. Disable browser extensions temporarily

# Solution B - Development Reset  
./scripts/dev-reset.sh

# Solution C - Manual Cache Clear
rm -rf .next && rm -rf node_modules/.cache && npm run dev
```

### Issue 2: Missing Dependencies Error
**Symptoms:** `Module not found: Can't resolve '@/components/ui/dropdown-menu'`
**Solutions:**
```bash
# Install missing dependencies
npm install @radix-ui/react-dropdown-menu framer-motion lucide-react

# Verify installation
npm list @radix-ui/react-dropdown-menu
```

### Issue 3: Port Conflicts
**Symptoms:** `EADDRINUSE: address already in use :::3000`
**Solutions:**
```bash
# Find and kill processes on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Issue 4: Template Rendering Errors
**Symptoms:** Error boundaries triggered, white screens
**Solutions:**
```bash
# Check template health
npm run dev
# Then in browser console: window.templateHealthChecker.checkHealth()

# Auto-repair
# Go to http://localhost:3000/builder - error boundary will auto-repair
```

## 🔍 **Debugging Tools**

### Template Health Checker
```javascript
// In browser console (development mode)
// Quick health check
window.templateHealthChecker.quickCheck()

// Full health report  
window.templateHealthChecker.checkHealth().then(console.log)

// Generate detailed report
window.templateHealthChecker.generateReport().then(console.log)

// Auto-repair issues
window.templateHealthChecker.autoRepair().then(console.log)
```

### Development Console Commands
```bash
# Check if templates are loading
curl -s http://localhost:3000/builder | grep -i "template"

# Test API endpoints
curl -s http://localhost:3000/api/ads/config

# Check running processes
ps aux | grep "next dev"

# Monitor build logs
npm run build 2>&1 | head -20
```

## 📱 **Browser Testing Workflow**

### Testing Checklist
1. **Desktop Testing:**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest) 
   - [ ] Safari (latest)
   - [ ] Edge (latest)

2. **Mobile Testing:**
   - [ ] Chrome Mobile
   - [ ] Safari Mobile
   - [ ] Firefox Mobile

3. **Template Gallery Testing:**
   - [ ] All templates visible
   - [ ] Template previews load
   - [ ] Template selection works
   - [ ] Live preview updates
   - [ ] Export functionality works

### Browser Cache Management
```javascript
// Clear specific storage keys
localStorage.removeItem('cvgenius-template')
localStorage.removeItem('cvgenius-cv-data')
sessionStorage.clear()

// Clear all application storage
// F12 → Application → Storage → Clear storage → Clear site data
```

## 🚀 **Deployment Checklist**

### Pre-deployment
- [ ] Run `npm run build` successfully
- [ ] Test all templates in production build
- [ ] Verify error boundaries work
- [ ] Check console for warnings/errors
- [ ] Test on multiple devices/browsers

### Post-deployment
- [ ] Verify templates load on production
- [ ] Test template selection
- [ ] Check export functionality
- [ ] Monitor error logs

## 📊 **Monitoring & Health Checks**

### Automated Health Checks
The system includes automatic health monitoring:

1. **Component Level:** Error boundaries catch and report issues
2. **Template Level:** Health checker validates template system
3. **Browser Level:** Console warnings for development issues

### Manual Health Checks
```bash
# Check server status
curl -I http://localhost:3000/builder

# Verify template system
curl -s http://localhost:3000/builder | grep -c "template"

# Test API endpoints
curl -s http://localhost:3000/api/ai/analyze-cv

# Monitor server logs
npm run dev | grep -E "(error|warn|Template)"
```

## 🔄 **Version Control Best Practices**

### Before Committing
- [ ] Test template system works
- [ ] Run `npm run build` successfully  
- [ ] Clear caches and test clean start
- [ ] Update this documentation if workflow changes

### After Pulling Changes
- [ ] Run `./scripts/dev-reset.sh`
- [ ] Check for new dependencies: `npm install`
- [ ] Test template gallery loads
- [ ] Verify no console errors

## 🆘 **Emergency Recovery**

If everything breaks:

```bash
# Nuclear option - complete reset
git status
git stash  # Save current work
rm -rf node_modules
rm -rf .next
rm -rf .swc
npm install
./scripts/dev-reset.sh
```

## 📞 **Support Contacts**

- **Template Issues:** Check template-health-checker logs first
- **Cache Issues:** Use dev-reset script
- **Build Issues:** Check Node.js version compatibility
- **Browser Issues:** Test in incognito mode first

---

## 📝 **Quick Reference Commands**

```bash
# Start clean development
./scripts/dev-reset.sh

# Manual cache clear
rm -rf .next && rm -rf node_modules/.cache && npm run dev

# Kill port 3000 processes
lsof -ti:3000 | xargs kill -9

# Check template health (in browser console)
window.templateHealthChecker.checkHealth()

# Hard refresh browser
Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

**Remember:** Most template visibility issues are cache-related and can be solved with a clean restart! 🎯 
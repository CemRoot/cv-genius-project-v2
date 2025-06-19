# Mobile Components Library Guide

## Overview
Complete mobile-first UI component library for CV Genius with touch gestures, responsive layouts, and performance optimization.

## 🎯 Core Mobile Components

### 1. Mobile Bottom Sheet
```tsx
import { MobileBottomSheet } from '@/components/mobile'

<MobileBottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Settings"
  height="half" // auto | half | full
>
  <div>Bottom sheet content</div>
</MobileBottomSheet>
```

### 2. Mobile Tabs
```tsx
import { MobileTabs } from '@/components/mobile'

<MobileTabs
  tabs={[
    { id: 'tab1', label: 'Overview', icon: <Icon /> },
    { id: 'tab2', label: 'Details', badge: 5 }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="underline" // default | pills | underline
/>
```

### 3. Mobile Pull to Refresh
```tsx
import { MobilePullToRefresh } from '@/components/mobile'

<MobilePullToRefresh
  onRefresh={async () => {
    await fetchData()
  }}
>
  <div>Scrollable content</div>
</MobilePullToRefresh>
```

### 4. Mobile Action Sheet
```tsx
import { MobileActionSheet } from '@/components/mobile'

<MobileActionSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Choose Action"
  options={[
    {
      id: 'edit',
      label: 'Edit',
      icon: <EditIcon />,
      onClick: () => handleEdit()
    },
    {
      id: 'delete',
      label: 'Delete',
      variant: 'destructive',
      onClick: () => handleDelete()
    }
  ]}
/>
```

### 5. Mobile Floating Action Button
```tsx
import { MobileFloatingActionButton } from '@/components/mobile'

<MobileFloatingActionButton
  actions={[
    {
      id: 'add',
      label: 'Add Item',
      icon: <PlusIcon />,
      onClick: () => handleAdd()
    }
  ]}
  position="bottom-right"
/>
```

### 6. Mobile Stepper
```tsx
import { MobileStepper } from '@/components/mobile'

<MobileStepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={handleStepClick}
  variant="progress" // default | progress | dots
  orientation="horizontal" // horizontal | vertical
/>
```

## 🎨 Advanced Layout Components

### 1. Mobile Grid Layout
```tsx
import { MobileGridLayout } from '@/components/mobile'

<MobileGridLayout
  items={[
    {
      id: '1',
      content: <Card />,
      span: 2, // spans 2 columns
      rowSpan: 1
    }
  ]}
  columns={2}
  gap={4}
  animated={true}
/>
```

### 2. Mobile Masonry Layout
```tsx
import { MobileMasonryLayout } from '@/components/mobile'

<MobileMasonryLayout
  items={[
    {
      id: '1',
      content: <VariableHeightCard />,
      height: 200 // optional fixed height
    }
  ]}
  columns={2}
  gap={16}
/>
```

### 3. Mobile Sticky Sections
```tsx
import { MobileStickySections } from '@/components/mobile'

<MobileStickySections
  sections={[
    {
      id: 'section1',
      title: 'Overview',
      content: <SectionContent />,
      stickyHeader: true
    }
  ]}
  activeHeaderColor="bg-cvgenius-purple text-white"
/>
```

### 4. Mobile Parallax Layout
```tsx
import { 
  MobileParallaxLayout, 
  ParallaxBackground, 
  ParallaxContent 
} from '@/components/mobile'

<MobileParallaxLayout
  height="100vh"
  layers={[
    {
      id: 'bg',
      content: <ParallaxBackground src="/hero-bg.jpg" overlay />,
      speed: 0.5,
      zIndex: 0
    },
    {
      id: 'content',
      content: (
        <ParallaxContent centered>
          <h1>Hero Title</h1>
        </ParallaxContent>
      ),
      speed: 0,
      zIndex: 1
    }
  ]}
/>
```

### 5. Mobile Infinite Scroll
```tsx
import { MobileInfiniteScroll } from '@/components/mobile'

<MobileInfiniteScroll
  items={items}
  renderItem={(item, index) => <ItemCard key={item.id} item={item} />}
  loadMore={async () => {
    const newItems = await fetchMoreItems()
    setItems(prev => [...prev, ...newItems])
    return newItems
  }}
  hasMore={hasMore}
  loading={loading}
  threshold={200}
/>
```

## 🎮 Touch Gesture Components

### Touch Gesture Wrapper
```tsx
import { TouchGestureWrapper } from '@/components/mobile'

<TouchGestureWrapper
  onSwipeLeft={() => console.log('Swiped left')}
  onSwipeRight={() => console.log('Swiped right')}
  onPinch={({ scale }) => console.log('Pinched:', scale)}
  onLongPress={() => console.log('Long pressed')}
  onDoubleTap={() => console.log('Double tapped')}
>
  <div>Swipeable content</div>
</TouchGestureWrapper>
```

### Swipe Navigation
```tsx
import { SwipeNavigation } from '@/components/mobile'

<SwipeNavigation
  items={[
    { id: '1', content: <Page1 /> },
    { id: '2', content: <Page2 /> },
    { id: '3', content: <Page3 /> }
  ]}
  currentIndex={currentIndex}
  onIndexChange={setCurrentIndex}
  showIndicators={true}
  autoPlay={false}
/>
```

## 🪝 Mobile Hooks

### 1. Mobile Keyboard Hook
```tsx
import { useMobileKeyboard } from '@/components/mobile'

const { 
  isKeyboardOpen, 
  keyboardHeight, 
  adjustedViewHeight 
} = useMobileKeyboard()
```

### 2. Mobile Orientation Hook
```tsx
import { useMobileOrientation } from '@/components/mobile'

const { 
  orientation, 
  isPortrait, 
  isLandscape, 
  angle 
} = useMobileOrientation()
```

### 3. Mobile File Upload Hook
```tsx
import { useMobileFileUpload } from '@/components/mobile'

const { 
  uploadFile, 
  isUploading, 
  progress, 
  error 
} = useMobileFileUpload({
  accept: 'image/*',
  maxSize: 5 * 1024 * 1024, // 5MB
  onSuccess: (url) => console.log('Uploaded:', url)
})
```

### 4. Mobile Performance Hook
```tsx
import { useMobilePerformance } from '@/components/mobile'

const { 
  connectionType, 
  effectiveType, 
  isSlowConnection, 
  saveData 
} = useMobilePerformance()
```

## 🎨 Styling Guidelines

### CSS Custom Properties
```css
:root {
  --mobile-safe-area-top: env(safe-area-inset-top);
  --mobile-safe-area-bottom: env(safe-area-inset-bottom);
  --mobile-vh: 100vh; /* Dynamically updated */
}
```

### Mobile-First Classes
```css
.mobile-container {
  @apply px-4 py-2 md:px-6 md:py-4;
}

.mobile-text {
  @apply text-sm md:text-base;
}

.mobile-touch-target {
  @apply min-h-[44px] min-w-[44px];
}
```

## 📱 Best Practices

### 1. Touch Targets
- Minimum 44px x 44px for touch targets
- Add padding around interactive elements
- Use appropriate spacing between touchable items

### 2. Performance
- Use `useMobilePerformance` to adapt to connection speed
- Implement lazy loading for images and content
- Use `MobileInfiniteScroll` instead of pagination

### 3. Gestures
- Provide visual feedback for touch interactions
- Support standard mobile gestures (swipe, pinch, etc.)
- Always provide alternative navigation methods

### 4. Responsive Design
- Start with mobile-first approach
- Use mobile hooks to adapt behavior
- Test on various screen sizes and orientations

### 5. Accessibility
- Ensure proper focus management
- Add ARIA labels for mobile-specific interactions
- Support voice control and screen readers

## 🔧 Configuration

### Tailwind Mobile Extensions
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      height: {
        'mobile-vh': 'var(--mobile-vh)',
        'mobile-safe': 'calc(100vh - var(--mobile-safe-area-top) - var(--mobile-safe-area-bottom))'
      },
      spacing: {
        'safe-top': 'var(--mobile-safe-area-top)',
        'safe-bottom': 'var(--mobile-safe-area-bottom)'
      }
    }
  }
}
```

## 🚀 Getting Started

1. **Import components:**
   ```tsx
   import { MobileBottomSheet, MobileTabs } from '@/components/mobile'
   ```

2. **Use mobile hooks:**
   ```tsx
   const { isKeyboardOpen } = useMobileKeyboard()
   ```

3. **Apply mobile-first styling:**
   ```tsx
   className="mobile-container mobile-text"
   ```

4. **Test on mobile devices:**
   - Use browser dev tools mobile simulation
   - Test on real devices
   - Verify touch interactions work properly

This library provides everything needed for a professional mobile experience in your CV Genius application.
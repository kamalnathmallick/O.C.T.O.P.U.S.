# Dashboard Layout & Theme Standardization Guide

## 🎯 Objective
Fix all dashboard pages to eliminate duplicate headers, ensure full-width layout, and implement proper light/dark theme contrast.

## 📋 Pages Requiring Fix

### ✅ Already Fixed (2/13)
- [x] frontend/app/dashboard/machines/page.tsx
- [x] frontend/app/dashboard/sensors/page.tsx

### ⏳ Needs Fixing (10/13)
- [ ] frontend/app/dashboard/alerts/page.tsx
- [ ] frontend/app/dashboard/analytics/page.tsx
- [ ] frontend/app/dashboard/maintenance/page.tsx
- [ ] frontend/app/dashboard/predictions/page.tsx
- [ ] frontend/app/dashboard/reports/page.tsx
- [ ] frontend/app/dashboard/users/page.tsx
- [ ] frontend/app/dashboard/settings/page.tsx
- [ ] frontend/app/dashboard/help/page.tsx
- [ ] frontend/app/dashboard/support/page.tsx
- [ ] frontend/app/dashboard/notifications/page.tsx

### ✅ No Fix Needed (1/13)
- [x] frontend/app/dashboard/page.tsx (main dashboard - already correct)

## 🔧 Standard Fix Pattern

### Step 1: Remove DashboardLayout Import
```typescript
// ❌ REMOVE THIS
import DashboardLayout from '@/app/dashboard/layout';
```

### Step 2: Remove DashboardLayout Wrapper
```typescript
// ❌ REMOVE THIS
return (
  <DashboardLayout>
    <div className="space-y-6">
      {/* content */}
    </div>
  </DashboardLayout>
);

// ✅ REPLACE WITH THIS
return (
  <div className="space-y-6 w-full max-w-full">
    {/* content */}
  </div>
);
```

### Step 3: Update Loading State
```typescript
// ❌ REMOVE THIS
if (loading) {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );
}

// ✅ REPLACE WITH THIS
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}
```

### Step 4: Update All Color Classes

#### Text Colors
```typescript
// ❌ Dark mode only
text-white → text-gray-900 dark:text-white
text-slate-400 → text-gray-600 dark:text-slate-400
text-slate-500 → text-gray-500 dark:text-slate-500
text-slate-600 → text-gray-600 dark:text-slate-600
```

#### Background Colors
```typescript
// ❌ Dark mode only
bg-slate-800 → bg-white dark:bg-slate-800
bg-slate-800/50 → bg-white dark:bg-slate-800/50
bg-slate-900 → bg-gray-50 dark:bg-slate-900
bg-slate-700 → bg-gray-100 dark:bg-slate-700
```

#### Border Colors
```typescript
// ❌ Dark mode only
border-slate-700 → border-gray-200 dark:border-slate-700
border-slate-700/50 → border-gray-200 dark:border-slate-700/50
border-slate-600 → border-gray-300 dark:border-slate-600
```

#### Input/Select Styles
```typescript
// ❌ Dark mode only
className="bg-slate-800 border border-slate-700 text-white"

// ✅ Light + Dark mode
className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white"
```

#### Card Styles
```typescript
// ❌ Dark mode only
className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"

// ✅ Light + Dark mode
className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md transition-all"
```

#### Status Colors (Keep vibrant in both modes)
```typescript
// Healthy
bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400

// Warning
bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400

// Critical
bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400

// Info
bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400
```

## 🎨 Complete Color Reference

### Light Mode Theme
```css
/* Canvas */
bg-gray-50          /* Main background */
bg-white            /* Cards, panels */
bg-gray-100         /* Secondary backgrounds */

/* Text */
text-gray-900       /* Primary text */
text-gray-700       /* Secondary text */
text-gray-600       /* Tertiary text */
text-gray-500       /* Muted text */

/* Borders */
border-gray-200     /* Primary borders */
border-gray-300     /* Hover borders */

/* Shadows */
shadow-sm           /* Card shadows */
shadow-md           /* Hover shadows */
```

### Dark Mode Theme
```css
/* Canvas */
dark:bg-slate-900   /* Main background */
dark:bg-slate-800   /* Cards, panels */
dark:bg-slate-700   /* Secondary backgrounds */

/* Text */
dark:text-white     /* Primary text */
dark:text-slate-300 /* Secondary text */
dark:text-slate-400 /* Tertiary text */
dark:text-slate-500 /* Muted text */

/* Borders */
dark:border-slate-700  /* Primary borders */
dark:border-slate-600  /* Hover borders */

/* Shadows */
dark:shadow-slate-900/50  /* Card shadows */
```

## 🔍 Quality Checklist

For each page, verify:

### Layout
- [ ] No `import DashboardLayout` statement
- [ ] No `<DashboardLayout>` wrapper
- [ ] Root div has `w-full max-w-full`
- [ ] Content stretches full width
- [ ] No horizontal scrolling

### Theme - Light Mode
- [ ] Background is light gray/white
- [ ] Cards are white with subtle borders
- [ ] Text is dark gray/black
- [ ] All text is readable
- [ ] Hover states are visible

### Theme - Dark Mode
- [ ] Background is dark slate
- [ ] Cards are semi-transparent slate
- [ ] Text is white/light gray
- [ ] All text is readable
- [ ] Hover states are visible

### Responsive
- [ ] Works on mobile (< 640px)
- [ ] Works on tablet (640px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Sidebar collapses on mobile
- [ ] Content adapts to screen size

## 🚀 Quick Fix Script

Use this find-and-replace pattern in each file:

1. **Remove import:**
   - Find: `import DashboardLayout from '@/app/dashboard/layout';`
   - Replace: *(delete line)*

2. **Update return wrapper:**
   - Find: `<DashboardLayout>`
   - Replace: *(delete)*
   - Find: `</DashboardLayout>`
   - Replace: *(delete)*

3. **Update root div:**
   - Find: `<div className="space-y-6">`
   - Replace: `<div className="space-y-6 w-full max-w-full">`

4. **Batch color updates:**
   ```
   text-white → text-gray-900 dark:text-white
   text-slate-400 → text-gray-600 dark:text-slate-400
   bg-slate-800/50 → bg-white dark:bg-slate-800/50
   bg-slate-800 → bg-white dark:bg-slate-800
   border-slate-700/50 → border-gray-200 dark:border-slate-700/50
   border-slate-700 → border-gray-200 dark:border-slate-700
   ```

## 📊 Progress Tracking

### Phase 1: Core Pages (High Priority)
- [x] Machines
- [x] Sensors
- [ ] Alerts
- [ ] Maintenance
- [ ] Analytics

### Phase 2: Management Pages (Medium Priority)
- [ ] Users
- [ ] Settings
- [ ] Predictions
- [ ] Reports

### Phase 3: Support Pages (Low Priority)
- [ ] Help
- [ ] Support
- [ ] Notifications

## ✅ Verification Steps

After fixing each page:

1. **Visual Test:**
   - Open page in browser
   - Toggle between Light/Dark/System themes
   - Verify no duplicate headers
   - Verify full-width layout
   - Check text contrast

2. **Responsive Test:**
   - Resize browser window
   - Test on mobile viewport
   - Verify sidebar collapse
   - Check content reflow

3. **Interaction Test:**
   - Test all buttons
   - Test all inputs
   - Test hover states
   - Test focus states

## 🎯 Success Criteria

A page is considered "fixed" when:
- ✅ No duplicate headers
- ✅ Full-width layout (no right-side clipping)
- ✅ Perfect contrast in light mode
- ✅ Perfect contrast in dark mode
- ✅ Instant theme switching (no refresh)
- ✅ Responsive on all screen sizes
- ✅ All interactive elements work
- ✅ No console errors

## 📝 Notes

- The layout is automatically applied by Next.js App Router
- Pages should NEVER import or wrap themselves in DashboardLayout
- All pages share the same sidebar and header from layout.tsx
- Theme state is global and persists across navigation
- Use semantic color classes for automatic theme switching
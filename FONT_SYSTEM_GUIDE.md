# ShelfCue Font System Guide

## 📚 Overview

Your ShelfCue application now has a comprehensive font system that supports:
- **Custom Local Font**: Satoshi (your brand font)
- **Google Fonts**: 9 popular fonts loaded on-demand
- **System Fonts**: 4 safe fallback fonts

## 🎨 Available Fonts

### Custom Font (Local)
1. **Satoshi** ✨ *Default*
   - Your custom brand font
   - All weights: Light (300), Regular (400), Medium (500), Bold (700), Black (900)
   - Includes italic variants
   - Loaded locally from `/public/fonts/`

### Google Fonts (Dynamic Loading)
2. **Inter** - Clean, modern sans-serif
3. **Roboto** - Google's signature font
4. **Open Sans** - Friendly and open
5. **Lato** - Elegant sans-serif
6. **Montserrat** - Geometric sans-serif
7. **Poppins** - Rounded and friendly
8. **Raleway** - Elegant display font
9. **Playfair Display** - Elegant serif
10. **Merriweather** - Readable serif

### System Fonts (No Loading Required)
11. **System UI** - Native system font
12. **Georgia** - Classic serif
13. **Times New Roman** - Traditional serif
14. **Arial** - Classic sans-serif
15. **Helvetica** - Classic sans-serif

## 🚀 How It Works

### 1. Font Configuration (`src/lib/fonts.ts`)

The font system is centrally managed with:

```typescript
export const availableFonts = [
  { value: 'Satoshi', label: 'Satoshi', type: 'local' },
  { value: 'Inter', label: 'Inter', type: 'google' },
  // ... more fonts
]
```

**Font Types:**
- `local`: Loaded from your server
- `google`: Dynamically loaded from Google Fonts CDN
- `system`: Native system fonts (no loading needed)

### 2. Dynamic Font Loading

**For Form Builder Preview:**
When a user selects a Google Font in the theme editor, it's automatically loaded:

```typescript
useEffect(() => {
  if (font?.type === 'google') {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:300,400,500,600,700&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
}, [fontFamily])
```

**For Public Forms:**
The `FontLoader` component handles font loading on public form pages:

```tsx
<FontLoader fontFamily={formData.theme.fontFamily} />
```

### 3. Font Application

Fonts are applied via inline styles using the `getFontFamily()` utility:

```typescript
style={{ fontFamily: getFontFamily(formData.theme.fontFamily) }}
```

This ensures proper fallback chains:
- Google fonts: `'Font Name', sans-serif`
- Local fonts: `Satoshi, sans-serif`
- System fonts: `Font Name, sans-serif`

## 📝 Usage Guide

### For Form Creators

1. **Open Form Builder** → Go to "Theme" tab
2. **Select Font Family** → Choose from dropdown
3. **See Live Preview** → Font loads automatically
4. **Save & Publish** → Font works on public form

### For Developers

**Adding a New Google Font:**

1. Update `src/lib/fonts.ts`:
```typescript
export const availableFonts = [
  // ... existing fonts
  { value: 'Your Font', label: 'Your Font', type: 'google' },
]
```

2. That's it! The font will:
   - ✅ Appear in the theme editor dropdown
   - ✅ Load automatically in preview
   - ✅ Work on public forms
   - ✅ Show proper loading indicator

**Adding a New Local Font:**

1. Add font files to `/public/fonts/`
2. Update `src/app/layout.tsx`:
```typescript
const yourFont = localFont({
  src: [
    { path: "../../public/fonts/YourFont-Regular.otf", weight: "400" },
    // ... more weights
  ],
  variable: "--font-your-font",
})
```

3. Add to `availableFonts`:
```typescript
{ value: 'YourFont', label: 'Your Font', type: 'local' }
```

4. Update `getFontFamily()` to handle it

## 🎯 Performance Optimizations

### 1. Preconnect to Google Fonts
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
```
✅ Reduces DNS lookup time

### 2. On-Demand Loading
- Google Fonts only load when selected
- Each font loads only once (cached in DOM)
- Multiple weights loaded together (300-700)

### 3. Display Swap
```
&display=swap
```
✅ Prevents invisible text (FOIT)
✅ Shows fallback font immediately
✅ Swaps when custom font loads

### 4. Font Subset Loading
Google Fonts automatically:
- ✅ Serves only Latin subset by default
- ✅ Compresses fonts
- ✅ Caches across sites

## 🔧 Technical Details

### Font Loading States

**1. Initial State**
- Satoshi loads immediately (local)
- System fonts available instantly

**2. Font Selection**
- Theme editor detects font type
- If Google Font → creates `<link>` tag
- If system/local → no loading needed

**3. Preview/Public Form**
- `useEffect` checks font type
- Loads Google Font if needed
- Applies font via inline styles

### Font Weight Mapping

All Google Fonts load with these weights:
- **300**: Light
- **400**: Regular (default)
- **500**: Medium
- **600**: Semi-Bold
- **700**: Bold

Use in CSS:
```css
font-weight: 300; /* Light */
font-weight: 400; /* Regular */
font-weight: 500; /* Medium */
font-weight: 600; /* Semi-Bold */
font-weight: 700; /* Bold */
```

### Browser Support

**Local Fonts (Satoshi):**
- ✅ All modern browsers
- ✅ IE11+ with `.otf` format

**Google Fonts:**
- ✅ All modern browsers
- ✅ Automatic format selection (WOFF2, WOFF, TTF)

**System Fonts:**
- ✅ Universal support

## 📊 Font Loading Indicators

In the theme editor, you'll see:
- `✓ Custom font` - Satoshi (local)
- `✓ Loaded from Google Fonts` - Dynamic fonts
- `✓ System font` - Native fonts

## 🐛 Troubleshooting

### Font Not Loading in Preview
**Solution:** Check browser console for errors. Font may be blocked by CORS or ad blockers.

### Font Not Applying to Form
**Solution:** Verify `fontFamily` is set in form theme. Check inline styles in DevTools.

### Google Font Loads Slowly
**Solution:** 
1. Check internet connection
2. Verify preconnect links in `<head>`
3. Font may be cached on second load

### Wrong Font Displaying
**Solution:** 
1. Check `getFontFamily()` returns correct value
2. Verify font name matches exactly
3. Clear browser cache

## 🎨 Best Practices

### For Form Design

1. **Readability First**
   - Use sans-serif for forms (better on screens)
   - Reserve serifs for headlines or long text

2. **Limit Font Families**
   - One font per form is usually best
   - Maximum 2 fonts if you need contrast

3. **Consider Your Audience**
   - Business forms → Professional fonts (Inter, Roboto)
   - Creative forms → Unique fonts (Playfair, Montserrat)
   - Accessibility → High contrast, good spacing

4. **Test on Mobile**
   - Some decorative fonts don't scale well
   - System fonts perform best on mobile

### For Developers

1. **Lazy Loading**
   - Don't preload all Google Fonts
   - Load only when selected

2. **Font Subset**
   - Use only needed character sets
   - Reduces file size significantly

3. **Caching**
   - Check if font already loaded before adding `<link>`
   - Use data attributes to track loaded fonts

4. **Fallbacks**
   - Always provide fallback fonts
   - Match x-height and letter spacing

## 📚 Resources

- [Google Fonts](https://fonts.google.com/)
- [Font Loading Best Practices](https://web.dev/font-best-practices/)
- [Variable Fonts Guide](https://web.dev/variable-fonts/)
- [Next.js Font Optimization](https://nextjs.org/docs/basic-features/font-optimization)

## ✅ Summary

Your font system is now fully functional with:
- ✅ 15 different font options
- ✅ Dynamic Google Font loading
- ✅ Local Satoshi font as default
- ✅ Automatic font loading in previews
- ✅ Font loading on public forms
- ✅ Performance optimizations
- ✅ Type-safe font configuration
- ✅ Visual loading indicators

Users can now create beautifully branded forms with their choice of typography! 🎨✨


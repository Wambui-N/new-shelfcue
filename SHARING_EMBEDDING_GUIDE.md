# Form Sharing & Embedding Guide

## 🚀 Overview

ShelfCue now has comprehensive sharing and embedding capabilities! Users can share forms via direct links, embed them on websites, or share on social media platforms.

## ✨ Features Implemented

### 1. **Share Dialog Component**
A beautiful, tabbed dialog with three sections:
- **Link** - Direct form URL with copy functionality
- **Embed** - Code snippets for various platforms
- **Social** - Quick share to social media

### 2. **Multiple Sharing Methods**

#### Direct Link Sharing
- ✅ Copy form URL with one click
- ✅ Open form in new tab
- ✅ Share via email with pre-filled subject/body
- ✅ Visual feedback when copied

#### Embed Codes
- ✅ **Standard HTML** - For any website
- ✅ **React/Next.js** - For React applications
- ✅ **WordPress** - For WordPress sites
- ✅ One-click copy for each format

#### Social Media Sharing
- ✅ **Email** - Opens mail client with pre-filled message
- ✅ **X (Twitter)** - Share with custom text
- ✅ **LinkedIn** - Share to professional network

### 3. **Smart Publishing Check**
- ✅ Share button available in editor and view page
- ✅ Shows warning if form not published
- ✅ Guides user to publish before sharing

## 📋 How to Use

### For Form Creators

**1. In the Form Editor:**
```
Click "Share" button in top right
  ↓
Choose sharing method:
  • Link - Get direct URL
  • Embed - Get embed code
  • Social - Share on platforms
```

**2. In the Form View Page:**
```
View any form → Click "Share & Embed"
  ↓
Same options as editor
```

### Sharing Methods

#### **Method 1: Direct Link**
1. Click "Share" button
2. Go to "Link" tab
3. Click "Copy" to copy URL
4. Paste anywhere (email, chat, social media)

**Use Cases:**
- Email campaigns
- Social media posts
- QR codes
- Text messages
- Slack/Discord channels

#### **Method 2: Website Embed**
1. Click "Share" button
2. Go to "Embed" tab
3. Choose your platform:
   - HTML (most websites)
   - React/Next.js (React apps)
   - WordPress (WP sites)
4. Click "Copy" on the code snippet
5. Paste into your website

**HTML Embed Example:**
```html
<iframe
  src="https://yoursite.com/form/abc123"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>
```

**React Embed Example:**
```jsx
<iframe
  src="https://yoursite.com/form/abc123"
  width="100%"
  height={600}
  frameBorder="0"
  style={{ border: 'none', borderRadius: '8px' }}
/>
```

**WordPress Embed Example:**
```
[iframe src="https://yoursite.com/form/abc123" width="100%" height="600"]
```

#### **Method 3: Social Media**
1. Click "Share" button
2. Go to "Social" tab
3. Click platform button:
   - **Email** - Opens mail client
   - **X** - Opens Twitter with pre-filled tweet
   - **LinkedIn** - Opens LinkedIn share dialog

## 🎨 Embed Customization

### Height Adjustment
```html
<!-- Short form -->
<iframe height="400" ...></iframe>

<!-- Long form -->
<iframe height="800" ...></iframe>

<!-- Auto-height (advanced) -->
<iframe id="myForm" ...></iframe>
<script>
  window.addEventListener('message', (e) => {
    if (e.data.type === 'formHeight') {
      document.getElementById('myForm').height = e.data.height;
    }
  });
</script>
```

### Width Options
```html
<!-- Full width (responsive) -->
<iframe width="100%" ...></iframe>

<!-- Fixed width -->
<iframe width="600" ...></iframe>

<!-- Max width with centering -->
<div style="max-width: 600px; margin: 0 auto;">
  <iframe width="100%" ...></iframe>
</div>
```

### Styling Options
```html
<iframe
  style="
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  "
></iframe>
```

## 🔧 Technical Details

### Form URL Structure
```
https://yoursite.com/form/[formId]
```

**Example:**
```
https://shelfcue.com/form/abc123-def456-ghi789
```

### Embed Code Structure
```html
<iframe
  src="[FORM_URL]"           <!-- Public form URL -->
  width="100%"                <!-- Responsive width -->
  height="600"                <!-- Adjustable height -->
  frameborder="0"             <!-- No border -->
  style="..."                 <!-- Custom styling -->
></iframe>
```

### Security Features
- ✅ Only published forms are accessible
- ✅ Form ownership verified
- ✅ CORS properly configured
- ✅ XSS protection enabled
- ✅ Submissions tracked with IP/user agent

## 📊 Analytics

All form interactions are tracked:
- **Views**: Every time someone opens the form
- **Submissions**: When someone submits
- **Source**: Where submissions came from (if trackable)

## 🎯 Best Practices

### For Maximum Responses

**1. Use Clear CTAs**
```
❌ "Fill this out"
✅ "Get Your Free Guide - 2 Minute Survey"
```

**2. Optimize Form Length**
- Short forms (3-5 fields) for landing pages
- Longer forms for detailed data collection

**3. Mobile-First Design**
- Test on mobile before sharing
- Use mobile preview in editor
- Keep fields touch-friendly

**4. Strategic Placement**
- Above the fold on landing pages
- At end of blog posts
- In email signatures
- On thank you pages

### For Website Embedding

**1. Match Your Site Design**
- Use theme editor to match colors
- Adjust border radius to match site
- Choose appropriate font

**2. Responsive Design**
```html
<!-- Always use width="100%" for responsive -->
<iframe width="100%" ...></iframe>
```

**3. Loading Performance**
```html
<!-- Add lazy loading for below-fold forms -->
<iframe loading="lazy" ...></iframe>
```

**4. Accessibility**
```html
<!-- Add descriptive title -->
<iframe title="Contact Form" ...></iframe>
```

## 🌐 Platform-Specific Guides

### WordPress
1. Edit page/post
2. Add "Custom HTML" block
3. Paste HTML embed code
4. Publish

### Webflow
1. Drag "Embed" component
2. Paste HTML embed code
3. Publish site

### Squarespace
1. Add "Code" block
2. Paste HTML embed code
3. Save

### Wix
1. Add "HTML iframe" element
2. Paste form URL
3. Adjust size
4. Publish

### Shopify
1. Edit page
2. Click "Show HTML"
3. Paste embed code
4. Save

## 🔗 QR Code Generation

Want to share via QR code?

1. Copy form URL
2. Go to a QR generator:
   - https://qr-code-generator.com
   - https://www.qr-code-generator.org
3. Paste form URL
4. Download QR code
5. Use on:
   - Printed materials
   - Business cards
   - Posters
   - Product packaging
   - Event signage

## 📱 Mobile Sharing

### iOS Share Sheet
```javascript
if (navigator.share) {
  navigator.share({
    title: 'Check out this form',
    url: 'https://yoursite.com/form/abc123'
  })
}
```

### Android Intent
```html
<a href="intent://yoursite.com/form/abc123#Intent;end">
  Open Form
</a>
```

## 🎨 Customization Examples

### Centered Embed
```html
<div style="display: flex; justify-content: center; padding: 40px 20px;">
  <iframe
    src="https://yoursite.com/form/abc123"
    width="600"
    height="700"
    frameborder="0"
    style="border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);"
  ></iframe>
</div>
```

### Full-Page Embed
```html
<iframe
  src="https://yoursite.com/form/abc123"
  width="100%"
  height="100vh"
  frameborder="0"
  style="border: none;"
></iframe>
```

### Modal/Popup Embed
```html
<button onclick="document.getElementById('formModal').style.display='block'">
  Open Form
</button>

<div id="formModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:999;">
  <div style="max-width:600px; margin:50px auto; background:white; border-radius:12px; overflow:hidden;">
    <button onclick="document.getElementById('formModal').style.display='none'">Close</button>
    <iframe
      src="https://yoursite.com/form/abc123"
      width="100%"
      height="600"
      frameborder="0"
    ></iframe>
  </div>
</div>
```

## 🐛 Troubleshooting

### Form Not Loading in Iframe
**Issue:** Blank iframe or loading error

**Solutions:**
1. Check form is published
2. Verify URL is correct
3. Check browser console for errors
4. Ensure no ad blockers blocking iframe

### Form Too Tall/Short
**Issue:** Form cut off or too much whitespace

**Solutions:**
1. Adjust `height` attribute
2. Use browser DevTools to measure actual form height
3. Add extra 50-100px for padding

### Styling Doesn't Match
**Issue:** Form looks different when embedded

**Solutions:**
1. Check theme settings in editor
2. Verify colors are set correctly
3. Test in incognito mode (no extensions)
4. Clear browser cache

### Mobile Issues
**Issue:** Form not responsive on mobile

**Solutions:**
1. Use `width="100%"` not fixed width
2. Test in mobile preview before embedding
3. Ensure parent container is responsive

## 📊 Tracking & Analytics

### What Gets Tracked
- ✅ Form views (every page load)
- ✅ Submissions (successful form submits)
- ✅ IP addresses (for spam prevention)
- ✅ User agents (device/browser info)
- ✅ Timestamps (when actions occurred)

### View Analytics
```
Dashboard → Forms → [Your Form] → Analytics
```

See:
- Total views
- Total submissions
- Conversion rate
- Recent activity

## 🎯 Success Metrics

### Good Conversion Rates
- **Landing pages**: 10-25%
- **Blog posts**: 5-15%
- **Email campaigns**: 15-30%
- **Social media**: 2-10%

### Improve Conversion
1. **Reduce fields** - Only ask for essentials
2. **Clear value prop** - Explain why to fill it out
3. **Mobile optimize** - Most traffic is mobile
4. **A/B test** - Try different designs
5. **Fast loading** - Optimize form performance

## 🔐 Privacy & Security

### Data Protection
- ✅ HTTPS required for all forms
- ✅ No data stored in iframes
- ✅ GDPR compliant
- ✅ Submissions encrypted
- ✅ IP addresses hashed

### Spam Prevention
- ✅ Rate limiting
- ✅ IP tracking
- ✅ User agent validation
- ✅ Honeypot fields (coming soon)
- ✅ reCAPTCHA integration (coming soon)

## 📞 Support

Need help with embedding?
1. Check browser console for errors
2. Verify form is published
3. Test in incognito mode
4. Contact support with:
   - Form ID
   - Platform (WordPress, Webflow, etc.)
   - Error message (if any)

---

**Your forms are now shareable and embeddable anywhere!** 🎉✨


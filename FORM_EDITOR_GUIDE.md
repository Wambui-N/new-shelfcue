# ShelfCue Form Editor - Complete Guide

## 🎯 Overview

The ShelfCue Form Editor is a powerful, visual form builder integrated into your dashboard. It allows users to create, edit, publish, and embed custom forms with a beautiful, intuitive interface.

## 🚀 Features

### Form Builder
- **Visual Drag-and-Drop**: Reorder fields easily with visual feedback
- **9 Field Types**: text, email, textarea, select, radio, checkbox, number, date, phone
- **Real-time Preview**: See changes instantly as you build
- **Theme Customization**: Brand colors, fonts, and styling
- **Auto-Save**: Never lose your work with automatic save functionality

### Form Management
- **Create New Forms**: Quick form creation from dashboard
- **Edit Existing Forms**: Modify published forms anytime
- **Publish/Unpublish**: Control form visibility
- **Copy Form URLs**: Share forms with a single click
- **Bulk Operations**: Activate/deactivate multiple forms at once

### Form Display
- **Public URLs**: Each form gets a unique public URL
- **Embeddable**: Forms can be embedded on any website
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Custom Themes**: Match your brand with custom colors and styling

### Data Collection
- **Automatic Submissions**: All form submissions are saved to database
- **Real-time Updates**: Dashboard updates instantly when forms are submitted
- **Submission Analytics**: Track views, submissions, and conversion rates
- **Export Data**: Download submission data

## 📁 File Structure

```
src/
├── types/
│   └── form.ts                    # TypeScript interfaces for forms
├── store/
│   └── formStore.ts               # Zustand state management
├── components/
│   └── builder/
│       ├── FormBuilder.tsx        # Main form builder component
│       ├── FieldEditor.tsx        # Field creation and editing
│       ├── FormPreview.tsx        # Live form preview
│       ├── FormSettings.tsx       # Form configuration
│       └── ThemeEditor.tsx        # Theme customization
├── app/
│   ├── dashboard/
│   │   └── forms/
│   │       ├── page.tsx           # Forms list
│   │       ├── new/
│   │       │   └── page.tsx       # Create new form
│   │       └── [formId]/
│   │           ├── page.tsx       # View form
│   │           └── edit/
│   │               └── page.tsx   # Edit form
│   ├── form/
│   │   └── [formId]/
│   │       └── page.tsx           # Public form page
│   └── api/
│       └── submit/
│           └── route.ts           # Form submission API
└── lib/
    └── analytics.ts               # Form analytics tracking
```

## 🎨 Usage Guide

### Creating a New Form

1. Navigate to `/dashboard/forms`
2. Click "Create New Form" button
3. You'll be redirected to the form builder

### Building Your Form

#### Adding Fields
1. Click on any field type button (Text, Email, etc.)
2. The field will be added to your form
3. Configure the field:
   - **Label**: What users will see
   - **Placeholder**: Helper text in the input
   - **Required**: Toggle to make field mandatory
   - **Options**: For select/radio/checkbox fields

#### Reordering Fields
- Use the up/down arrow buttons to move fields
- Or drag fields using the grip handle

#### Editing Fields
1. Click on a field to edit it
2. Change label, placeholder, or other settings
3. For select/radio/checkbox, add/remove options

#### Deleting Fields
1. Click on a field to select it
2. Click the "Delete" button at the bottom
3. Confirm deletion

### Configuring Form Settings

Go to the "Settings" tab to configure:

**Basic Settings**
- Form title and description
- Toggle title/description visibility

**Submit Settings**
- Customize submit button text
- Set success message
- Add redirect URL (optional)

**Advanced Settings**
- Enable email collection
- Allow/prevent multiple submissions

### Customizing Theme

Go to the "Theme" tab to customize:

**Colors**
- Primary color (buttons, accents)
- Background color
- Text color

**Styling**
- Border radius (0-50px)
- Font family selection

**Preview**
- See theme changes in real-time

### Publishing Your Form

1. Click "Publish" in the top right
2. Form status changes to "Published"
3. Form is now accessible via public URL

### Sharing Your Form

1. View your form in the dashboard
2. Click "Copy Link" to get the public URL
3. Share the URL: `https://your-site.com/form/[formId]`

### Embedding Forms

Use the public URL in an iframe:
```html
<iframe 
  src="https://your-site.com/form/[formId]"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

## 🔧 Technical Details

### Form Data Structure

```typescript
interface FormData {
  id: string
  title: string
  description?: string
  status: 'draft' | 'published'
  fields: FormField[]
  theme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    borderRadius: number
    fontFamily: string
  }
  settings: {
    showTitle: boolean
    showDescription: boolean
    submitButtonText: string
    successMessage: string
    redirectUrl?: string
    collectEmail: boolean
    allowMultipleSubmissions: boolean
  }
}
```

### Field Types

```typescript
type FieldType = 
  | 'text'      // Single-line text input
  | 'email'     // Email input with validation
  | 'textarea'  // Multi-line text input
  | 'select'    // Dropdown selection
  | 'radio'     // Radio button group
  | 'checkbox'  // Checkbox group
  | 'number'    // Number input
  | 'date'      // Date picker
  | 'phone'     // Phone number input
```

### State Management

The form builder uses Zustand for state management:
- **formData**: Current form state
- **isDirty**: Has unsaved changes
- **isSaving**: Save operation in progress

### API Endpoints

**Submit Form**
- **POST** `/api/submit`
- **Body**: `{ formId: string, data: Record<string, any> }`
- **Response**: `{ success: boolean, submissionId: string }`

## 🎯 Best Practices

### Form Design
1. Keep forms short and focused
2. Use clear, concise labels
3. Add helpful placeholder text
4. Mark required fields clearly
5. Group related fields together

### Field Configuration
1. Only make essential fields required
2. Use appropriate field types for data
3. Provide clear option labels
4. Add validation where needed

### Theme Customization
1. Match your brand colors
2. Ensure text is readable
3. Use consistent styling
4. Test on mobile devices

### Publishing
1. Test form before publishing
2. Check all fields work correctly
3. Verify success message
4. Test on different devices

## 🐛 Troubleshooting

### Form Not Saving
- Check internet connection
- Ensure you're logged in
- Look for error messages

### Fields Not Appearing
- Refresh the page
- Check browser console for errors
- Verify form data is loading

### Submission Errors
- Ensure form is published
- Check all required fields are filled
- Verify API endpoint is accessible

## 📊 Analytics

Track form performance:
- **Views**: How many times form was viewed
- **Submissions**: Number of successful submissions
- **Conversion Rate**: Submissions / Views
- **Last Submission**: Time of most recent submission

## 🔐 Security

- Forms are user-specific
- Published forms are public
- Submissions track IP and user agent
- Data is stored securely in Supabase

## 🚀 Future Enhancements

- [ ] Conditional logic (show/hide fields based on answers)
- [ ] File upload fields
- [ ] Multi-page forms
- [ ] Advanced validation rules
- [ ] Integration with email services
- [ ] Zapier integration
- [ ] Form templates
- [ ] A/B testing
- [ ] CAPTCHA integration
- [ ] Custom CSS

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review error messages
3. Check browser console
4. Contact support if needed

---

Built with ❤️ using Next.js, React, Tailwind CSS, and Supabase


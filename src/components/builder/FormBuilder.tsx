"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormPreview } from './FormPreview'
import { FieldEditor } from './FieldEditor'
import { FormSettings } from './FormSettings'
import { ThemeEditor } from './ThemeEditor'
import { ShareDialog } from './ShareDialog'
import { useFormStore } from '@/store/formStore'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Share2,
  Settings,
  Palette,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Monitor,
  Smartphone,
  ChevronRight,
  Loader2
} from 'lucide-react'

interface FormBuilderProps {
  onBack: () => void
}

export function FormBuilder({ onBack }: FormBuilderProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { formData, isDirty, isSaving, updateForm, setDirty, setSaving } = useFormStore()
  const [activeTab, setActiveTab] = useState('fields')
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>('')

  // Autosave functionality
  useEffect(() => {
    if (!user || !isDirty) return

    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
    }

    // Set new timeout for autosave (2 seconds after last change)
    autosaveTimeoutRef.current = setTimeout(() => {
      const currentData = JSON.stringify(formData)
      
      // Only save if data actually changed
      if (currentData !== lastSavedDataRef.current) {
        handleSave()
        lastSavedDataRef.current = currentData
      }
    }, 2000)

    // Cleanup
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
    }
  }, [formData, isDirty, user])

  const handleSave = async () => {
    console.log('handleSave called')
    console.log('User:', user ? user.id : 'not authenticated')
    console.log('Form ID:', formData.id)
    
    if (!user) {
      console.error('❌ Cannot save: user not authenticated')
      return null
    }

    setSaving(true)
    setSaveStatus('saving')

    try {
      // Generate new ID if this is a new form without one
      const formId = formData.id || crypto.randomUUID()
      
      console.log('💾 Saving form:', formId, formData.id ? '(existing)' : '(new draft)')
      console.log('Form title:', formData.title)
      console.log('Fields count:', formData.fields?.length)
      
      const saveData = {
        id: formId,
        user_id: user.id,
        title: formData.title || 'Untitled Form',
        description: formData.description || '',
        fields: formData.fields || [],
        status: formData.status || 'draft',
        updated_at: new Date().toISOString()
      }

      // Only include theme and settings if they exist in the database schema
      // Check if form exists first
      if (formData.id) {
        const { data: existingForm } = await supabase
          .from('forms')
          .select('theme, settings')
          .eq('id', formData.id)
          .single()

        // If the columns exist, include them
        if (existingForm && ('theme' in existingForm || 'settings' in existingForm)) {
          Object.assign(saveData, {
            theme: formData.theme,
            settings: formData.settings
          })
        }
      } else {
        // For new forms, always try to include theme and settings
        Object.assign(saveData, {
          theme: formData.theme,
          settings: formData.settings
        })
      }

      console.log('📤 Upserting to Supabase...')
      const { data: savedForm, error } = await supabase
        .from('forms')
        .upsert(saveData)
        .select()
        .single()

      console.log('Upsert response:', { savedForm, error })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      if (!savedForm) {
        console.error('❌ No form data returned from upsert')
        throw new Error('No form data returned from database')
      }

      // Update formData with the saved form ID if it was created
      if (savedForm && savedForm.id && !formData.id) {
        updateForm({ id: savedForm.id })
        console.log('✅ Draft created with ID:', savedForm.id)
        
        // Update the URL to reflect the new draft ID
        router.replace(`/dashboard/forms/${savedForm.id}/edit`)
      }

      console.log('✅ Form saved successfully as', savedForm.status)
      setSaveStatus('saved')
      setDirty(false)
      lastSavedDataRef.current = JSON.stringify(formData)
      setTimeout(() => setSaveStatus('idle'), 2000)

      return savedForm
    } catch (error: any) {
      console.error('Error saving form:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!user) {
      console.error('Cannot publish: user not authenticated')
      return
    }

    let formToPublish = formData

    if (!formData.id) {
      console.error('Cannot publish: form has no ID, saving first...')
      // Try to save the form first to get an ID
      try {
        const savedForm = await handleSave()
        if (!savedForm || !savedForm.id) {
          throw new Error('Failed to create form ID during save')
        }
        formToPublish = { ...formData, id: savedForm.id }
      } catch (error) {
        console.error('Failed to save form before publishing:', error)
        alert('Failed to save form. Please try again.')
        return
      }
    }

    setSaving(true)
    setSaveStatus('saving')

    try {
      console.log('Publishing form:', formToPublish.id || 'new form')
      
      // STEP 1: Force save the form first to ensure it exists in the database
      console.log('Step 1: Saving form to database...')
      console.log('Current form data:', {
        id: formToPublish.id,
        title: formToPublish.title,
        fieldsCount: formToPublish.fields?.length,
        status: formToPublish.status
      })
      
      const savedForm = await handleSave()
      
      console.log('Save result:', savedForm)
      
      if (!savedForm || !savedForm.id) {
        console.error('❌ Save failed - no form returned')
        throw new Error('Failed to save form before publishing. Please try again.')
      }
      
      console.log('✓ Form saved successfully with ID:', savedForm.id)
      console.log('Saved form data:', {
        id: savedForm.id,
        title: savedForm.title,
        status: savedForm.status,
        user_id: savedForm.user_id
      })
      
      // Update formToPublish with the confirmed ID
      formToPublish = { ...formToPublish, id: savedForm.id }

      // STEP 2: Wait for database to ensure record is committed and visible
      console.log('Step 2: Waiting for database consistency...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // STEP 3: Call the enhanced publish API with the confirmed form ID
      console.log('Step 3: Publishing form via API...')
      const publishResponse = await fetch('/api/forms/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: savedForm.id, userId: user.id })
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        console.error('❌ Publish API error:', errorData)
        
        // Handle Google not connected
        if (errorData.code === 'GOOGLE_NOT_CONNECTED') {
          const connectGoogle = confirm(
            '🔗 Connect Google Sheets\n\n' +
            'To publish your form, you need to connect Google Sheets.\n' +
            'All form submissions will automatically sync to your Google Sheets.\n\n' +
            'Click OK to connect Google now.'
          )
          
          if (connectGoogle) {
            // Redirect to Google auth
            window.location.href = '/api/auth/google'
            return
          } else {
            throw new Error('Publishing cancelled - Google Sheets connection required')
          }
        }
        
        // Handle other errors
        if (errorData.code === 'FORM_NOT_FOUND_AFTER_RETRIES') {
          throw new Error('Unable to publish: ' + errorData.details)
        }
        
        throw new Error(errorData.details || errorData.error || 'Failed to publish form')
      }

      const publishResult = await publishResponse.json()
      console.log('✅ Form published successfully with integrations:', publishResult)

      setSaveStatus('saved')
      setIsDirty(false)
      updateForm({ status: 'published' })

      // Show success message with Google Sheets emphasis
      const hasMeeting = formToPublish.fields.some(f => f.type === 'meeting')
      const hasFile = formToPublish.fields.some(f => f.type === 'file')
      
      let message = '🎉 Form Published Successfully!\n'
      
      // Emphasize Google Sheets (core feature)
      if (publishResult.results?.sheet?.created) {
        message += '\n✅ Google Sheet Created'
        message += '\n   Submissions will sync automatically!'
        if (publishResult.results?.sheet?.url) {
          message += '\n\n📊 View Sheet: ' + publishResult.results.sheet.url
        }
      } else if (publishResult.results?.sheet?.connected) {
        message += '\n✅ Connected to Google Sheet'
        message += '\n   Submissions will sync automatically!'
      }
      
      // Additional features
      if (publishResult.results?.drive?.created) {
        message += '\n✅ Drive folder created for file uploads'
      }
      
      if (hasMeeting) message += '\n✅ Meeting booking enabled'
      
      alert(message)

    } catch (error: any) {
      console.error('Publish error:', error)
      setSaveStatus('error')
      alert(`Failed to publish form: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        )
      case 'saved':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Saved
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Retry
          </>
        )
      default:
        return (
          <>
            <Save className="w-4 h-4 mr-2" />
            {isDirty ? 'Save Now' : 'Saved'}
          </>
        )
    }
  }

  const getAutosaveStatus = () => {
    if (saveStatus === 'saving') return 'Saving...'
    if (saveStatus === 'saved') return 'All changes saved'
    if (saveStatus === 'error') return 'Error saving'
    if (isDirty) return 'Autosaving in 2s...'
    return 'All changes saved'
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Compact Header with Breadcrumb */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBack} 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Forms
              </Button>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{formData.title || 'Untitled Form'}</span>
              <div className="flex items-center gap-2 ml-2">
                <Badge variant={formData.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                  {formData.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {saveStatus === 'saving' && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Saved</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-destructive" />
                      <span className="text-destructive">Error</span>
                    </>
                  )}
                  {saveStatus === 'idle' && isDirty && (
                    <>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-orange-600">Unsaved</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {getSaveButtonContent()}
              </Button>

              <Button
                onClick={handlePublish}
                disabled={isSaving || formData.fields.length === 0}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {formData.status === 'published' ? 'Published' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Preview (Larger Width) */}
        <div className="flex-1 border-r border-border overflow-y-auto bg-background-secondary/50">
          <div className="p-6 min-h-full">
            {/* Device Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView('desktop')}
                  className="h-8 px-3"
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView('mobile')}
                  className="h-8 px-3"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center items-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={deviceView}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={deviceView === 'mobile' ? 'w-[375px]' : 'w-full max-w-3xl'}
                >
                  {deviceView === 'mobile' && (
                    <div className="w-[375px] bg-background rounded-xl border border-border shadow-lg overflow-hidden">
                      <div className="p-4">
                        <FormPreview formData={formData} />
                      </div>
                    </div>
                  )}
                  {deviceView === 'desktop' && (
                    <div className="bg-background rounded-xl border border-border shadow-lg p-4 max-w-full">
                      <FormPreview formData={formData} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side - Editor Tabs (Smaller Width) */}
        <div className="w-[420px] flex flex-col bg-background">
          {/* Tab Headers */}
          <div className="flex-shrink-0 bg-background border-b border-border">
            <div className="grid grid-cols-3">
              <button
                onClick={() => setActiveTab('fields')}
                className={`flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                  activeTab === 'fields'
                    ? 'bg-background text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Fields</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-background text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors ${
                  activeTab === 'theme'
                    ? 'bg-background text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Theme</span>
              </button>
            </div>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 p-4" style={{ overflowY: 'scroll', maxHeight: '100%' }}>
            {activeTab === 'fields' && <FieldEditor />}
            {activeTab === 'settings' && <FormSettings />}
            {activeTab === 'theme' && <ThemeEditor />}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        formId={formData.id || ''}
        formTitle={formData.title || 'Untitled Form'}
        formStatus={formData.status}
      />
    </div>
  )
}

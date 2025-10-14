"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStore } from '@/store/formStore'
import { FormBuilder } from '@/components/builder/FormBuilder'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { FormData } from '@/types/form'
import { FormEditSkeleton } from '@/components/skeletons/DashboardSkeleton'

interface EditFormPageProps {
  params: Promise<{ formId: string }>
}

export default function EditFormPage({ params }: EditFormPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { loadForm } = useFormStore()
  const [loading, setLoading] = useState(true)
  const [formId, setFormId] = useState<string>('')

  useEffect(() => {
    const getFormId = async () => {
      const resolvedParams = await params
      setFormId(resolvedParams.formId)
    }
    getFormId()
  }, [params])

  useEffect(() => {
    if (!formId || !user) return

    const fetchForm = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('id', formId)
          .single()

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        if (!data) {
          throw new Error('Form not found')
        }

        console.log('Fetched form data:', data)

        // Check if user owns this form
        if (data.user_id !== user.id) {
          console.error('Unauthorized access to form')
          router.push('/dashboard/forms')
          return
        }

        // Ensure fields have stable unique ids
        const normalizedFields = Array.isArray(data.fields)
          ? data.fields.map((f: any, idx: number) => ({
              ...f,
              id: f?.id && typeof f.id === 'string' ? f.id : `field_${Date.now()}_${idx}`,
            }))
          : []

        // Default theme
        const defaultTheme = {
          primaryColor: '#151419',
          backgroundColor: '#fafafa',
          textColor: '#151419',
          borderRadius: 8,
          fontFamily: 'Inter'
        }

        // Default settings
        const defaultSettings = {
          showTitle: true,
          showDescription: true,
          submitButtonText: 'Submit',
          successMessage: 'Thank you for your submission!',
          collectEmail: false,
          allowMultipleSubmissions: true
        }

        // Load form data with proper structure
        loadForm({
          id: formId,
          title: data.title || 'Untitled Form',
          description: data.description || '',
          status: data.status || 'draft',
          fields: normalizedFields,
          theme: data.theme ? { ...defaultTheme, ...data.theme } : defaultTheme,
          settings: data.settings ? { ...defaultSettings, ...data.settings } : defaultSettings,
          lastSaved: new Date(),
        } as FormData)
      } catch (error: any) {
        console.error('Error fetching form:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          error
        })
        alert('Error loading form: ' + (error?.message || 'Unknown error'))
        router.push('/dashboard/forms')
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [formId, user, loadForm, router])

  const handleBack = () => {
    router.push('/dashboard/forms')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <FormBuilder onBack={handleBack} />
    </div>
  )
}

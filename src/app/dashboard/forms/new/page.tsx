"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStore } from '@/store/formStore'
import { FormBuilder } from '@/components/builder/FormBuilder'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function NewFormPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { resetForm, loadForm } = useFormStore()
  const [isCreating, setIsCreating] = useState(true)

  useEffect(() => {
    if (!user) return

    // Reset form store for new form
    resetForm()

    // Create a new form in the database
    const createNewForm = async () => {
      setIsCreating(true)
      try {
        // First, let's try to create with minimal data
        const { data, error } = await supabase
          .from('forms')
          .insert({
            user_id: user.id,
            title: 'Untitled Form',
            description: '',
            fields: [],
            status: 'draft'
          })
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        console.log('Created form:', data)

        // Load the new form into the store with defaults
        loadForm({
          id: data.id,
          title: data.title || 'Untitled Form',
          description: data.description || '',
          status: data.status || 'draft',
          fields: [],
          theme: {
            primaryColor: '#151419',
            backgroundColor: '#fafafa',
            textColor: '#151419',
            borderRadius: 8,
            fontFamily: 'Inter'
          },
          settings: {
            showTitle: true,
            showDescription: true,
            submitButtonText: 'Submit',
            successMessage: 'Thank you for your submission!',
            collectEmail: false,
            allowMultipleSubmissions: true
          },
          lastSaved: new Date()
        })
      } catch (error: any) {
        console.error('Error creating new form:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          error
        })
        alert('Error creating form: ' + (error?.message || 'Unknown error'))
        router.push('/dashboard/forms')
      } finally {
        setIsCreating(false)
      }
    }

    createNewForm()
  }, [user, router, resetForm, loadForm])

  const handleBack = () => {
    router.push('/dashboard/forms')
  }

  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Creating your form...</p>
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

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStore } from '@/store/formStore'
import { FormBuilder } from '@/components/builder/FormBuilder'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

export default function NewFormEditorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { resetForm, loadForm } = useFormStore()

  useEffect(() => {
    if (!user) return

    // Reset form store for new form (in-memory only, no DB creation yet)
    resetForm()

    // Load a blank form into the store with defaults
    // The form will be created in the database on first save
    loadForm({
      id: '', // No ID yet - will be generated on first save
      title: 'Untitled Form',
      description: '',
      status: 'draft',
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
      lastSaved: null
    })
  }, [user, resetForm, loadForm])

  const handleBack = () => {
    router.push('/dashboard/forms')
  }

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 bg-background">
        <FormBuilder onBack={handleBack} />
      </div>
    </ProtectedRoute>
  )
}

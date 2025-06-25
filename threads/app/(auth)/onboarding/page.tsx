'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface FormData {
  name: string
  username: string
  bio: string
  image: string
}

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    name: (user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : '',
    username: user?.username || '',
    bio: '',
    image: user?.imageUrl || ''
  })

  // Skip username step if user already has one from sign-up
  const shouldSkipUsernameStep = user?.username && user.username.trim() !== ''

  // Initialize image preview when user loads
  useEffect(() => {
    if (user?.imageUrl) {
      setImagePreview(user.imageUrl)
    }
  }, [user?.imageUrl])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setImageFile(file)
      setError('') // Clear any previous errors
      
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    // Reset file input
    const fileInput = document.getElementById('profile-image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      // Skip username step if user already has one
      if (currentStep === 1 && shouldSkipUsernameStep) {
        setCurrentStep(3)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      // Skip username step when going back if user already has one
      if (currentStep === 3 && shouldSkipUsernameStep) {
        setCurrentStep(1)
      } else {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      let imageUrl = user?.imageUrl || ''
      
      // Upload image if user selected one
      if (imageFile) {
        setIsUploadingImage(true)
        try {
          // Convert image to base64 and update Clerk profile
          const reader = new FileReader()
          const imageBase64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(imageFile)
          })

          // Update Clerk user with image
          await user?.setProfileImage({ file: imageFile })
          imageUrl = imageBase64 // Use the uploaded image
        } catch (imageError) {
          console.error('Error uploading image:', imageError)
          setError('Failed to upload image. Continuing without image.')
        } finally {
          setIsUploadingImage(false)
        }
      }
      
      // Update Clerk user - only update fields that might have changed
      const updateData: any = {}
      
      // Only update name if it's different from what's in Clerk
      const currentFullName = (user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : ''
      if (formData.name !== currentFullName) {
        updateData.firstName = formData.name.split(' ')[0]
        updateData.lastName = formData.name.split(' ').slice(1).join(' ')
      }
      
      // Only update username if it's different and not already set
      if (formData.username && formData.username !== user?.username) {
        updateData.username = formData.username
      }

      // Update Clerk user if there are changes
      if (Object.keys(updateData).length > 0) {
        await user?.update(updateData)
      }

      // Save additional profile data to your database (bio, etc.)
      console.log('Saving profile to database:', {
        ...formData,
        image: imageUrl
      })
      
      // Redirect to main app
      router.push('/')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.errors?.[0]?.longMessage || 'An error occurred while updating your profile')
    } finally {
      setIsLoading(false)
      setIsUploadingImage(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== ''
      case 2:
        return formData.username.trim() !== ''
      case 3:
        return true // Bio is optional
      default:
        return false
    }
  }

  const getTotalSteps = () => {
    return shouldSkipUsernameStep ? 2 : 3
  }

  const getStepNumber = () => {
    if (shouldSkipUsernameStep && currentStep === 3) {
      return 2
    }
    return currentStep
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-heading3-bold text-light-1 mb-2">Upload your photo</h2>
              <p className="text-base-regular text-light-3">
                Choose a profile picture that represents you
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="account-form_image-label cursor-pointer relative">
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="rounded-full object-cover border-2 border-dark-4 w-24 h-24"
                      />
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-dark-4 border-2 border-dashed border-dark-3 group-hover:border-primary-500 transition-colors">
                      <svg className="h-8 w-8 text-light-4 group-hover:text-primary-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        <path d="M9 11H7v3h2v-3zm4 0h-2v3h2v-3zm4 0h-2v3h2v-3z"/>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="account-form_image-input absolute inset-0 opacity-0 cursor-pointer"
                />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="text-center">
                <p className="text-small-regular text-light-4">
                  {imagePreview ? 'Click to change photo' : 'Click to upload a photo'}
                </p>
                <p className="text-xs text-light-4 mt-1">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-light-2 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-heading3-bold text-light-1 mb-2">Choose your username</h2>
              <p className="text-base-regular text-light-3">
                Your username is how others will find you on Threads
              </p>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-light-2 mb-2">
                Username *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-4">@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="account-form_input w-full rounded-md pl-8 pr-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                    handleInputChange({ ...e, target: { ...e.target, value } })
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-light-4">
                Only lowercase letters, numbers, and underscores allowed
              </p>
            </div>

            <div className="bg-dark-3 rounded-lg p-4">
              <h3 className="text-light-1 font-medium mb-2">Preview</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-10 h-10"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {formData.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-light-1 font-medium">{formData.name}</p>
                  <p className="text-light-4 text-sm">@{formData.username}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-heading3-bold text-light-1 mb-2">Tell us about yourself</h2>
              <p className="text-base-regular text-light-3">
                Write a short bio to help others get to know you
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-light-2 mb-2">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Tell the world about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={150}
              />
              <p className="mt-1 text-xs text-light-4 text-right">
                {formData.bio.length}/150 characters
              </p>
            </div>

            <div className="bg-dark-3 rounded-lg p-4">
              <h3 className="text-light-1 font-medium mb-3">Profile Preview</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full object-cover w-12 h-12"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {formData.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-light-1 font-medium">{formData.name}</p>
                    <p className="text-light-4 text-sm">@{formData.username}</p>
                  </div>
                </div>
                {formData.bio && (
                  <p className="text-light-2 text-sm">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-dark-1">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
            <h1 className="text-heading2-bold text-light-1">Complete your profile</h1>
            <p className="mt-2 text-base-regular text-light-3">
              Step {getStepNumber()} of {getTotalSteps()}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-dark-3 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
            ></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 rounded-md border border-dark-4 bg-dark-2 px-4 py-2 text-sm font-medium text-light-1 hover:bg-dark-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                Back
              </button>
            )}
            
            {(currentStep < 3 || (shouldSkipUsernameStep && currentStep < 3)) ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || isUploadingImage}
                className="flex-1 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading || isUploadingImage ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isUploadingImage ? 'Uploading image...' : 'Setting up...'}
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-light-4 hover:text-light-3 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
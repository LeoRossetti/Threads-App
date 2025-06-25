'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileData {
  name: string
  username: string
  bio: string
  image: string
}

export default function ProfilePage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    username: '',
    bio: '',
    image: ''
  })

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : '',
        username: user.username || '',
        bio: user.unsafeMetadata?.bio as string || '',
        image: user.imageUrl || ''
      })
      if (user.imageUrl) {
        setImagePreview(user.imageUrl)
      }
    }
  }, [user])

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
      setError('')
      
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(user?.imageUrl || '')
    const fileInput = document.getElementById('profile-image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Upload image if user selected one
      if (imageFile) {
        setIsUploadingImage(true)
        try {
          await user?.setProfileImage({ file: imageFile })
        } catch (imageError) {
          console.error('Error uploading image:', imageError)
          setError('Failed to upload image. Other changes were saved.')
        } finally {
          setIsUploadingImage(false)
        }
      }
      
      // Update Clerk user
      const updateData: any = {}
      
      // Update name if changed
      const currentFullName = (user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : ''
      if (profileData.name !== currentFullName) {
        updateData.firstName = profileData.name.split(' ')[0]
        updateData.lastName = profileData.name.split(' ').slice(1).join(' ')
      }
      
      // Update username if changed
      if (profileData.username && profileData.username !== user?.username) {
        updateData.username = profileData.username
      }

      // Update Clerk user if there are changes
      if (Object.keys(updateData).length > 0) {
        await user?.update(updateData)
      }

      // Update bio separately using unsafeMetadata (which is user-editable)
      if (profileData.bio !== (user?.unsafeMetadata?.bio || '')) {
        await user?.update({
          unsafeMetadata: {
            ...user?.unsafeMetadata,
            bio: profileData.bio
          }
        })
      }

      setSuccess('Profile updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.errors?.[0]?.longMessage || 'An error occurred while updating your profile')
    } finally {
      setIsLoading(false)
      setIsUploadingImage(false)
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
    <div className="max-w-2xl mx-auto p-6 bg-dark-1 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-heading2-bold text-light-1">Edit Profile</h1>
          <Link
            href="/"
            className="text-sm text-light-4 hover:text-light-3 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        <div className="flex space-x-4 text-sm">
          <span className="text-primary-500 border-b border-primary-500 pb-1">Profile</span>
          <Link
            href="/account"
            className="text-light-4 hover:text-light-3 transition-colors"
          >
            Account Settings
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 mb-6">
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Image */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-light-1">Profile Picture</h2>
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="cursor-pointer relative">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-dark-4 w-20 h-20"
                    />
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-dark-4 border-2 border-dashed border-dark-3 group-hover:border-primary-500 transition-colors">
                    <svg className="h-8 w-8 text-light-4 group-hover:text-primary-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
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
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <label htmlFor="profile-image" className="cursor-pointer rounded-md bg-primary-500 px-3 py-2 text-xs font-medium text-white hover:bg-primary-600 transition-colors">
                  Change Photo
                </label>
                {imagePreview && imagePreview !== user.imageUrl && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="rounded-md bg-dark-4 px-3 py-2 text-xs font-medium text-light-3 hover:bg-dark-3 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-light-4">JPG, PNG, GIF up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-light-1">Profile Information</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-light-2 mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your full name"
              value={profileData.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-light-2 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-4">@</span>
              <input
                id="username"
                name="username"
                type="text"
                className="account-form_input w-full rounded-md pl-8 pr-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="username"
                value={profileData.username}
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

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-light-2 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Tell the world about yourself..."
              value={profileData.bio}
              onChange={handleInputChange}
              maxLength={150}
            />
            <p className="mt-1 text-xs text-light-4 text-right">
              {profileData.bio.length}/150 characters
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-dark-4">
          <Link
            href="/"
            className="rounded-md border border-dark-4 bg-dark-2 px-4 py-2 text-sm font-medium text-light-1 hover:bg-dark-3 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || isUploadingImage}
            className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading || isUploadingImage ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isUploadingImage ? 'Uploading...' : 'Saving...'}
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>

      {/* Account Settings Link */}
      <div className="mt-8 p-4 bg-dark-2 rounded-lg">
        <h3 className="text-sm font-medium text-light-1 mb-2">Account Settings</h3>
        <p className="text-xs text-light-4 mb-3">
          Manage your email, password, and security settings
        </p>
        <Link
          href="/account"
          className="inline-flex items-center text-xs text-primary-500 hover:text-primary-400 transition-colors"
        >
          Go to Account Settings
          <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
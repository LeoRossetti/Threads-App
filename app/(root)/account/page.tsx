'use client'

import { UserProfile } from '@clerk/nextjs'
import Link from 'next/link'

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-dark-1 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-heading2-bold text-light-1">Account Settings</h1>
          <Link
            href="/"
            className="text-sm text-light-4 hover:text-light-3 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        <div className="flex space-x-4 text-sm">
          <Link
            href="/profile"
            className="text-light-4 hover:text-light-3 transition-colors"
          >
            Profile
          </Link>
          <span className="text-primary-500 border-b border-primary-500 pb-1">Account Settings</span>
        </div>
      </div>

      {/* Clerk User Profile Component */}
      <div className="bg-dark-2 rounded-lg p-1">
        <UserProfile 
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#877EFF',
              colorBackground: '#101012',
              colorInputBackground: '#1F1F22',
              colorInputText: '#EFEFEF',
              colorText: '#EFEFEF',
              colorTextSecondary: '#7878A3',
              colorNeutral: '#EFEFEF',
              colorDanger: '#FF5A5A',
              colorSuccess: '#24AE7C',
              colorWarning: '#FFB800',
              borderRadius: '8px',
            },
            elements: {
              card: {
                backgroundColor: '#1F1F22',
                border: '1px solid #2E2E30',
              },
              headerTitle: {
                color: '#EFEFEF',
              },
              headerSubtitle: {
                color: '#7878A3',
              },
              socialButtonsIconButton: {
                border: '1px solid #2E2E30',
                backgroundColor: '#1F1F22',
              },
              formButtonPrimary: {
                backgroundColor: '#877EFF',
                '&:hover': {
                  backgroundColor: '#7C6EF0',
                },
              },
              formFieldInput: {
                backgroundColor: '#1F1F22',
                border: '1px solid #2E2E30',
                color: '#EFEFEF',
              },
              dividerLine: {
                backgroundColor: '#2E2E30',
              },
              menuButton: {
                color: '#EFEFEF',
                '&:hover': {
                  backgroundColor: '#2E2E30',
                },
              },
              menuList: {
                backgroundColor: '#1F1F22',
                border: '1px solid #2E2E30',
              },
              badge: {
                backgroundColor: '#877EFF',
                color: '#FFFFFF',
              },
            },
          }}
        />
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-dark-2 rounded-lg">
        <h3 className="text-sm font-medium text-light-1 mb-2">Profile Settings</h3>
        <p className="text-xs text-light-4 mb-3">
          Update your display name, bio, and profile picture
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center text-xs text-primary-500 hover:text-primary-400 transition-colors"
        >
          Go to Profile Settings
          <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

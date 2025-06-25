'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !username) {
      setError('All fields are required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        username, // Include username in the initial signup
      })

      console.log('Sign up creation result:', result)

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setVerifying(true)
    } catch (err: any) {
      console.error('Sign up creation error:', err)
      setError(err.errors?.[0]?.longMessage || 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      console.log('Sign up completion result:', completeSignUp)

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push('/onboarding')
      } else if (completeSignUp.status === 'missing_requirements') {
        // Handle case where additional requirements are needed
        console.log('Missing requirements:', completeSignUp.missingFields)
        console.log('Required fields:', completeSignUp)
        setError(`Additional information is required: ${completeSignUp.missingFields?.join(', ') || 'Please check your account settings'}`)
      } else {
        // Handle other statuses
        console.log('Sign up status:', completeSignUp.status)
        console.log('Complete sign up object:', completeSignUp)
        
        // Try to set the session if it exists
        if (completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId })
          router.push('/onboarding')
        } else {
          setError(`Sign up verification incomplete. Status: ${completeSignUp.status}`)
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.errors?.[0]?.longMessage || 'An error occurred during verification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding',
      })
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'An error occurred with Google sign up')
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-1 px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
            <h2 className="text-3xl font-bold text-light-1">Verify your email</h2>
            <p className="mt-2 text-sm text-light-3">
              We sent a verification code to <span className="text-primary-500">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-light-2 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-center tracking-widest"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="text-center">
            <button
              onClick={() => signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })}
              className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              Didn't receive a code? Resend
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-1 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h2 className="text-3xl font-bold text-light-1">Join Threads</h2>
          <p className="mt-2 text-sm text-light-3">
            Create your account and start connecting with others.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-light-2 mb-2">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-light-2 mb-2">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
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
                required
                className="account-form_input w-full rounded-md pl-8 pr-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="username"
                value={username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                  setUsername(value)
                }}
              />
            </div>
            <p className="mt-1 text-xs text-light-4">
              Only lowercase letters, numbers, and underscores allowed
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light-2 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-light-2 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="account-form_input w-full rounded-md px-3 py-2 text-light-1 placeholder-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-light-4">
              Must be at least 8 characters long
            </p>
          </div>

          {/* CAPTCHA Container */}
          <div id="clerk-captcha"></div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-4"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-dark-1 px-2 text-light-3">Or continue with</span>
          </div>
        </div>

        {/* Google Sign Up */}
        <button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full rounded-md border border-dark-4 bg-dark-2 px-4 py-2 text-sm font-medium text-light-1 hover:bg-dark-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-light-3">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-primary-500 hover:text-primary-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function MaintenanceDisplay() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section') || 'This section'
  const message = searchParams.get('message') || 'We are currently performing scheduled maintenance.'
  const estimatedTime = searchParams.get('estimatedTime') || '1 hour'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 text-center">
        {/* Simple gear icon */}
        <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-8">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Maintenance Mode
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          {section} is temporarily unavailable
        </p>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Estimated downtime: <span className="font-semibold text-gray-700 dark:text-gray-300">{estimatedTime}</span>
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
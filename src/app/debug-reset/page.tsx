'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugResetPage() {
  const searchParams = useSearchParams()
  const [urlInfo, setUrlInfo] = useState<any>({})

  useEffect(() => {
    // Get URL parameters
    const params: any = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    // Get hash parameters
    const hash = window.location.hash
    const hashParams: any = {}
    if (hash) {
      const hashSearchParams = new URLSearchParams(hash.substring(1))
      hashSearchParams.forEach((value, key) => {
        hashParams[key] = value
      })
    }

    setUrlInfo({
      url: window.location.href,
      searchParams: params,
      hashParams: hashParams,
      hash: hash
    })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Password Reset URL Debug</CardTitle>
            <CardDescription>
              This page shows the URL parameters received from the password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Full URL:</h3>
                <code className="bg-gray-100 p-2 rounded block text-sm break-all">
                  {urlInfo.url}
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Search Parameters:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(urlInfo.searchParams, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Hash Parameters:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(urlInfo.hashParams, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Raw Hash:</h3>
                <code className="bg-gray-100 p-2 rounded block text-sm break-all">
                  {urlInfo.hash || 'No hash present'}
                </code>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">Expected Parameters:</h4>
                <ul className="text-sm text-blue-700">
                  <li>• <code>code</code> - Authorization code from Supabase</li>
                  <li>• <code>access_token</code> - Access token (in hash or search params)</li>
                  <li>• <code>refresh_token</code> - Refresh token</li>
                  <li>• <code>type</code> - Should be "recovery" or "magiclink"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
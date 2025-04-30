'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'

export default function GTMPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    sendGTMEvent({ event: 'pageview', page_path: url })
  }, [pathname, searchParams])

  return null
}
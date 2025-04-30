'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'

export default function GTMPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const page_path = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    sendGTMEvent({ event: 'pageview', page_path })
  }, [pathname, searchParams])

  return null
}

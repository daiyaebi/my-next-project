'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'

// Propsの型定義
type GoogleTagManagerProps = {
    gtmId: string;
  }

export default function GTMPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    sendGTMEvent({ event: 'pageview', page_path: url })
  }, [pathname, searchParams])

  return null
}
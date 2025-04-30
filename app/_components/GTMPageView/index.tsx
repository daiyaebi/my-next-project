// GTMPageView.tsx または GoogleTagManager.tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'

// Propsの型定義
type GoogleTagManagerProps = {
  gtmId: string;
}

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const page_path = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    sendGTMEvent({ event: 'pageview', page_path, gtmId })
  }, [pathname, searchParams, gtmId])

  return null
}

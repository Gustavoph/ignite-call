import '../lib/dayjs'

import { DefaultSeo } from 'next-seo'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { globalStyles } from '@/styles/globals'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query'

globalStyles()
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DefaultSeo
        openGraph={{
          type: 'website',
          locale: 'pt_BR',
          url: 'https://www.ignite-call.com.br/',
          siteName: 'Ignite Call',
        }}
      />
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </QueryClientProvider>
  )
}

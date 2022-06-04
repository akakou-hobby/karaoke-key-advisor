import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from "@chakra-ui/react"

import Script from 'next/script'
function MyApp({ Component, pageProps }: AppProps) {
  return <ChakraProvider>
    <link href="https://fonts.googleapis.com/css?family=M+PLUS+1p" rel="stylesheet"></link>
    <Component {...pageProps} />
    <Script src="https://api.songle.jp/v2/api.js" strategy="beforeInteractive"></Script>
  </ChakraProvider>
}

export default MyApp

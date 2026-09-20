import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'
import ChatWidget from '../components/ChatWidget'
import { SUPPORT } from '../lib/support.config'

export default function App({ Component, pageProps }: AppProps) {
  return       <><Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ReturnCopy" />
        <meta property="og:description" content="Generate a clear, on-brand return/refund policy plus empathetic customer-facing replies for the most common return reasons." />
        <meta property="og:url" content="https://returncopy.lxsaihub.com/" />
        <meta property="og:image" content="https://returncopy.lxsaihub.com/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ReturnCopy" />
        <meta name="twitter:description" content="Generate a clear, on-brand return/refund policy plus empathetic customer-facing replies for the most common return reasons." />
        <meta name="twitter:image" content="https://returncopy.lxsaihub.com/og.png" />
                                        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: '{"@context":"https://schema.org","@type":"SoftwareApplication","name":"ReturnCopy","url":"https://returncopy.lxsaihub.com/","description":"Generate a clear, on-brand return/refund policy plus empathetic customer-facing replies for the most common return reasons.","applicationCategory":"BusinessApplication","operatingSystem":"Web","offers":{"@type":"Offer","priceCurrency":"USD","price":"0","availability":"https://schema.org/OnlineOnly"}}' }} />
      </Head>
      <Component {...pageProps} />
      <ChatWidget productName={SUPPORT.productName} brandColor={SUPPORT.brandColor} sessionKeyPrefix={SUPPORT.productSlug} /></>
}

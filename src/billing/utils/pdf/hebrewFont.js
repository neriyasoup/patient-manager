import { Font } from '@react-pdf/renderer'

const REGULAR_URL = 'https://fonts.gstatic.com/s/notosanshebrew/v50/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4qtog.ttf'
const BOLD_URL    = 'https://fonts.gstatic.com/s/notosanshebrew/v50/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXkI2tog.ttf'

async function toDataUrl(url) {
  const res    = await fetch(url)
  const buffer = await res.arrayBuffer()
  const bytes  = new Uint8Array(buffer)
  let binary   = ''
  const chunk  = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return 'data:font/truetype;base64,' + btoa(binary)
}

let promise = null

export function registerHebrewFont() {
  if (promise) return promise
  promise = (async () => {
    const [regular, bold] = await Promise.all([toDataUrl(REGULAR_URL), toDataUrl(BOLD_URL)])
    Font.register({
      family: 'NotoSansHebrew',
      fonts: [
        { src: regular, fontWeight: 400 },
        { src: bold,    fontWeight: 700 },
      ],
    })
    Font.registerHyphenationCallback(word => [word])
  })()
  return promise
}

import { useAuthStore } from '../store/useAuthStore'

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  // Process in chunks to avoid stack overflow on large files
  const chunkSize = 8192
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

// Wrap base64 at 76 chars per line (RFC 2045)
function wrapBase64(b64) {
  return b64.match(/.{1,76}/g)?.join('\r\n') ?? b64
}

// RFC 2047 Q-encoding for non-ASCII text in MIME headers
function encodeMimeWord(text) {
  return `=?utf-8?B?${btoa(unescape(encodeURIComponent(text)))}?=`
}

function buildRawEmail({ toEmail, toName, subject, html, pdfAttachment }) {
  const to = toName ? `"${encodeMimeWord(toName)}" <${toEmail}>` : toEmail
  const encodedSubject = encodeMimeWord(subject)
  const encodedBody = wrapBase64(btoa(unescape(encodeURIComponent(html))))

  let message
  if (pdfAttachment) {
    const boundary = 'boundary_pdf_attach'
    const encodedFilename = encodeMimeWord(pdfAttachment.filename)
    message = [
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      encodedBody,
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${encodedFilename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${encodedFilename}"`,
      '',
      wrapBase64(pdfAttachment.base64),
      '',
      `--${boundary}--`,
    ].join('\r\n')
  } else {
    message = [
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      encodedBody,
    ].join('\r\n')
  }

  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function sendGmailEmail({ toEmail, toName, subject, html, pdfBlob, pdfFilename }) {
  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    throw new Error('NO_TOKEN')
  }

  const pdfAttachment = pdfBlob && pdfFilename
    ? { base64: await blobToBase64(pdfBlob), filename: pdfFilename }
    : null

  const raw = buildRawEmail({ toEmail, toName, subject, html, pdfAttachment })

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    // 401 = token expired, 403 = token was issued before Gmail permission was added
    if (response.status === 401 || response.status === 403) throw new Error('NO_TOKEN')
    throw new Error(err.error?.message || 'שגיאה בשליחת האימייל')
  }
}

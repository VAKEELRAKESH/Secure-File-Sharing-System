import './globals.css'

export const metadata = {
  title: 'TrustShare - Enterprise Encrypted File Sharing',
  description: 'Secure file-sharing platform with server-side AES-256 encryption, MFA, fine-grained access control, and audit logging.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}

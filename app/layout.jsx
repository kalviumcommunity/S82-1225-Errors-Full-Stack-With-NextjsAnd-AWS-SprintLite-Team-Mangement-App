import './globals.css'

export const metadata = {
  title: 'SprintLite',
  description: 'A lightweight task management tool for small teams',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

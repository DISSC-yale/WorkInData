import type {Metadata} from 'next'
import Theme from './theme'
import {Data} from './data/load'
import './globals.css'

export const metadata: Metadata = {
  title: 'Work In Data - Gender Growth Gap',
  description: 'Gender growth gap related subset of the work in data dataset.',
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body>
        <Theme>
          <Data>{children}</Data>
        </Theme>
      </body>
    </html>
  )
}

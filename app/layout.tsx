import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Test Designer Numilex - Évaluation des Compétences en Design Graphique",
  description:
    "Test interactif pour évaluer vos compétences en design graphique, typographie, impression et logiciels de création. Créé par Numilex.",
  generator: "v0.app",
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Numilex%20N-18BaoumtemIOR55qY2fbOmLhacZumZ.png",
    shortcut:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Numilex%20N-18BaoumtemIOR55qY2fbOmLhacZumZ.png",
    apple:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Numilex%20N-18BaoumtemIOR55qY2fbOmLhacZumZ.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}

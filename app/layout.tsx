import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Catetin — Catat Keuangan Semudah Kirim Chat",
  description:
    "Catetin bantu kamu pantau pengeluaran, pemasukan, hutang, sampai investasi cukup dari chat WhatsApp. Tanpa download app, tanpa ribet.",
  generator: "v0.app",
  metadataBase: new URL("https://catetin.co"),
  openGraph: {
    title: "Catetin — Catat Keuangan Semudah Kirim Chat",
    description:
      "Pantau keuangan kamu cukup lewat WhatsApp. Setup 2 menit, langsung jalan.",
    type: "website",
    locale: "id_ID",
  },
}

export const viewport: Viewport = {
  themeColor: "#154418",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${dmSans.variable} bg-background`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}

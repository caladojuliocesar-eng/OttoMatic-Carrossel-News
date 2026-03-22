import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ottomatic Carousel Engine",
  description: "Traduza qualquer ideia ou link de notícia em um carrossel visual e profissional em segundos.",
  openGraph: {
    title: "Ottomatic Carousel Engine",
    description: "Traduza qualquer ideia ou link de notícia em um carrossel visual e profissional em segundos.",
    siteName: "Ottomatic AI",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

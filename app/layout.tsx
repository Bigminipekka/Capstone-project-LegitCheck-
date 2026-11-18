import type { Metadata } from "next";
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
 
export const metadata: Metadata = {
  title: "LegitCheck",
  description:
    "Rule-based and AI-assisted scam detection for job postings, emails and text messages",
};
 
// Runs before the page paints, so a saved light-mode choice does not flash dark first
const themeScript = `try{if(localStorage.getItem("legitcheck-theme")==="light"){document.documentElement.classList.add("light")}}catch(e){}`;
 
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}
 
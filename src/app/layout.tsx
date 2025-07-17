import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkAuthProvider } from "@/providers/ClerkAuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COBI - Modèles 3D Restaurant",
  description: "Plateforme de gestion et visualisation de modèles 3D pour restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ClerkProvider>
            <ClerkAuthProvider>
              {children}
            </ClerkAuthProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

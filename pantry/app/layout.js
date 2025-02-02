'use client';

import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { firebaseConfig } from "../firebase"; // Ensure this import is correct
import { FirebaseAppProvider } from 'reactfire';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <html lang="en">
        <body className={`${inter.variable} ${robotoMono.variable}`}>{children}</body>
      </html>
    </FirebaseAppProvider>
  );
}
// app/layout.js
import { Inder } from "next/font/google";
import { ThemeProvider } from '@/app/components/providers/ThemeProvider';
import { LanguageProvider } from '@/app/components/providers/LanguageProvider';
import "./globals.css";
import ReduxProvider from "@/app/store/Provider.jsx";
import PageTransition from "@/app/components/layout/PageTransition";

// استخدام خط Inder كافتراضي
const inder = Inder({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "FCAI Attendance System",
  description: "Manage and track student attendance efficiently",
  icons: [
    { rel: 'icon', url: '/images/logo.png' },
    { rel: 'apple-touch-icon', url: '/images/logo.png' },
    { rel: 'shortcut icon', url: '/images/logo.png' }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inder.className} antialiased`}>
       <ReduxProvider>
        <LanguageProvider>
          <ThemeProvider>
            <PageTransition>
              {children}
            </PageTransition>
          </ThemeProvider>
        </LanguageProvider>
       </ReduxProvider>
   
      </body>
    </html>
  );
}

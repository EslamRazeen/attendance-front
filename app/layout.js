// app/layout.tsx
import { Inder , Gugi , Julee , Poppins} from "next/font/google";
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider } from './components/LanguageProvider';
import "./globals.css";
import ReduxProvider from "./Redux/provider";
import PageTransition from "./components/PageTransition";

// استخدام خط Inder كافتراضي
const inder = Inder({ subsets: ["latin"], weight: "400" });
const gugi = Gugi({ subsets: ["latin"], weight: "400" });
const julee = Julee({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: "400", display: 'swap' });

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
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inder.className} ${gugi.className} ${julee.className} ${poppins.className} antialiased`}>
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

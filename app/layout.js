import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "./siteConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: siteConfig.appName + " - Team Task Tracking",
  description: siteConfig.appDescription,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}

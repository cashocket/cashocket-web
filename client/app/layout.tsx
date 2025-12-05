import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CurrencyProvider } from "@/context/currency-context";
import { ThemeProvider } from "@/components/theme-provider"; // Import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cashocket",
  description: "SaaS Expense Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning zaroori hai next-themes ke liye */}
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider>
            {children}
            <Toaster position="top-center" richColors />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

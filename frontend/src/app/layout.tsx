import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { SkipLink } from "@/components/ui/SkipLink";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventario EFC",
  description: "Sistema de inventario para EFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SkipLink />
        <AuthProvider>
          <ToastProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

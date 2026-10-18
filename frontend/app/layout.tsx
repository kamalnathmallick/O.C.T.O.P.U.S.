import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/ToastProvider";

export const metadata = {
  title: "Octopus - Predictive Maintenance Platform",
  description: "AI-powered industrial monitoring and predictive analytics for enterprise clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}

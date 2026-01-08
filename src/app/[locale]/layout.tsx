// app/[locale]/layout.tsx
import AuthProvider from "@/components/shared/AuthProvider";
import { ToastProviderWrapper } from "../../components/ui/use-toast";
import { ThemeProvider } from "@/providers/theme-provider";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import CookieConsent from "@/components/shared/CookieConsent";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CookieConsent />
        <AuthProvider>
          <ToastProviderWrapper>{children}</ToastProviderWrapper>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import WhatsAppButton from '@/components/WhatsAppButton';
import '../globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Le Laboratoire — Équipements & Produits de Laboratoire',
  description: 'Fournisseur d\'équipements de laboratoire, produits chimiques, verrerie et consommables — Maroc.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} className={poppins.variable}>
      <body>
        <NextIntlClientProvider>
          {children}
          <CookieConsentBanner />
          <WhatsAppButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import '../app/globals.css';
import { DEFAULT_LANGUAGE } from '../i18n';
import ClientLayout from '../components/ClientLayout';

export const metadata: Metadata = {
  title: 'Interviewer',
  description: 'Подготовка к техническим интервью с помощью ИИ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={DEFAULT_LANGUAGE} className="light">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
} 
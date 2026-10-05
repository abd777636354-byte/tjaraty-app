import './globals.css';

export const metadata = {
  title: 'تِجارتي - من الطلب إلى التسليم والتحصيل',
  description: 'نظام إدارة التجارة والحجوزات والعمليات المالية - أعداد د. عبدالله الحميري',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

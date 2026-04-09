import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Farm Equipment Sharing',
  description: 'Share farm equipment with farmers in your area',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="main-container">
          {children}
        </main>
      </body>
    </html>
  );
}

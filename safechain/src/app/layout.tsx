import './globals.css';
import { Web3Provider } from '../context/Web3Context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className="h-full">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
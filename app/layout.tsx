import './globals.css';
import { AuthProvider } from './auth-context'; // Importe aqui

export const metadata = {
  title: 'Mucuripe Finance',
  description: 'Controle financeiro de elite',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
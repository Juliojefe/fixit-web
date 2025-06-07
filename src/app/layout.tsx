import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '../context/UserContext';

export const metadata: Metadata = {
    title: 'Fixit',
    description: 'A platform for fixing cars',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <UserProvider>
                    <main>{children}</main>
                </UserProvider>
            </body>
        </html>
    );
}
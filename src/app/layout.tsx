import '@neondatabase/auth-ui/css';
import type { Metadata } from 'next';
import './globals.css';
import AppNavigation from '@/components/app-navigation';
export const metadata: Metadata = {title:'Homeschool OS',description:'Parent-guided family learning'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppNavigation />{children}</body></html>}

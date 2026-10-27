import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Homeschool OS',description:'Parent-guided family learning'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

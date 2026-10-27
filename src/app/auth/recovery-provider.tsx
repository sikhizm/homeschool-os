'use client';
import { NeonAuthUIProvider } from '@neondatabase/auth-ui';
import { authClient } from '@/lib/auth/client';
export default function RecoveryProvider({children}:{children:React.ReactNode}){return <NeonAuthUIProvider authClient={authClient} credentials={{forgotPassword:true}}>{children}</NeonAuthUIProvider>}

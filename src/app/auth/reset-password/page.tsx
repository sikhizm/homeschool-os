'use client';
import Link from 'next/link';
import { ResetPasswordForm } from '@neondatabase/auth-ui';
import RecoveryProvider from '../recovery-provider';
import { authClient } from '@/lib/auth/client';
export default function ResetPassword(){return <main style={{maxWidth:540,margin:'4rem auto'}}><h1>Choose a new password</h1><p className="muted">Use the secure link sent to your email. Links expire after 15 minutes.</p><RecoveryProvider><ResetPasswordForm authClient={authClient} /></RecoveryProvider><p><Link href="/auth/sign-in">Return to sign in</Link></p></main>}

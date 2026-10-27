'use client';
import Link from 'next/link';
import { ForgotPasswordForm } from '@neondatabase/auth-ui';
import RecoveryProvider from '../recovery-provider';
import { authClient } from '@/lib/auth/client';
export default function ForgotPassword(){return <main style={{maxWidth:540,margin:'4rem auto'}}><h1>Set or reset your password</h1><p className="muted">Enter your parent account email to request a secure, time-limited password link.</p><RecoveryProvider><ForgotPasswordForm authClient={authClient} redirectTo="https://homeschool-os-gamma.vercel.app/auth/reset-password" /></RecoveryProvider><p><Link href="/auth/sign-in">Return to sign in</Link></p></main>}

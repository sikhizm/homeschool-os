'use client';
import Link from 'next/link';
import { ResetPasswordForm } from '@neondatabase/auth-ui';
import RecoveryProvider from '../recovery-provider';
export default function ResetPassword(){return <main style={{maxWidth:540,margin:'4rem auto'}}><h1>Choose a new password</h1><p className="muted">Use the secure link sent to your email.</p><RecoveryProvider><ResetPasswordForm localization={{}} /></RecoveryProvider><p><Link href="/auth/sign-in">Return to sign in</Link></p></main>}

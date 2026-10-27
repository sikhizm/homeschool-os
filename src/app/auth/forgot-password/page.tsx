'use client';
import Link from 'next/link';
import { ForgotPasswordForm } from '@neondatabase/auth-ui';
import RecoveryProvider from '../recovery-provider';
export default function ForgotPassword(){return <main className="auth-shell"><section className="auth-card"><div className="auth-mark">Homeschool OS</div><h1>Reset your password</h1><p className="auth-description">Enter your parent account email and we'll send you a secure link to set a new password.</p><RecoveryProvider><ForgotPasswordForm localization={{}} /></RecoveryProvider><div className="auth-footer"><Link href="/auth/sign-in">Back to sign in</Link></div></section></main>}

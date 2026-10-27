'use client';
import Link from 'next/link';
import { ResetPasswordForm } from '@neondatabase/auth-ui';
import RecoveryProvider from '../recovery-provider';
export default function ResetPassword(){return <main className="auth-shell"><section className="auth-card"><div className="auth-mark">Homeschool OS</div><h1>Choose a new password</h1><p className="auth-description">Enter your new password to secure your parent account.</p><RecoveryProvider><ResetPasswordForm localization={{}} /></RecoveryProvider><div className="auth-footer"><Link href="/auth/sign-in">Back to sign in</Link></div></section></main>}

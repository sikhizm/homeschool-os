'use client';
import { useState } from 'react';
import { createAuthClient } from '@neondatabase/auth/next';
import { useRouter } from 'next/navigation';
const client = createAuthClient();
export default function SignIn(){const router=useRouter();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');async function submit(e:React.FormEvent){e.preventDefault();const result=await client.signIn.email({email,password});if(result.error)setError(result.error.message||'Sign in failed');else{router.push('/dashboard');router.refresh();}}return <main><h1>Parent sign in</h1><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>{error&&<p role="alert">{error}</p>}<button type="submit">Sign in</button></form></main>}

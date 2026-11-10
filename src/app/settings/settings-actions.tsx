'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {createAuthClient} from '@neondatabase/auth/next';

const client=createAuthClient();

/** Sign out of this browser and return to the sign-in screen. */
export default function SettingsActions(){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 async function signOut(){
  setBusy(true);
  try{
   await client.signOut();
  }finally{
   router.push('/auth/sign-in');
   router.refresh();
  }
 }
 return <div className="hero-actions">
  <button type="button" className="hero-action-secondary settings-signout" onClick={()=>void signOut()} disabled={busy}>
   {busy?'Signing out…':'Sign out'}
  </button>
 </div>;
}

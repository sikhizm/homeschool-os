import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import CurriculumMappingReview from './curriculum-mapping-review';

export const dynamic='force-dynamic';

type Search={chapter?:string};

/** Parent-only entry point for the append-only Class 5 mapping review queue. */
export default async function CurriculumMappingPage({searchParams}:{searchParams:Promise<Search>}){
 const {data:session}=await auth.getSession();
 if(!session?.user)redirect('/auth/sign-in');
 const sql=getSql();
 const memberships=await sql`
  SELECT fm.role
  FROM family_members fm
  WHERE fm.auth_user_id=${session.user.id}
  ORDER BY fm.created_at,fm.family_id
 `;
 if(!memberships.length)return <main className="family-dashboard"><span className="tag">PARENT CURRICULUM REVIEW</span><h1>Family membership required</h1><p>Your authenticated account needs a family membership before it can inspect curriculum review records.</p><Link href="/dashboard">Back to dashboard</Link></main>;
 // Match the API's owner lookup even when an account belongs to more than one
 // family: an owner membership is sufficient; a non-owner membership is not.
 if(!memberships.some(membership=>String(membership.role)==='owner'))return <main className="family-dashboard"><span className="tag">PARENT CURRICULUM REVIEW</span><h1>Family owner access required</h1><p>Class 5 mapping drafts and their review history are private parent records. Learner mode and non-owner family accounts cannot inspect or change them.</p><Link href="/ncert-books?grade=5">Browse the verified Class 5 book index</Link></main>;
 const params=await searchParams;
 const chapter=typeof params.chapter==='string'&&params.chapter.length<=160?params.chapter:'';
 return <CurriculumMappingReview initialChapter={chapter}/>;
}

import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';

const read=(path:string)=>readFile(new URL(path,import.meta.url),'utf8');

test('Neon Auth session and middleware remain the single authentication boundary',async()=>{
 const [server,client,middleware,signIn]=await Promise.all([
  read('../src/lib/auth/server.ts'),read('../src/lib/auth/client.ts'),
  read('../src/middleware.ts'),read('../src/app/auth/sign-in/page.tsx')
 ]);
 assert.match(server,/createNeonAuth/);
 assert.match(server,/NEON_AUTH_BASE_URL/);
 assert.match(server,/NEON_AUTH_COOKIE_SECRET/);
 assert.match(client,/createAuthClient/);
 assert.match(middleware,/auth\.middleware/);
 assert.match(middleware,/\/auth\/sign-in/);
 assert.match(signIn,/authClient|signIn|sign-in/i);
});

test('learner creation derives family ownership from the signed-in session',async()=>{
 const source=await read('../src/app/api/learners/route.ts');
 assert.match(source,/auth\.getSession\(\)/);
 assert.match(source,/fm\.auth_user_id\s*=\s*\$\{session\.user\.id\}/);
 assert.match(source,/fm\.role\s*=\s*'owner'/);
 assert.doesNotMatch(source,/fields\.familyId|fields\.family_id/);
});

test('progress and chapter writes retain owner checks and session-scoped reads',async()=>{
 const [auto,chapter,workspace]=await Promise.all([
  read('../src/app/api/auto-learning/route.ts'),
  read('../src/app/api/ncert-chapters/[chapterId]/progress/route.ts'),
  read('../src/lib/learning/service.ts')
 ]);
 assert.match(auto,/auth\.getSession\(\)/);
 assert.match(auto,/fm\.auth_user_id=\$\{user\}/);
 assert.match(auto,/fm\.role='owner'/);
 assert.match(chapter,/fm\.auth_user_id=\$\{who\.userId\}/);
 assert.match(chapter,/fm\.role='owner'/);
 assert.match(workspace,/fm\.role = 'owner'/);
});

test('legacy chapter completion continues to cover the stable read/practice/review IDs',async()=>{
 const source=await read('../src/app/api/auto-learning/route.ts');
 assert.match(source,/recordedDone\.has\(item\.id\.replace\(\/:\(read\|practice\|review\)\$\/,'\'\)\)/);
 assert.match(source,/ncert:\$\{chapterId\}:/);
});

test('progress APIs do not trust a client-supplied learner id without a family membership join',async()=>{
 const [auto,chapter]=await Promise.all([
  read('../src/app/api/auto-learning/route.ts'),
  read('../src/app/api/ncert-chapters/[chapterId]/progress/route.ts')
 ]);
 assert.match(auto,/JOIN family_members fm ON fm\.family_id=l\.family_id/);
 assert.match(auto,/l\.id::text=\$\{learnerId\}[^\n]*fm\.auth_user_id=\$\{user\}/);
 assert.match(chapter,/l\.id::text=\$\{learnerId\} AND fm\.auth_user_id=\$\{who\.userId\}/);
});

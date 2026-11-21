import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const read=(path:string)=>readFileSync(resolve(process.cwd(),path),'utf8');

test('My Books is a personal-library route and legacy NCERT URL redirects to it',()=>{
 const page=read('src/app/library/my-books/page.tsx');
 const legacy=read('src/app/ncert-books/my-books/page.tsx');
 const ncert=read('src/app/ncert-books/page.tsx');
 assert.ok(page.includes("import MyBooks from '@/components/my-books'"));
 assert.ok(page.includes('if (!session?.user) redirect(\'/auth/sign-in\')'));
 assert.ok(page.includes('<MyBooks />'));
 assert.ok(page.includes('href="/library"'));
 assert.ok(page.includes('PERSONAL LIBRARY'));
 assert.ok(legacy.includes("redirect('/library/my-books')"));
 assert.ok(!legacy.includes('<MyBooks />'));
 assert.ok(!ncert.includes('href="/ncert-books/my-books"'));
 assert.ok(!ncert.includes('href="/library/my-books"'));
});

test('Curriculum Library has a standalone personal bookshelf link and navigation',()=>{
 const library=read('src/app/library/page.tsx');
 const menu=read('src/lib/navigation.ts');
 const learners=read('src/app/learners/page.tsx');
 const css=read('src/app/globals.css');
 assert.ok(library.includes('library-personal-books'));
 assert.ok(library.includes('href="/library/my-books"'));
 assert.ok(library.includes('separate from NCERT and Global Curriculum'));
 assert.ok(menu.includes("{href:'/library/my-books',label:'My Books'}"));
 assert.ok(learners.includes('href="/library/my-books"'));
 assert.ok(css.includes('.library-page .library-personal-books'));
 assert.ok(css.includes('@media (max-width: 620px)'));
});

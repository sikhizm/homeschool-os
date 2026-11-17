import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';

test('reader page authenticates, loads each provider and redirects mobile to its external action', async () => {
  const bundle = await build({
    stdin: {
      contents: `
        import { renderToStaticMarkup } from 'react-dom/server';
        import Page from './src/app/library/olympiad/read/[resourceId]/page';
        import { state } from 'fixture-state';
        export async function render(id, mobile = false, signedIn = true) {
          state.mobile = mobile;
          state.signedIn = signedIn;
          return renderToStaticMarkup(await Page({params: Promise.resolve({resourceId:id})}));
        }`,
      resolveDir: process.cwd(), loader: 'tsx',
    },
    bundle: true, write: false, platform: 'node', packages: 'external', jsx: 'automatic',
    plugins: [{
      name: 'reader-fixture',
      setup(api) {
        api.onResolve({ filter: /^(fixture-state|next\/headers|next\/navigation|@\/lib\/auth\/server|@\/app\/ncert-books\/read\/\[chapterId\]\/pdfjs-reader)$/ },
          args => ({ path: args.path, namespace: 'fixture' }));
        api.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => {
          const modules: Record<string, string> = {
            'fixture-state': 'export const state = {mobile:false,signedIn:true};',
            'next/headers': 'import {state} from "fixture-state"; export async function headers(){return new Headers({"sec-ch-ua-mobile":state.mobile?"?1":"?0"});}',
            'next/navigation': 'export function redirect(url){throw new Error("redirect:"+url)} export function notFound(){throw new Error("not-found")}',
            '@/lib/auth/server': 'import {state} from "fixture-state"; export const auth={getSession:async()=>({data:state.signedIn?{user:{id:"fixture"}}:{}})};',
            '@/app/ncert-books/read/[chapterId]/pdfjs-reader': 'import React from "react"; export default function Reader({src,title}){return React.createElement("section",{"data-pdf-src":src,"aria-label":title})}',
          };
          return { contents: modules[path], resolveDir: process.cwd() };
        });
      },
    }],
  });
  const fixture = { exports: {} as { render(id: string, mobile?: boolean, signedIn?: boolean): Promise<string> } };
  runInNewContext(bundle.outputFiles[0].text, {
    module: fixture, exports: fixture.exports, require: createRequire(import.meta.url), Headers,
  });
  for (const id of ['sof-maths-4', 'crest-science-10', 'silverzone-maths-1']) {
    const html = await fixture.exports.render(id);
    assert.ok(html.includes('data-pdf-src="/api/olympiad-pdf/' + id + '"'));
    assert.ok(html.includes('Open PDF externally'));
    assert.ok(html.includes('Official source'));
  }
  await assert.rejects(fixture.exports.render('sof-maths-4', true), /redirect:\/api\/olympiad-pdf\/sof-maths-4/);
  await assert.rejects(fixture.exports.render('crest-maths-4', true), /redirect:https:\/\/www.crestolympiads.com/);
  await assert.rejects(fixture.exports.render('unknown'), /not-found/);
  await assert.rejects(fixture.exports.render('sof-maths-4', false, false), /redirect:\/auth\/sign-in/);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const read = (path:string) => readFileSync(resolve(process.cwd(), path), 'utf8');

test('PWA manifest declares an installable standalone family app and platform icons',()=>{
 const manifest=read('src/app/manifest.ts');
 assert.match(manifest,/name:\s*'Homeschool OS'/);
 assert.match(manifest,/short_name:\s*'Homeschool'/);
 assert.match(manifest,/start_url:/);
 assert.match(manifest,/display:\s*'standalone'/);
 assert.match(manifest,/icon-192\.png/);
 assert.match(manifest,/icon-512\.png/);
 assert.match(manifest,/maskable-512\.png/);
});

test('service worker provides an offline fallback without caching private family data',()=>{
 const worker=read('public/sw.js');
 assert.match(worker,/addEventListener\('install'/);
 assert.match(worker,/addEventListener\('activate'/);
 assert.match(worker,/addEventListener\('fetch'/);
 assert.match(worker,/url\.pathname\.startsWith/);
 assert.match(worker,/request\.mode === 'navigate'/);
 assert.match(worker,/caches\.match\(OFFLINE_URL\)/);
 assert.doesNotMatch(worker,/cache\.put\(request, response\)/);
});

test('layout links the manifest and registers the service worker client',()=>{
 const layout=read('src/app/layout.tsx');
 const tools=read('src/components/pwa-tools.tsx');
 const navigation=read('src/components/app-navigation.tsx');
 const css=read('src/app/globals.css');
 assert.match(layout,/manifest:/);
 assert.match(layout,/PwaRegistration/);
 assert.match(tools,/navigator\.serviceWorker\.register/);
 assert.match(tools,/beforeinstallprompt/);
 assert.match(tools,/Add to Home Screen/);
 assert.match(navigation,/className="app-nav-actions"/);
 assert.match(css,/\.app-nav-actions\{position:absolute/);
 assert.match(tools,/nav\.platform === 'MacIntel'/);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const read=(path:string)=>readFileSync(resolve(process.cwd(),path),'utf8');

test('service worker caches only public assets and never learner API or HTML',()=>{
  const sw=read('public/sw.js');
  assert.ok(sw.includes("homeschool-os-static-v3"));
  assert.match(sw,/url\.pathname\.startsWith\('\/_next\/static\/'\)/);
  assert.match(sw,/\(\?:brand\|illustrations\|icons\)/);
  assert.match(sw,/url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(sw,/url\.pathname\.startsWith\('\/auth\/'\)/);
  assert.match(sw,/request\.headers\.has\('rsc'\)/);
  assert.match(sw,/request\.mode === 'navigate'/);
  assert.match(sw,/fetch\(request\)\.catch/);
  assert.match(sw,/text\\\/html\|application\\\/json/);
  assert.match(sw,/MAX_STATIC_ENTRIES = 140/);
  assert.doesNotMatch(sw,/indexedDB|localStorage|sessionStorage/);
});

test('authenticated pages retain network-only no-store API responses',()=>{
  for(const path of [
    'src/app/api/planning/route.ts',
    'src/app/api/chapter-plan/route.ts',
    'src/app/api/auto-learning/route.ts',
    'src/app/api/ncert-chapters/[chapterId]/progress/route.ts',
  ]){
    const source=read(path);
    assert.match(source,/['"]Cache-Control['"]:\s*['"]private, no-store['"]/);
  }
});

test('Planner and Dashboard are user-scoped and refresh after updates',()=>{
  const planningPage=read('src/app/planning/page.tsx');
  const dashboardPage=read('src/app/dashboard/page.tsx');
  const planner=read('src/app/planning/planning-workspace.tsx');
  const dashboard=read('src/app/dashboard/family-home.tsx');
  const coach=read('src/app/dashboard/automatic-learning.tsx');
  assert.ok(planningPage.includes('cacheScope={session.user.id}'));
  assert.ok(dashboardPage.includes('cacheScope={session.user.id}'));
  assert.ok(planner.includes("readPrivateMemoryCache<PlanningData>"));
  assert.ok(planner.includes("writePrivateMemoryCache(cacheScope, key, result)"));
  assert.ok(planner.includes("invalidatePrivateMemoryCache(cacheScope, `planning:${learnerId}:`)"));
  assert.ok(planner.includes("window.addEventListener('chapter-tests-updated', changed)"));
  assert.ok(planner.includes("window.addEventListener('daily-plan-updated', changed)"));
  assert.ok(dashboard.includes("readPrivateMemoryCache<HomeData>"));
  assert.ok(dashboard.includes("window.addEventListener('chapter-status-updated',changed)"));
  assert.ok(coach.includes("writePrivateMemoryCache(cacheScope,'dashboard:coach'"));
  assert.ok(planner.includes('const fallback = readPrivateMemoryCache<WeeklyChapterPlan>'));
  assert.ok(planner.includes('setChapterRequest({key: chapterKey, plan: null, error: false})'));
  assert.ok(dashboard.includes('setChapterPlan([])'));
  assert.ok(dashboard.includes('setChapterCoverage(null)'));
  assert.ok(coach.includes("setNotice('Refreshing learner progress…')"));
  assert.match(planner,/fetch\(endpoint \+ '\?' \+ params\.toString\(\), \{ cache: 'no-store'/);
});

test('navigation avoids eager prefetch of all private routes and clears cache after logout',()=>{
  const navigation=read('src/components/app-navigation.tsx');
  assert.ok(navigation.includes('useRouter'));
  assert.ok(navigation.includes('clearPrivateMemoryCache()'));
  assert.ok(navigation.includes('if(!isPrivateRoute(pathname))clearPrivateMemoryCache()'));
  assert.ok(navigation.includes('prefetch={false}'));
  assert.ok(navigation.includes('onTouchStart={()=>prefetchOnIntent(destination.href)}'));
});

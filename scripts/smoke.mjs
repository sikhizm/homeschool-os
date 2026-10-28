import assert from 'node:assert/strict';
const root = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
if (!['127.0.0.1', 'localhost'].includes(new URL(root).hostname))
  throw new Error('This smoke test is for a local server only.');
for (const [path, text] of [
  ['/roadmap', 'Roadmap'],
  ['/auth/sign-in', 'Welcome back'],
  ['/auth/forgot-password', 'Reset your password'],
]) {
  const response = await fetch(root + path);
  assert.equal(response.status, 200, path);
  assert.ok(
    (await response.text()).toLowerCase().includes(text.toLowerCase()),
    path,
  );
  console.log(`${path}: 200, expected content verified`);
}
const home = await fetch(root + '/', { redirect: 'manual' });
assert.ok([307, 308].includes(home.status));
assert.ok(home.headers.get('location')?.includes('/auth/sign-in'));
console.log('/: unauthenticated request redirected to sign-in');
const dashboard = await fetch(root + '/dashboard', { redirect: 'manual' });
assert.equal(dashboard.status, 307);
assert.ok(dashboard.headers.get('location').includes('/auth/sign-in'));
console.log('/dashboard: unauthenticated request redirected to sign-in');
const api = '/api/learners/11111111-1111-4111-8111-111111111111/workspace';
let response = await fetch(root + api + '?date=2026-10-27');
assert.equal(response.status, 401);
assert.ok(response.headers.get('cache-control').includes('no-store'));
console.log('Workspace GET: 401, no-store');
response = await fetch(root + api, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: root },
  body: '{}',
});
assert.equal(response.status, 401);
console.log('Workspace POST: 401 for same-origin unauthenticated request');
response = await fetch(root + api, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: 'https://attacker.invalid',
  },
  body: '{}',
});
assert.equal(response.status, 403);
console.log('Workspace POST: 403 for cross-origin request');
response = await fetch(root + '/api/health/database');
assert.ok([200, 503].includes(response.status));
assert.deepEqual(
  await response.json(),
  response.status === 200
    ? { status: 'ok', database: 'connected' }
    : { status: 'unavailable' },
);
console.log(
  `Database health: ${response.status}${response.status === 503 ? ' (database access is unavailable; this does not verify database readiness)' : ''}`,
);

const planning = await fetch(root + '/planning', { redirect: 'manual' });
assert.ok([307, 308].includes(planning.status));
assert.ok(planning.headers.get('location')?.includes('/auth/sign-in'));
console.log('/planning: unauthenticated request redirected');
let planningResponse = await fetch(root + '/api/planning?learnerId=11111111-1111-4111-8111-111111111111&date=2026-10-28');
assert.equal(planningResponse.status, 401);
assert.ok(planningResponse.headers.get('cache-control')?.includes('no-store'));
planningResponse = await fetch(root + '/api/planning', {method:'POST',headers:{'Content-Type':'application/json',Origin:root},body:'{}'});
assert.equal(planningResponse.status, 401);
planningResponse = await fetch(root + '/api/planning', {method:'POST',headers:{'Content-Type':'application/json',Origin:'https://attacker.invalid'},body:'{}'});
assert.equal(planningResponse.status, 403);
console.log('Planning API: 401 unauthenticated, 403 cross-origin');

const lessonPage = await fetch(root + '/lessons', { redirect: 'manual' });
assert.ok([307, 308].includes(lessonPage.status));
assert.ok(lessonPage.headers.get('location')?.includes('/auth/sign-in'));
console.log('/lessons: unauthenticated visitor redirected to sign-in');

const pilot = await fetch(root + '/november-pilot', { redirect: 'manual' });
assert.ok([307, 308].includes(pilot.status));
assert.ok(pilot.headers.get('location')?.includes('/auth/sign-in'));
console.log('/november-pilot: unauthenticated request redirected');

const portfolio = await fetch(root + '/portfolio', {redirect:'manual'});
assert.ok([307,308].includes(portfolio.status));
assert.ok(portfolio.headers.get('location')?.includes('/auth/sign-in'));
console.log('/portfolio: unauthenticated visitor redirected');
const portfolioApi='/api/learners/11111111-1111-4111-8111-111111111111/portfolio';
let proof=await fetch(root+portfolioApi);
assert.equal(proof.status,401);
assert.ok(proof.headers.get('cache-control')?.includes('no-store'));
proof=await fetch(root+portfolioApi,{method:'POST',headers:{'Content-Type':'application/json',Origin:root},body:'{}'});
assert.equal(proof.status,401);
proof=await fetch(root+portfolioApi,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://attacker.invalid'},body:'{}'});
assert.equal(proof.status,403);
console.log('Portfolio API: unauthenticated and cross-origin access blocked');

const reports=await fetch(root+'/reports',{redirect:'manual'});
assert.ok([307,308].includes(reports.status));
assert.ok(reports.headers.get('location')?.includes('/auth/sign-in'));
console.log('/reports: private route redirects unauthenticated visitors');

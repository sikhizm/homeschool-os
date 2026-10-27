import assert from 'node:assert/strict';
const root = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
if (!['127.0.0.1', 'localhost'].includes(new URL(root).hostname))
  throw new Error('This smoke test is for a local server only.');
for (const [path, text] of [
  ['/', 'Learning that grows with your family.'],
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

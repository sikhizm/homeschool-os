import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';
import type { SearchResponse } from '../src/lib/search/types';

test('search route requires a session and uses only the session identity for owner authorization', async () => {
  const bundle = await build({
    stdin: {
      contents: `export {GET} from './src/app/api/search/route'; export {setSession} from '@/lib/auth/server';`,
      resolveDir: process.cwd(),
    },
    bundle: true, write: false, platform: 'node', packages: 'external',
    plugins: [{
      name: 'isolated-search-auth',
      setup(api) {
        api.onResolve({ filter: /^@\/lib\/(auth\/server|db)$/ }, ({ path }) => ({ path, namespace: 'fixture' }));
        api.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({
          contents: path.endsWith('/server') ? `
            let user;
            export function setSession(id) { user = id ? {id} : null; }
            export const auth = {getSession: async () => ({data: {user}})};
          ` : `
            export function getSql() {
              return async (strings, id) => {
                const sql = strings.join('');
                if (!sql.includes('family_members') || !sql.includes("role='owner'") || sql.includes('learners'))
                  throw new Error('Unexpected search data access');
                return id === 'owner-a' ? [{authorized: true}] : [];
              };
            }
          `,
        }));
      },
    }],
  });
  const fixture = { exports: {} as {
    GET(request: Request): Promise<Response>;
    setSession(id: string | null): void;
  } };
  runInNewContext(bundle.outputFiles[0].text, {
    module: fixture, exports: fixture.exports, require: createRequire(import.meta.url), URL, URLSearchParams,
  });
  const { GET, setSession } = fixture.exports;
  const request = new Request('http://fixture/api/search?q=mapping%20review&category=features&user=owner-a&family=family-a');
  const denied = await GET(request);
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get('cache-control') ?? '', /no-store/);

  setSession('member-b');
  const member = await GET(request);
  assert.equal(member.status, 200);
  assert.ok(!((await member.json()) as SearchResponse).results.some(result => result.href === '/curriculum-mapping'));

  setSession('owner-a');
  const owner = await GET(request);
  assert.equal(owner.status, 200);
  assert.ok(((await owner.json()) as SearchResponse).results.some(result => result.href === '/curriculum-mapping'));
  assert.equal((await GET(new Request('http://fixture/api/search?category=constructor'))).status, 400);
});

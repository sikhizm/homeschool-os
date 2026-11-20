import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  clearPrivateMemoryCache,readPrivateMemoryCache,writePrivateMemoryCache,
  invalidatePrivateMemoryCache,PRIVATE_CACHE_TTL_MS,
} from '../src/lib/private-memory-cache';

test('only caches in short-lived memory and expires exactly at TTL',()=>{
  clearPrivateMemoryCache();
  assert.equal(PRIVATE_CACHE_TTL_MS,30_000);
  writePrivateMemoryCache('user-a','planning:learner-1:2026-11-20',{weekly:5},1000,100);
  assert.deepEqual(readPrivateMemoryCache('user-a','planning:learner-1:2026-11-20',1099),{weekly:5});
  assert.equal(readPrivateMemoryCache('user-a','planning:learner-1:2026-11-20',1100),undefined);
});

test('switching authenticated scope drops all cached learner records',()=>{
  clearPrivateMemoryCache();
  writePrivateMemoryCache('user-a','dashboard:coach',{name:'Private A'},5000,100);
  assert.equal(readPrivateMemoryCache('user-b','dashboard:coach',101),undefined);
  // Returning to the old scope must not restore a previous user's records.
  assert.equal(readPrivateMemoryCache('user-a','dashboard:coach',101),undefined);
});

test('invalidating changed planner data does not purge unrelated cached areas',()=>{
  clearPrivateMemoryCache();
  writePrivateMemoryCache('user-a','planning:learner-1:week-1',1,1000,100);
  writePrivateMemoryCache('user-a','planning:learner-1:week-2',2,1000,100);
  writePrivateMemoryCache('user-a','dashboard:coach',3,1000,100);
  invalidatePrivateMemoryCache('user-a','planning:learner-1:');
  assert.equal(readPrivateMemoryCache('user-a','planning:learner-1:week-1',101),undefined);
  assert.equal(readPrivateMemoryCache('user-a','planning:learner-1:week-2',101),undefined);
  assert.equal(readPrivateMemoryCache('user-a','dashboard:coach',101),3);
  invalidatePrivateMemoryCache('user-a');
  assert.equal(readPrivateMemoryCache('user-a','dashboard:coach',101),undefined);
});

test('cache is bounded to 24 entries without evicting recent lookups',()=>{
  clearPrivateMemoryCache();
  writePrivateMemoryCache('user-a','test:0',0,5000,100);
  for(let i=1;i<24;i++)writePrivateMemoryCache('user-a',`test:${i}`,i,5000,100);
  assert.equal(readPrivateMemoryCache('user-a','test:0',101),0);
  writePrivateMemoryCache('user-a','test:24',24,5000,101);
  assert.equal(readPrivateMemoryCache('user-a','test:1',102),undefined);
  assert.equal(readPrivateMemoryCache('user-a','test:0',102),0);
});

test('zero-TTL entries are never retained',()=>{
  clearPrivateMemoryCache();
  writePrivateMemoryCache('user-a','planning:zero','no',0,100);
  assert.equal(readPrivateMemoryCache('user-a','planning:zero',101),undefined);
});

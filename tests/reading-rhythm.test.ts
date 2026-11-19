import assert from 'node:assert/strict';
import {test} from 'node:test';
import {isTeachingDay, readingTiming} from '../src/lib/planning/reading-rhythm';

test('Friday reading stays pending until read and retains the original due date', () => {
  assert.equal(isTeachingDay('2026-11-21'), false);
  assert.equal(isTeachingDay('2026-11-22'), false);
  assert.equal(isTeachingDay('2026-11-23'), true);
  assert.deepEqual(readingTiming('2026-11-20', '2026-11-20', '2026-11-23', ['2026-11-19']), {
    completedOn: null, onTime: false, carriedOver: true,
  });
  assert.deepEqual(readingTiming('2026-11-20', '2026-11-20', '2026-11-23', ['2026-11-23']), {
    completedOn: '2026-11-23', onTime: false, carriedOver: false,
  });
});

test('all five weekday readings count on time, including after a later repeat', () => {
  const dates = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'];
  assert.equal(dates.filter(date => readingTiming(date, date, '2026-11-23', ['2026-11-23', date]).onTime).length, 5);
});

test('future reading evidence cannot finish a historical report item', () => {
  assert.equal(readingTiming('2026-11-16', '2026-11-22', '2026-11-22', ['2026-11-23']).completedOn, null);
});

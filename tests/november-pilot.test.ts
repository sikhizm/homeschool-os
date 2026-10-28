import { test } from 'node:test';
import assert from 'node:assert/strict';
import { class4Diagnostics, ukgDiagnostics, preschoolBank, infantGuidance, pilotWeek, totalGuidedMinutes, validatePilot } from '../src/lib/pilot/november';

test('November pilot is a coherent seven-day one-hour family plan',()=>{assert.deepEqual(validatePilot(),[]);assert.equal(totalGuidedMinutes(),60);assert.equal(pilotWeek[0].date,'2026-11-02');assert.equal(pilotWeek[6].date,'2026-11-08');});
test('age-specific baselines and play guidance are available',()=>{assert.ok(class4Diagnostics.length>=10);assert.ok(ukgDiagnostics.length>=8);assert.ok(preschoolBank.length>=8);assert.ok(infantGuidance.length>=5);});
test('diagnostic prompts have observable criteria and suggestions',()=>{for(const task of [...class4Diagnostics,...ukgDiagnostics]){assert.ok(task.prompt.length>25);assert.ok(task.lookFor.length>20);assert.ok(task.adjustment.length>15);}});

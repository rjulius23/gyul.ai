import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scenarios,
  initialState,
  transition,
  type WorkflowAction,
  type WorkflowState,
} from '../src/lib/workflows.ts';

for (const scenario of scenarios) {
  test(`${scenario.id}: playback waits for human approval`, () => {
    let state = initialState(scenario.id);
    state = transition(state, { type: 'run' });
    state = transition(state, { type: 'tick' });
    assert.equal(state.step, 1);
    state = transition(state, { type: 'tick' });
    assert.deepEqual(state, {
      scenario: scenario.id,
      step: 2,
      running: false,
      approved: false,
    });
    for (const action of [
      { type: 'tick' },
      { type: 'next' },
      { type: 'run' },
      { type: 'inspect', step: 3 },
    ] as WorkflowAction[]) {
      assert.equal(transition(state, action).step, 2);
    }
    state = transition(state, { type: 'approve' });
    assert.equal(state.step, 3);
    assert.equal(state.approved, true);
    assert.equal(state.running, false);
    assert.deepEqual(
      transition(state, { type: 'reset' }),
      initialState(scenario.id),
    );
    assert.deepEqual(transition(state, { type: 'run' }), {
      ...initialState(scenario.id),
      running: true,
    });
  });
  test(`${scenario.id}: static content contains four meaningful stages`, () => {
    assert.equal(scenario.stages.length, 4);
    for (const stage of scenario.stages) {
      assert.ok(
        stage.heading && stage.summary && stage.artifactTitle && stage.artifact,
      );
      assert.ok(stage.bullets.length >= 3);
    }
  });
}

test('pause ignores stale scheduled ticks', () => {
  const state = transition(transition(initialState(), { type: 'run' }), {
    type: 'pause',
  });
  assert.deepEqual(transition(state, { type: 'tick' }), state);
});
test('scenario changes revoke approval and reset the step', () => {
  const reviewed = transition(
    transition(initialState(), { type: 'inspect', step: 2 }),
    { type: 'approve' },
  );
  assert.deepEqual(
    transition(reviewed, { type: 'scenario', id: 'operations' }),
    initialState('operations'),
  );
});
test('approval is meaningful only at the review stage', () => {
  assert.deepEqual(
    transition(initialState(), { type: 'approve' }),
    initialState(),
  );
});
test('all reachable states enforce review before output', () => {
  const actions: WorkflowAction[] = [
    ...scenarios.map(({ id }) => ({ type: 'scenario' as const, id })),
    { type: 'run' },
    { type: 'pause' },
    { type: 'tick' },
    { type: 'next' },
    { type: 'reset' },
    { type: 'approve' },
    { type: 'inspect', step: 0 },
    { type: 'inspect', step: 1 },
    { type: 'inspect', step: 2 },
    { type: 'inspect', step: 3 },
  ];
  const queue: WorkflowState[] = [initialState()];
  const visited = new Set<string>();
  for (let index = 0; index < queue.length; index++) {
    const state = queue[index]!;
    const key = JSON.stringify(state);
    if (visited.has(key)) continue;
    visited.add(key);
    assert.ok(state.step !== 3 || state.approved, key);
    assert.ok(!(state.running && state.step === 2 && !state.approved), key);
    assert.ok(!(state.running && state.step === 3), key);
    for (const action of actions) queue.push(transition(state, action));
    assert.ok(visited.size < 100, 'State space must stay bounded');
  }
  assert.equal(visited.size, 36);
});

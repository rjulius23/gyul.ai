import {
  getScenario,
  initialState,
  isScenario,
  stageLabels,
  stateMessage,
  transition,
  type WorkflowAction,
  type Step,
} from '../lib/workflows';
import { required, noop } from './dom';

// Preserve the local demo across back-forward cache restores, never in browser storage.
let restoredState = initialState();

export function initPlayground(): () => void {
  const root = document.querySelector<HTMLElement>('[data-playground]');
  if (!root) return noop;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const tabs = [
    ...root.querySelectorAll<HTMLButtonElement>('[data-scenario-id]'),
  ];
  const steps = [...root.querySelectorAll<HTMLButtonElement>('[data-step]')];
  const panel = required<HTMLElement>(root, '[data-workflow-panel]');
  const title = required<HTMLElement>(root, '[data-stage-title]');
  const summary = required<HTMLElement>(root, '[data-stage-summary]');
  const bullets = required<HTMLUListElement>(root, '[data-stage-bullets]');
  const artifact = required<HTMLElement>(root, '[data-artifact]');
  const artifactName = required<HTMLElement>(root, '[data-artifact-name]');
  const artifactState = required<HTMLElement>(root, '[data-artifact-state]');
  const count = required<HTMLElement>(root, '[data-stage-count]');
  const intent = required<HTMLElement>(root, '[data-scenario-intent]');
  const run = required<HTMLButtonElement>(root, '[data-run]');
  const runLabel = required<HTMLElement>(root, '[data-run-label]');
  const next = required<HTMLButtonElement>(root, '[data-next]');
  const approve = required<HTMLButtonElement>(root, '[data-approve]');
  const reset = required<HTMLButtonElement>(root, '[data-reset]');
  const status = required<HTMLElement>(root, '[data-workflow-status]');
  let state = restoredState;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function dispatch(action: WorkflowAction) {
    state = transition(state, action);
    render();
  }
  function render() {
    clearTimeout(timer);
    const scenario = getScenario(state.scenario);
    const content = scenario.stages[state.step];
    const waiting = state.step === 2 && !state.approved;
    const activeBeforeRender = document.activeElement;
    root!.dataset.state = state.running
      ? 'running'
      : waiting
        ? 'awaiting-review'
        : state.step === 3
          ? 'complete'
          : 'idle';
    root!.dataset.step = String(state.step);
    panel.setAttribute('aria-labelledby', `scenario-${state.scenario}`);
    tabs.forEach((tab) => {
      const selected = tab.dataset.scenarioId === state.scenario;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    steps.forEach((button, index) => {
      button.disabled = false;
      button.parentElement!.dataset.active = String(index === state.step);
      if (index === state.step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    intent.textContent = scenario.intent;
    title.textContent = content.heading;
    summary.textContent = content.summary;
    bullets.replaceChildren(
      ...content.bullets.map((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        return item;
      }),
    );
    count.textContent = `0${state.step + 1} / ${stageLabels[state.step].toUpperCase()}`;
    artifactName.textContent = content.artifactTitle;
    artifact.textContent = content.artifact;
    artifactState.textContent = `${stageLabels[state.step].toUpperCase()} / 0${state.step + 1}`;
    approve.hidden = !waiting;
    run.disabled = waiting;
    next.disabled = waiting || state.step === 3;
    runLabel.textContent = state.running
      ? 'Pause demo'
      : state.step === 3
        ? 'Replay demo'
        : 'Run demo';
    status.textContent = stateMessage(state);
    if (
      waiting &&
      (activeBeforeRender === run || activeBeforeRender === next)
    ) {
      approve.focus({ preventScroll: true });
    }
    if (state.running)
      timer = setTimeout(() => dispatch({ type: 'tick' }), 1600);
  }

  tabs.forEach((tab, index) => {
    const choose = () => {
      const id = tab.dataset.scenarioId;
      if (id && isScenario(id)) dispatch({ type: 'scenario', id });
    };
    tab.addEventListener('click', choose, options);
    tab.addEventListener(
      'keydown',
      (event) => {
        const nextIndex =
          event.key === 'ArrowRight'
            ? (index + 1) % tabs.length
            : event.key === 'ArrowLeft'
              ? (index + tabs.length - 1) % tabs.length
              : event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? tabs.length - 1
                  : -1;
        if (nextIndex < 0) return;
        event.preventDefault();
        tabs[nextIndex]?.focus();
        tabs[nextIndex]?.click();
      },
      options,
    );
  });
  steps.forEach((button, index) =>
    button.addEventListener(
      'click',
      () => dispatch({ type: 'inspect', step: index as Step }),
      options,
    ),
  );
  run.addEventListener(
    'click',
    () => dispatch({ type: state.running ? 'pause' : 'run' }),
    options,
  );
  next.addEventListener('click', () => dispatch({ type: 'next' }), options);
  reset.addEventListener('click', () => dispatch({ type: 'reset' }), options);
  approve.addEventListener(
    'click',
    () => {
      dispatch({ type: 'approve' });
      // The approval button disappears: move focus to the now-current output step.
      steps[3]?.focus({ preventScroll: true });
    },
    options,
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden && state.running) dispatch({ type: 'pause' });
    },
    options,
  );
  panel.setAttribute('role', 'tabpanel');
  required<HTMLElement>(root, '[data-scenario-tabs]').hidden = false;
  required<HTMLElement>(root, '[data-lab-controls]').hidden = false;
  render();
  return () => {
    restoredState = transition(state, { type: 'pause' });
    clearTimeout(timer);
    controller.abort();
  };
}

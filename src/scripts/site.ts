import { initNavigation } from './navigation';
import { initBrief } from './brief';
import { initPlayground } from './playground';
import { initSignal } from './signal';

let cleanups: Array<() => void> = [];
function unmount() {
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
}
function mount() {
  unmount();
  for (const initialize of [
    initNavigation,
    initBrief,
    initPlayground,
    initSignal,
  ]) {
    try {
      cleanups.push(initialize());
    } catch (error) {
      console.error(
        `Could not initialize ${initialize.name}; static content remains available.`,
        error,
      );
    }
  }
}
mount();
window.addEventListener('pagehide', unmount);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) mount();
});

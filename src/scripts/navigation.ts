import { required, noop } from './dom';

export function initNavigation(): () => void {
  const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  if (!menu) return noop;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const summary = required<HTMLElement>(menu, 'summary');
  const desktop = window.matchMedia('(min-width: 801px)');
  let focusTimer: ReturnType<typeof setTimeout> | undefined;

  menu.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (
        !link ||
        (event instanceof MouseEvent &&
          (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey))
      )
        return;
      menu.open = false;
      const section = document.getElementById(link.hash.slice(1));
      const target = section?.querySelector<HTMLElement>('h2') ?? section;
      if (target) {
        target.tabIndex = -1;
        clearTimeout(focusTimer);
        // Native fragment navigation first updates focus; move it only after that default action.
        focusTimer = setTimeout(() => target.focus({ preventScroll: true }), 0);
      }
      // Keep the browser's native fragment/history/scroll behavior intact.
    },
    options,
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && menu.open) {
        event.preventDefault();
        menu.open = false;
        summary.focus();
      }
    },
    options,
  );
  document.addEventListener(
    'click',
    (event) => {
      if (
        menu.open &&
        event.target instanceof Node &&
        !menu.contains(event.target)
      )
        menu.open = false;
    },
    options,
  );
  desktop.addEventListener(
    'change',
    () => {
      if (!desktop.matches) return;
      if (menu.contains(document.activeElement))
        document
          .querySelector<HTMLElement>('.wordmark')
          ?.focus({ preventScroll: true });
      menu.open = false;
    },
    options,
  );
  return () => {
    clearTimeout(focusTimer);
    controller.abort();
  };
}

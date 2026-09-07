import { createBrief, isInterest } from '../lib/brief';
import { required, noop } from './dom';

export function initBrief(): () => void {
  const root = document.querySelector<HTMLElement>('[data-brief]');
  if (!root) return noop;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const select = required<HTMLSelectElement>(root, '[data-interest-select]');
  const context = required<HTMLTextAreaElement>(root, '[data-brief-context]');
  const output = required<HTMLTextAreaElement>(root, '[data-brief-output]');
  const link = required<HTMLAnchorElement>(root, '[data-email-draft]');
  const status = required<HTMLElement>(root, '[data-brief-status]');
  const copy = required<HTMLButtonElement>(root, '[data-copy-brief]');

  function update() {
    const draft = createBrief(
      isInterest(select.value) ? select.value : 'strategy',
      context.value,
    );
    output.value = draft.body;
    link.href = draft.href;
    status.textContent = 'Nothing is submitted by this page.';
  }
  select.addEventListener('change', update, options);
  context.addEventListener('input', update, options);
  document
    .querySelectorAll<HTMLAnchorElement>('a[data-interest]')
    .forEach((anchor) => {
      anchor.addEventListener(
        'click',
        () => {
          const interest = anchor.dataset.interest;
          if (interest && isInterest(interest)) {
            select.value = interest;
            update();
          }
        },
        options,
      );
    });
  copy.addEventListener(
    'click',
    async () => {
      try {
        if (!navigator.clipboard?.writeText)
          throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(output.value);
        if (!controller.signal.aborted)
          status.textContent = 'Brief copied. Paste it wherever you prefer.';
      } catch {
        if (controller.signal.aborted) return;
        output.focus();
        output.select();
        status.textContent =
          'Clipboard unavailable. Your draft is selected—copy it manually.';
      }
    },
    options,
  );
  update();
  required<HTMLElement>(root, '[data-brief-fields]').hidden = false;
  return () => controller.abort();
}

import { createSignalGeometry, projectSignal, ringStyle } from '../lib/signal';
import { required, noop } from './dom';

export function initSignal(): () => void {
  const root = document.querySelector<HTMLElement>('[data-signal]');
  if (!root) return noop;
  const canvas = required<HTMLCanvasElement>(root, '[data-signal-canvas]');
  const context = canvas.getContext('2d');
  if (!context) return noop; // Static SVG stays visible if Canvas is unavailable.
  const fallback = required<SVGElement>(root, '[data-signal-static]');
  const button = required<HTMLButtonElement>(root, '[data-art-pause]');
  const label = required<HTMLElement>(root, '[data-motion-label]');
  const icon = required<HTMLElement>(root, '[data-motion-icon]');
  const note = required<HTMLElement>(root, '[data-motion-note]');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const geometry = createSignalGeometry();
  let frameId = 0;
  let visible = false;
  let ready = false;
  let paused = button.dataset.paused === 'true';
  let phase = 0;
  let lastPaint = 0;
  let pointerX = 0,
    pointerY = 0,
    currentX = 0,
    currentY = 0;

  function paint() {
    if (!context) return;
    context.setTransform(canvas.width / 600, 0, 0, canvas.height / 530, 0, 0);
    context.clearRect(0, 0, 600, 530);
    context.fillStyle = 'rgba(32,37,31,.045)';
    context.beginPath();
    context.ellipse(307, 467, 138, 12, 0, 0, Math.PI * 2);
    context.fill();
    const rings = projectSignal(
      geometry,
      0.65 + Math.sin(phase) * 0.08 + currentY * 0.1,
      -0.28 + Math.sin(phase * 0.7) * 0.14 + currentX * 0.16,
      -0.3 + Math.sin(phase * 0.6) * 0.07,
    );
    context.lineWidth = 0.72;
    for (const ring of rings) {
      const style = ringStyle(ring);
      context.beginPath();
      ring.points.forEach((point, index) =>
        index
          ? context.lineTo(point.x, point.y)
          : context.moveTo(point.x, point.y),
      );
      context.closePath();
      context.fillStyle = style.fill;
      context.fill();
      context.strokeStyle = style.stroke;
      context.stroke();
    }
  }
  function canAnimate() {
    return ready && visible && !paused && !reduced.matches && !document.hidden;
  }
  function frame(time: number) {
    frameId = 0;
    if (!canAnimate()) return;
    if (time - lastPaint >= 1000 / 30) {
      phase += 0.006;
      currentX += (pointerX - currentX) * 0.08;
      currentY += (pointerY - currentY) * 0.08;
      paint();
      lastPaint = time;
    }
    frameId = requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    const motionHadFocus = document.activeElement === button;
    const noteHadFocus = document.activeElement === note;
    button.hidden = reduced.matches || !ready;
    note.hidden = !reduced.matches;
    if (reduced.matches && motionHadFocus) {
      note.tabIndex = -1;
      note.focus({ preventScroll: true });
    }
    if (!reduced.matches && noteHadFocus && ready)
      button.focus({ preventScroll: true });
    button.dataset.paused = String(paused);
    label.textContent = paused ? 'Resume motion' : 'Pause motion';
    icon.textContent = paused ? '▷' : 'Ⅱ';
    root!.dataset.motion = reduced.matches
      ? 'reduced'
      : paused
        ? 'paused'
        : canAnimate()
          ? 'running'
          : 'idle';
    if (reduced.matches) {
      canvas.hidden = true;
      fallback.style.visibility = 'visible';
    } else if (ready) {
      canvas.hidden = false;
      fallback.style.visibility = 'hidden';
      paint();
      if (canAnimate()) frameId = requestAnimationFrame(frame);
    }
  }
  function resize() {
    const bounds = fallback.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    if (ready && !reduced.matches) paint();
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      sync();
    },
    { threshold: 0.05 },
  );
  observer.observe(root);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(fallback);
  button.addEventListener(
    'click',
    () => {
      paused = !paused;
      sync();
    },
    options,
  );
  reduced.addEventListener('change', sync, options);
  document.addEventListener('visibilitychange', sync, options);
  root.addEventListener(
    'pointermove',
    (event) => {
      if (!finePointer.matches || reduced.matches || paused) return;
      const bounds = root.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    },
    options,
  );
  root.addEventListener(
    'pointerleave',
    () => {
      pointerX = 0;
      pointerY = 0;
    },
    options,
  );
  // Static artwork paints immediately; enhancement starts after first render.
  const startTimer = setTimeout(() => {
    ready = true;
    resize();
    sync();
  }, 350);
  return () => {
    clearTimeout(startTimer);
    cancelAnimationFrame(frameId);
    observer.disconnect();
    sizeObserver.disconnect();
    controller.abort();
  };
}

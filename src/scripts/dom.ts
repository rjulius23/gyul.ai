export function required<T extends Element>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing enhancement element: ${selector}`);
  return element;
}
export const noop = () => {};

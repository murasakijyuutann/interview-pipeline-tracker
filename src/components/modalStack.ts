type CloseFn = () => void;

const stack: CloseFn[] = [];

export function pushModal(close: CloseFn): void {
  stack.push(close);
}

export function popModal(close: CloseFn): void {
  const index = stack.lastIndexOf(close);
  if (index !== -1) stack.splice(index, 1);
}

export function isTopModal(close: CloseFn): boolean {
  return stack.length > 0 && stack[stack.length - 1] === close;
}

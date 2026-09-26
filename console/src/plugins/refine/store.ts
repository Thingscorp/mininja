/** Refine is a switch. On means the next prompt turn is live. Off means not. */

export type Store = { on: boolean };

let store: Store = { on: false };

export function resetStore(): Store {
  store = { on: false };
  return store;
}

export function getStore(): Store {
  return store;
}

export function isOn(): boolean {
  return store.on;
}

export function setOn(next: boolean): boolean {
  store.on = next;
  return store.on;
}

export function toggle(): boolean {
  store.on = !store.on;
  return store.on;
}

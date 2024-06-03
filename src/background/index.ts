/* eslint-disable @typescript-eslint/no-explicit-any */
import storage from './storage.ts';
import session from './services/session.ts';
import accessServive from './services/accessService.ts';

const restoreSessionState = async() => {
  const sessionState: any = await session.get(null);
  accessServive.store.session.updateState(sessionState);
  accessServive.store.session.subscribe((value: any) => session.set(value));
};

const restoreState = async() => {
  const state: any = await storage.get(null);
  accessServive.store.loadStore(state);
  accessServive.store.store.subscribe((value: any) => storage.set(value));
};

Promise.all([
  restoreState(),
  restoreSessionState()
])
.then(() => accessServive.store.restoreCache());

export { default as accessService } from './services/accessService.ts';
export { default as sessionService } from './services/session.ts';

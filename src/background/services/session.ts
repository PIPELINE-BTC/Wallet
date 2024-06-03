/* eslint-disable @typescript-eslint/no-explicit-any */
const set = (value: Record<string, any>) => {
  return new Promise((resolve) =>
    chrome.storage.session.set(value, () => resolve(value))
  );
};

const remove = () => {
  return chrome.storage.session.remove(['isUnlocked']);
};

const get = (key: string | null) => {
  return new Promise((resolve) =>
    chrome.storage.session.get(key, (res) => {
      resolve(key ? res[key] : res);
    })
  );
};

const clearSession = () => chrome.storage.session.clear();

export default {
  set,
  remove,
  get,
  clearSession,
};

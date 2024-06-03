/* eslint-disable @typescript-eslint/no-explicit-any */
export const setToStorage = (data: Record<string, any>) => {
  chrome.storage.local.set(data);
};

const get = (key: string | null) => {
  return new Promise((resolve) =>
    chrome.storage.local.get(key, (res) => {
      resolve(key ? res[key] : res);
    })
  );
};

const set = (data: Record<string, any>) => {
  return new Promise((resolve) =>
    chrome.storage.local.set(data, () => {
      resolve({ message: 'succesfully added' });
    })
  );
};

const remove = (keys: string | string[]) => {
  return new Promise((resolve) =>
    chrome.storage.local.remove(keys, () => {
      resolve({ message: `${keys} succesfully removed` });
    })
  );
};

const clearStorage = () => chrome.storage.local.clear();

export default {
  get,
  set,
  remove,
  clearStorage
};

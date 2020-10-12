enum LocalStorageKeys {
  isSoundEffect = "isSoundEffect",
}

function getLocalStorage(key: string): any | null {
  let value: string | null = localStorage.getItem(key);
  value = value ? JSON.parse(value) : null;
  return value;
}
function setLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getIsSoundEffect() {
  return getLocalStorage(LocalStorageKeys.isSoundEffect);
}

export function setIsSoundEffect(bool: boolean) {
  setLocalStorage(LocalStorageKeys.isSoundEffect, bool);
}

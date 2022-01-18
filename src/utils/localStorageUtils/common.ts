export function getLocalStorage(key: string): any | null {
  console.log(`Getting ${key} from localStorage`);
  let value: string | null = localStorage.getItem(key);
  value = value ? JSON.parse(value) : null;
  return value;
}

export function setLocalStorage(key: string, value: any) {
  value = JSON.stringify(value);
  console.log(`Setting ${key}: ${value} to localStorage`);
  localStorage.setItem(key, value);
}

export function deleteLocalStorage(key: string) {
  console.log(`Deleting ${key} from localStorage`);
  localStorage.removeItem(key);
}

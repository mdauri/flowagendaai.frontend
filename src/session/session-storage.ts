const TOKEN_KEY = "agendoro:token";
const tokenListeners = new Set<() => void>();

function notifyTokenListeners() {
  for (const listener of tokenListeners) {
    listener();
  }
}

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  notifyTokenListeners();
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  notifyTokenListeners();
}

export function subscribeToStoredToken(listener: () => void): () => void {
  tokenListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    tokenListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

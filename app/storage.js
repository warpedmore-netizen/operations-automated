(function attachStorage(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.OPERATEStorage = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function storageFactory() {
  "use strict";

  const STORAGE_KEY = "operations-automated.workspace.v1";

  function load(storage) {
    try {
      const value = storage.getItem(STORAGE_KEY);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  function save(storage, workspace) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(workspace));
      return true;
    } catch {
      return false;
    }
  }

  function clear(storage) {
    try {
      storage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  return { STORAGE_KEY, clear, load, save };
});

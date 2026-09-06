// src/env.ts
var isDevDefault = typeof process !== "undefined" && process?.env?.NODE_ENV ? process.env.NODE_ENV !== "production" : typeof import.meta !== "undefined" && import.meta.env?.MODE ? import.meta.env.MODE !== "production" : true;
export {
  isDevDefault
};
//# sourceMappingURL=env.js.map
/**
 * Creates a deep copy of an object or array, with protection against circular references.
 * @param {T} obj The object or array to copy.
 * @param {WeakMap} [visited=new WeakMap()] A weak map to store visited objects to prevent infinite loops.
 * @returns {T} A deep copy of the input.
 * @template T
 */
export function deepCopy(obj, visited = new WeakMap()) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Check for circular reference
  if (visited.has(obj)) {
    return visited.get(obj);
  }

  // Handle Date
  if (obj instanceof Date) {
    const dateCopy = new Date(obj.getTime());
    visited.set(obj, dateCopy);
    return dateCopy;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrCopy = [];
    visited.set(obj, arrCopy);
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepCopy(obj[i], visited);
    }
    return arrCopy;
  }

  // Handle Object
  const objCopy = {};
  visited.set(obj, objCopy);
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      objCopy[key] = deepCopy(obj[key], visited);
    }
  }

  return objCopy;
}

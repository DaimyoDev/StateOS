/**
 * Creates a deep copy of an object or array, with protection against circular references.
 * @param {T} obj The object or array to copy.
 * @param {Map} [hash=new Map()] A map to store visited objects to prevent infinite loops.
 * @returns {T} A deep copy of the input.
 * @template T
 */
export function deepCopy(obj, hash = new Map()) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // --- FIX: Circular reference check ---
  // If we have already seen this object, return the copy we've already made.
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // Handle Date
  if (obj instanceof Date) {
    const dateCopy = new Date(obj.getTime());
    hash.set(obj, dateCopy); // Store the copy
    return dateCopy;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrCopy = [];
    hash.set(obj, arrCopy); // Store the copy BEFORE recursive calls
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepCopy(obj[i], hash);
    }
    return arrCopy;
  }

  // Handle Object
  const objCopy = {};
  hash.set(obj, objCopy); // Store the copy BEFORE recursive calls
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      objCopy[key] = deepCopy(obj[key], hash);
    }
  }

  return objCopy;
}

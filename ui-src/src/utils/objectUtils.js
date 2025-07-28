// src/utils/objectUtils.js

/**
 * Creates a deep copy of an object or array.
 * This is more robust than JSON.parse(JSON.stringify(obj)) as it handles more data types.
 * @param {T} obj The object or array to copy.
 * @returns {T} A deep copy of the input.
 * @template T
 */
export function deepCopy(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrCopy = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepCopy(obj[i]);
    }
    return arrCopy;
  }

  // Handle Object
  const objCopy = {};
  for (const key in obj) {
    // CORRECTED: Use the safer method to check for own properties.
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      objCopy[key] = deepCopy(obj[key]);
    }
  }

  return objCopy;
}

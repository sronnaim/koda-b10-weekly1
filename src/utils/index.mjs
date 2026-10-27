import { newAppError } from "../errors/index.mjs";

/**
 *
 * @param {number} num
 * @returns
 */
export function toIDR(num) {
  return num.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
}

/**
 *
 * @param {Date} date
 * @returns
 */
export function toJakartaLocalTime(date) {
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

export function generateOptionsMapForItems(items, start = 1) {
  if (!Array.isArray(items)) throw newAppError("Array needed to generate options");

  let key = start;

  const map = items.reduce((prevMap, item) => {
    prevMap.set(`${key}`, item);

    key++;

    return prevMap;
  }, new Map());

  return map;
}

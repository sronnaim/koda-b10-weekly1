/**
 * @typedef {(any) => (string) => string | undefined } ValidationFn
 */

/**
 * @type {ValidationFn}
 * @param {number} qty
 */
export function inQuantity(qty) {
  return (input) => {
    const num = Number(input);

    if (Number.isNaN(num) || (input.startsWith("0") && input !== "0")) return `Whoops, '${input}' bukan quantity valid, ayo cek lagi`;

    if (num < 1) return "Quantity minimal 1";

    if (num > qty) return `Quantity tidak bisa melebihi ${qty}`;
  };
}

/**
 * @type {ValidationFn}
 * @param {string[]} array
 */
export function inArray(array) {
  return (input) => {
    if (!array.includes(input)) return `Pilihan '${input}' tidak dikenali`;
  };
}

export function inQuantityAndArray(qty, array) {
  return (input) => {
    const errMsg = inArray(array)(input);

    if (!errMsg) return;

    return inQuantity(qty)(input);
  };
}

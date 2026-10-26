import { newApp } from "./app/index.mjs";
import { handleCart, handleConfirm, handleCreateOrder, handleExit, handleHistory, handleMainMenu, handleOrder } from "./pages/index.mjs";

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {number} stock
 */

/**
 * @typedef {Object} Destination
 * @property {string} nextPage
 * @property {any} [context]
 */

/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {number} qty
 */

/**
 * @typedef {(string) => { valid: Boolean, msg: string | undefined }} ValidationFn
 */

/**
 * @typedef {([any]) => Promise<Destination>} PageHandler
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} productId
 * @property {string} name
 * @property {number} qty
 * @property {number} price
 * @property {number} subtotal
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {OrderItem[]} items
 * @property {number} total
 * @property {Date} createdAt
 */

function main() {
  const app = newApp();

  app.register("main-menu", handleMainMenu);
  app.register("exit", handleExit);
  app.register("order", handleOrder);
  app.register("cart", handleCart);
  app.register("history", handleHistory);
  app.register("confirm", handleConfirm);
  app.register("create-order", handleCreateOrder);

  app.run("main-menu");
}

main();

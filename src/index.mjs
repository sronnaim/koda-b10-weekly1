import { randomUUIDv7 } from "node:crypto";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";
import { toIDR, toJakartaLocalTime } from "./utils/index.mjs";

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

/**
 * @type {Product[]}
 */
const products = [
  // Source: GoFood
  // Menu Murah
  { id: 1, name: "Original Tsuka", price: 24000, stock: 50 },
  { id: 2, name: "Miso Tsuka Ramen Komplit", price: 26000, stock: 50 },

  // Tsuka Bento Hemat
  { id: 3, name: "Tsuka Bento Hemat A", price: 21000, stock: 50 },
  { id: 4, name: "Tsuka Bento Hemat B", price: 21000, stock: 50 },
  { id: 5, name: "Tsuka Bento Hemat C", price: 21000, stock: 50 },

  // Ala Carte
  { id: 6, name: "Shrimp Roll", price: 12000, stock: 50 },
  { id: 7, name: "Lumpia Udang", price: 12000, stock: 50 },
  { id: 8, name: "Tori Ball", price: 12000, stock: 50 },
  { id: 9, name: "Spicy Tori Ball", price: 12000, stock: 50 },
  { id: 10, name: "Ayam Keju", price: 12000, stock: 50 },

  // Tsuka Bento Super Hemat
  { id: 11, name: "Tsuka Bento Super Hemat A", price: 19000, stock: 50 },
  { id: 12, name: "Tsuka Bento Super Hemat B", price: 19000, stock: 50 },
  { id: 13, name: "Tsuka Bento Super Hemat C", price: 19000, stock: 50 },

  // Mie Ayam Tsuka Jepang
  { id: 14, name: "Mie Ayam Tsuka", price: 21000, stock: 50 },

  // Tsuka Ramen Basic
  { id: 16, name: "Original Tsuka Ramen Basic", price: 20000, stock: 50 },
  { id: 17, name: "Miso Tsuka Ramen Basic", price: 22000, stock: 50 },
  { id: 18, name: "Volcano Ramen Basic", price: 25000, stock: 50 },
  { id: 19, name: "Red Ninja Ramen Basic", price: 25000, stock: 50 },

  // Tsuka Ramen Komplit
  { id: 20, name: "Volcano Ramen Komplit", price: 28000, stock: 50 },
  { id: 21, name: "Red Ninja Ramen Komplit", price: 28000, stock: 50 },

  // Side Dish
  { id: 22, name: "Chicken Karaage Yakitori (Spicy)", price: 9000, stock: 50 },
  { id: 23, name: "Fried Gyoza", price: 12000, stock: 50 },
  { id: 24, name: "Nori Tempura", price: 6000, stock: 50 },
  { id: 25, name: "Egg Tempura", price: 8000, stock: 50 },
  { id: 26, name: "Chicken Money Bag", price: 6000, stock: 50 },
  { id: 27, name: "Monster Crab Stick", price: 10000, stock: 50 },
  { id: 28, name: "Egg Roll", price: 8000, stock: 50 },
  { id: 29, name: "Chicken Karaage Yakitori (Mentai)", price: 9000, stock: 50 },
  // Drinks
  { id: 30, name: "Es Mango Sagoo", price: 10000, stock: 50 },
  { id: 31, name: "Es Teh Susu Cincau", price: 10000, stock: 50 },
  { id: 32, name: "Teh Hijau Tawar Dingin", price: 6000, stock: 50 },
  { id: 33, name: "Air Mineral", price: 7000, stock: 50 },
  { id: 34, name: "Es Teh Blackcurrant", price: 8000, stock: 50 },
  { id: 35, name: "Es Teh Leci", price: 8000, stock: 50 },
  { id: 36, name: "Es Cokelat Susu", price: 9000, stock: 50 },
  { id: 37, name: "Mango Yakult", price: 9000, stock: 50 },
];

/**
 * @type {CartItem[]}
 */
const cart = [];

/**
 * @type {Order[]}
 */
const orders = [];

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

/**
 * @type {Map<string, PageHandler}
 */
const pagesRegistry = new Map();

const STOP_SIGNAL = Symbol.for("stop");

/**
 *
 * @param {Destination} nextDestination
 */
function runPage(nextDestination) {
  let { nextPage, context } = nextDestination;

  if (nextPage === STOP_SIGNAL) return Promise.resolve();

  if (!pagesRegistry.has(nextPage)) {
    console.log(`\nPage ${nextPage} does not exist`);

    if (!pagesRegistry.has("mainMenu")) {
      console.log("Main Menu has not registered yet, exiting ...");
      return Promise.resolve(STOP_SIGNAL);
    }

    console.log("Navigating to Main Menu");
    nextPage = "mainMenu";
  }

  return pagesRegistry
    .get(nextPage)(context)
    .then((nextDestination) => {
      return runPage(nextDestination);
    });
}

/**
 *
 * @param {string} question
 * @param {ValidationFn} validation
 */
function ask(question, validation) {
  return rl.question("\n" + question + "\n> ").then((answer) => {
    const a = answer.trim();

    const { valid, msg } = validation(a);

    if (msg) console.log(msg);

    if (!valid) return ask(question, validation);

    return a;
  });
}

/**
 * @typedef {(any) => (string) => { valid: Boolean, msg: string | undefined }} ValidationFn
 */

/**
 * @type {ValidationFn}
 * @param {number} qty
 */
function inQuantity(qty) {
  return (input) => {
    const num = Number(input);

    if (Number.isNaN(num) || (input.startsWith("0") && input !== "0")) return {
      valid: false,
      msg: `Whoops, '${input}' bukan quantity valid, ayo cek lagi`,
    };

    if (num < 1) return { valid: false, msg: "Quantity minimal 1" };

    if (num > qty) return { valid: false, msg: `Quantity tidak bisa melebihi ${qty}` };

    return { valid: true };
  };
}

/**
 * @type {ValidationFn}
 * @param {string[]} array
 */
function inArray(array) {
  return (input) => {
    if (!array.includes(input)) return { valid: false, msg: `Pilihan '${input}' tidak dikenali` };

    return { valid: true };
  };
}

function inQuantityAndArray(qty, array) {
  return (input) => {
    const { valid: isInArray } = inArray(array)(input);

    if (isInArray) return { valid: true };

    const { valid: isValidQuantity, msg } = inQuantity(qty)(input);

    if (isValidQuantity) return { valid: true };

    return { valid: false, msg };
  };
}

/**
 * @type {PageHandler}
 */
function handleMainMenu() {
  const mainMenuNavs = {
    1: {
      page: "order",
      label: "Menu Pesanan",
    },
    2: {
      page: "cart",
      label: "Keranjang",
    },
    3: {
      page: "history",
      label: "Riwayat Pesanan",
    },
    0: {
      page: "exit",
      label: "Keluar",
    },
  };

  console.log("\nMain Menu\n");
  Object.entries(mainMenuNavs).forEach(([key, { label }]) => {
    console.log(`${key}. ${label}`);
  });

  return ask("Pilih: ", inArray(Object.keys(mainMenuNavs))).then((a) => {
    return { nextPage: mainMenuNavs[a].page };
  });
}

/**
 * @type {PageHandler}
 */
function handleExit() {
  console.log("\nSampai jumpa kembali!\n");
  rl.close();
  return Promise.resolve({ nextPage: STOP_SIGNAL });
}

/**
 * @type {PageHandler}
 */
function handleOrder() {
  const orderNavs = {
    "00": {
      page: "mainMenu",
      label: "Kembali ke Main Menu",
    },
    "01": {
      page: "cart",
      label: "Lihat keranjang",
    },
  };

  console.log("\nMenu Pesanan\n");

  products.forEach((i) => console.log(
    `${i.stock > 0 ? `${i.id}. ` : "--"} ${i.name} | harga: ${toIDR(i.price)} | ${i.stock > 0 ? `stok: ${i.stock}` : "stok habis"}`,
  ),
  );

  console.log("");

  Object.entries(orderNavs).forEach(([key, { label }]) => {
    console.log(`${key}. ${label}`);
  });

  return ask(
    "Pilih: ",
    inArray([
      ...Object.keys(orderNavs),
      ...products.map((p) => p.id.toString(10)),
    ]),
  ).then((a) => {
    if (Object.keys(orderNavs).includes(a)) return { nextPage: orderNavs[a].page };

    return { nextPage: "confirm", context: { id: Number(a), qty: 1 } };
  });
}

/**
 * @type {PageHandler}
 */
function handleCart() {
  console.log("\nKeranjang Pesanan\n");

  if (cart.length === 0) {
    console.log("Keranjang masih kosong, yuk mulai pilih");
    return ask("1. Ke menu pesanan", inArray(["1"])).then(() => {
      return { nextPage: "order" };
    });
  }

  console.log("Nama Menu | Quantity | Subtotal");

  let total = 0;

  cart.forEach((i) => {
    const item = products.find((p) => p.id === i.id);

    if (item) {
      const subtotal = item.price * i.qty;
      console.log(`${item.name} | ${i.qty} | ${toIDR(subtotal)}`);
      total += subtotal;
    }
  });

  console.log(`\nTotal pesanan di keranjang: ${toIDR(total)}`);

  console.log("\n1. Buat pesanan");
  console.log("2. Kosongkan keranjang");
  console.log("3. Lanjut nambah pesanan");
  console.log("0. Kembali ke Main Menu\n");

  return ask("Pilih: ", inArray(["1", "2", "3", "0"])).then((a) => {
    switch (a) {
      case "1":
        return { nextPage: "createOrder" };

      case "2":
        cart.splice(0);
        return { nextPage: "order" };

      case "3":
        return { nextPage: "order" };

      default:
        return { nextPage: "mainMenu" };
    }
  });
}

/**
 * @type {PageHandler}
 */
function handleHistory() {
  console.log("\nRiwayat Pesanan\n");

  if (orders.length === 0) console.log("Waduh, kamu belum pernah pesan apapun nih, yuk mulai memesan");

  orders
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((o, i) => {
      console.log(`\nOrder No. ${i + 1}`);
      console.log(
        toJakartaLocalTime(o.createdAt),
      );
      console.log("Nominal total pesanan: ", toIDR(o.total));

      o.items.forEach((i) => console.log(`${i.name}, qty: ${i.qty}, subtotal: ${toIDR(i.subtotal)}`),
      );
    });

  return ask(
    "\n1. Ke Menu Pesanan\n0. Kembali ke Main Menu",
    inArray(["0", "1"]),
  ).then((a) => {
    switch (a) {
      case "1":
        return { nextPage: "order" };

      default:
        return { nextPage: "mainMenu" };
    }
  });
}

/**
 * @type {PageHandler}
 */
function handleConfirm({ id, qty }) {
  console.log("\nKonfirmasi pesanan\n");

  const item = products.find((p) => p.id === id);

  console.log(`Pesan ${item.name} sebanyak ${qty}? Sisa stok ${item.stock}`);

  console.log("\n00. Kembali ke Menu Pesanan");
  if (qty <= item.stock) console.log("01. Udah oke, lanjut ke keranjang");

  return ask(
    "Ubah quantity pesanan atau pilih menu: ",
    inQuantityAndArray(item.stock, ["00", "01"]),
  ).then((a) => {
    if (a === "00") return { nextPage: "order" };

    if (a === "01") {
      const existing = cart.find((i) => i.id === id);

      if (existing) existing.qty += qty;
      else cart.push({ id, qty });

      return { nextPage: "cart" };
    }

    return { nextPage: "confirm", context: { id, qty: Number(a) } };
  });
}

/**
 * @type {PageHandler}
 */
function handleCreateOrder() {
  let total = 0;
  const orderItems = cart.reduce((prev, i) => {
    let itemIndex;
    const item = products.find((p, index) => {
      const match = p.id === i.id;

      if (match) itemIndex = index;

      return match;
    });

    if (item) {
      products[itemIndex].stock -= i.qty;

      const subtotal = item.price * i.qty;
      total += subtotal;

      prev.push({
        productId: i.id,
        name: item.name,
        qty: i.qty,
        price: item.price,
        subtotal,
      });
    }

    return prev;
  }, []);

  orders.push({
    id: randomUUIDv7(),
    items: orderItems,
    total,
    createdAt: new Date(),
  });

  // Reset cart
  cart.splice(0);

  console.log("\nPesanan berhasil dibuat");

  return ask(
    "1. Lihat riwayat pesanan\n0. Kembali ke Main Menu\n",
    inArray(["1", "0"]),
  ).then((a) => {
    switch (a) {
      case "1":
        return { nextPage: "history" };

      default:
        return { nextPage: "mainMenu" };
    }
  });
}

function main() {
  pagesRegistry.set("mainMenu", handleMainMenu);
  pagesRegistry.set("exit", handleExit);
  pagesRegistry.set("order", handleOrder);
  pagesRegistry.set("cart", handleCart);
  pagesRegistry.set("history", handleHistory);
  pagesRegistry.set("confirm", handleConfirm);
  pagesRegistry.set("createOrder", handleCreateOrder);

  runPage("mainMenu").catch(() => {
    console.log("\n\nWhoops, ada yang salah");
    console.log("Exiting...\n");
  });
}

main();

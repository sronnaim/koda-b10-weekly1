import { randomUUIDv7 } from "node:crypto";
import { ask } from "../io/index.mjs";
import { toIDR, toJakartaLocalTime } from "../utils/index.mjs";
import { inArray, inQuantityAndArray } from "../validation/index.mjs";
import { STOP_SIGNAL } from "../app/index.mjs";

/**
 * @typedef {([any]) => Promise<Destination>} PageHandler
 */

/**
 * @type {PageHandler}
 */
export function handleMainMenu() {
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
export function handleExit(rl) {
  console.log("\nSampai jumpa kembali!\n");
  rl.close();
  return Promise.resolve({ nextPage: STOP_SIGNAL });
}

/**
 * @type {PageHandler}
 */
export function handleOrder() {
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

  // TODO: gets products

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
export function handleCart() {
  console.log("\nKeranjang Pesanan\n");

  // TODO: gets cart

  if (cart.length === 0) {
    console.log("Keranjang masih kosong, yuk mulai pilih");
    return ask("1. Ke menu pesanan", inArray(["1"])).then(() => {
      return { nextPage: "order" };
    });
  }

  console.log("Nama Menu | Quantity | Subtotal");

  let total = 0;

  cart.forEach((i) => {
    // TODO: gets products

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
export function handleHistory() {
  console.log("\nRiwayat Pesanan\n");

  // TODO: gets orders

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
export function handleConfirm({ id, qty }) {
  console.log("\nKonfirmasi pesanan\n");

  // TODO: gets products

  const item = products.find((p) => p.id === id);

  console.log(`Pesan ${item.name} sebanyak ${qty}? Sisa stok ${item.stock}`);

  console.log("\n00. Kembali ke Menu Pesanan");
  if (qty <= item.stock) console.log("01. Udah oke, lanjut ke keranjang");

  return ask(
    "Ubah quantity pesanan atau pilih menu: ",
    inQuantityAndArray(item.stock, ["00", "01"]),
  ).then((a) => {
    if (a === "00") return { nextPage: "order" };

    // TODO: gets cart

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
export function handleCreateOrder() {
  // TOOD: gets cart
  let total = 0;
  const orderItems = cart.reduce((prev, i) => {
    // TODO: gets products
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

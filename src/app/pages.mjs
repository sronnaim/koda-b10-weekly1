import { newAppError } from "../errors/index.mjs";
import { generateOptionsMapForItems, toIDR, toJakartaLocalTime } from "../utils/index.mjs";

export async function handleMainMenu(ctx) {
  const { io } = ctx;

  io.sendMessage("Selamat datang di Tsuka Ramen!");

  io.sendMessage("1. Menu Pesanan");
  io.sendMessage("2. Keranjang");
  io.sendMessage("3. Riwayat Pesanan");
  io.sendMessage("0. Keluar");

  while (true) {
    const answer = await io.prompt("Pilih menu: ");
    if (["0", "1", "2", "3"].includes(answer)) {
      switch (answer) {
        case "1":
          return { nextPageId: "order" };

        case "2":
          return { nextPageId: "cart" };

        case "3":
          return { nextPageId: "history" };

        default:
          return { exit: true };
      }
    }

    io.sendMessage("Pilihan tidak dikenal");
  }
}

export async function handleOrder(ctx) {
  const { io, services: { productService } } = ctx;

  const products = await productService.listProducts();

  const productOptionMap = await generateOptionsMapForItems(products);

  let productsString = "Menu Makanan dan Minuman Tsuka Ramen:\n";

  for (const [opt, product] of productOptionMap) {
    productsString = `${productsString}\n${opt}. ${product.name}, ${toIDR(product.price)}`;
  }

  io.sendMessage("Menu Pesanan");
  io.sendMessage(productsString);

  io.sendMessage("Ketik nomor menu untuk buat pesanan");
  io.sendMessage("Ketik '01' untuk lihat Keranjang");
  io.sendMessage("Ketik '00' untuk kembali ke Main Menu");

  while (true) {
    const answer = await io.prompt("\nPilih:");

    if (Array.from(productOptionMap.keys()).includes(answer)) return { nextPageId: "confirm", nextParams: { product: productOptionMap.get(answer) } };

    if (answer === "00") return { nextPageId: "main-menu" };
    if (answer === "01") return { nextPageId: "cart" };

    io.sendMessage("Pilihan tidak dikenal");
  }
}

export async function handleConfirm(ctx, params) {
  const { io, services: { productService } } = ctx;
  const { product: { id } } = params;

  const product = await productService.getProduct(id);

  if (!product) {
    throw newAppError("Product tidak ditemukan");
  }

  let qty = 1;

  while (true) {
    io.sendMessage(`Tambah '${product.name}' ke dalam keranjang sebanyak ${qty}?`);
    io.sendMessage(`Tulis angka 1-${product.stock} untuk ubah quantity pesanan`);
    io.sendMessage("Tulis '01' untuk lanjut tambah ke keranjang");
    io.sendMessage("Tulis '00' untuk kembali ke Menu Pesanan");

    const answer = await io.prompt("");

    if (answer === "00") return { nextPageId: "order" };

    if (answer === "01") return { nextPageId: "add-to-cart", nextParams: { productId: product.id, qty } };

    if (Number(answer) < 1) {
      io.sendMessage("Pemesanan minimal 1 qty");
      continue;
    }

    if (Number(answer) > product.stock) {
      io.sendMessage(`Pemesanan tidak bisa lebih dari stock saat ini, yaitu ${product.stock}`);
      continue;
    }

    qty = Number(answer);
  }
}

export async function handleAddToCart(ctx, params) {
  const { io, services: { productService, cartService } } = ctx;
  const { productId, qty } = params;

  const product = await productService.getProduct(productId);

  if (!product) throw newAppError("Produk yang ingin ditambah ke keranjang tidak ditemukan");

  if (product.stock < qty) throw newAppError(`Gagal menambah ${qty} produk ke keranjang, stok produk hanya ${product.stock}`);

  await cartService.addLine(product.id, qty);

  io.sendMessage("Produk berhasil ditambahkan ke keranjang");
  io.sendMessage("1. Lihat keranjang");
  io.sendMessage("0. Kembali ke Main Menu");

  while (true) {
    const answer = await io.prompt("Pilih opsi:");

    if ("0" === answer) return { nextPageId: "cart" };

    if ("1" === answer) return { nextPageId: "main-menu" };

    io.sendMessage("Pilihan tidak dikenal");
  }
}

export async function handleCart(ctx) {
  const { io, services: { cartService, productService } } = ctx;

  const cart = await cartService.listItems();

  if (!cart || cart.length === 0) io.sendMessage("Keranjang masih kosong nih, yuk mulai pesan");
  else {
    const cartString = cart.reduce((prevPromise, line, index) => {
      return prevPromise.then((prevString) => {
        return productService.getProduct(line.productId).then((product) => {
          return `${prevString}\n${index + 1}. ${product.name}, ${product.price}, ${line.qty}, ${line.qty * product.price}`;
        });
      });
    }, Promise.resolve("No | Nama Menu Pesanan | Harga | Jumlah | Subtotal"));

    io.sendMessage(await cartString);
  }

  while (true) {
    io.sendMessage("01. Proses pesanan");
    io.sendMessage("00. Kembali ke Main Menu");

    const answer = await io.prompt("Pilih opsi:");

    if (answer === "00") return { nextPageId: "main-menu" };

    if (answer === "01") return { nextPageId: "create-transaction" };

    io.sendMessage("Pilihan tidak dikenal");
  }
}

export async function handleCreateTransaction(ctx) {
  const { io, services: { transactionService: service, cartService } } = ctx;

  const cartItems = await cartService.listItems();
  await service.processNew(cartItems);
  await cartService.resetCart();

  io.sendMessage("Berhasil membuat pesanan");

  while (true) {
    io.sendMessage("1. Lihat riwayat pesanan");
    io.sendMessage("0. Kembali ke Main Menu");

    const answer = await io.prompt("Pilih:");

    if (answer === "1") return { nextPageId: "history" };
    if (answer === "0") return { nextPageId: "main-menu" };

    io.sendMessage("Pilihan tidak dikenal");
  }
}
export async function handleHistory(ctx) {
  const { io, services: { transactionService: service } } = ctx;

  const transactions = await service.listAll();

  if (transactions.length === 0) io.sendMessage("Riwayat pesanan masih kosong");
  else {
    const transactionsString = transactions.reduce((prevString, transaction) => {
      const header = prevString.concat(`\nTransaksi ID ${transaction.id}\n${toJakartaLocalTime(transaction.createdAt)}, Total ${toIDR(transaction.total)}\n`);
      const trString = header.concat(transaction.items.reduce((prevString, line, index) => {
        return prevString.concat(`${index + 1}. ${line.name}, harga: ${toIDR(line.price)}, qty: ${line.qty}, subtotal: ${toIDR(line.qty * line.price)}\n`);
      }, ""));

      return trString;
    }, "Riwayat Pesanan\n");

    io.sendMessage(transactionsString);
  }

  io.sendMessage("1. Ke Menu Pesanan");
  io.sendMessage("0. Kembali ke Main Menu");

  while (true) {
    const answer = await io.prompt("Pilih: ");

    if (answer === "1") return { nextPageId: "order" };
    if (answer === "0") return { nextPageId: "main-menu" };

    io.sendMessage("Pilihan tidak dikenal");
  }
}

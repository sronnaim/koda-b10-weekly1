import { randomUUIDv7 } from 'node:crypto';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const products = [
  // Food
  { id: 1, name: 'Nasi Goreng', category: 'food', price: 25000, stock: 20 },
  { id: 2, name: 'Mie Goreng', category: 'food', price: 22000, stock: 20 },
  { id: 3, name: 'Ayam Bakar', category: 'food', price: 30000, stock: 15 },
  { id: 4, name: 'Soto Ayam', category: 'food', price: 24000, stock: 12 },
  { id: 5, name: 'Gado-Gado', category: 'food', price: 20000, stock: 10 },

  // Drinks
  { id: 6, name: 'Es Teh Manis', category: 'drink', price: 6000, stock: 50 },
  { id: 7, name: 'Kopi Hitam', category: 'drink', price: 8000, stock: 40 },
  { id: 8, name: 'Es Jeruk', category: 'drink', price: 9000, stock: 30 },
  { id: 9, name: 'Air Mineral', category: 'drink', price: 4000, stock: 100 },

  // Desserts
  {
    id: 10,
    name: 'Pisang Goreng',
    category: 'dessert',
    price: 12000,
    stock: 18,
  },
  { id: 11, name: 'Es Campur', category: 'dessert', price: 15000, stock: 10 },
  { id: 12, name: 'Kue Lapis', category: 'dessert', price: 8000, stock: 0 }, // sold out, good for testing
];

const cart = [];

const pastOrders = [];

const pages = {
  mainMenu: handleMainMenu,
  cart: handleCart,
  confirm: handleConfirm,
  order: handleOrder,
  history: handleHistory,
  exit: handleExit,
};

// Main menu
// To order
// To cart
// To history
// Exit

const mainMenuNavs = {
  1: {
    page: 'order',
    label: 'Menu Pesanan',
  },
  2: {
    page: 'cart',
    label: 'Keranjang',
  },
  3: {
    page: 'history',
    label: 'Riwayat Pesanan',
  },
  0: {
    page: 'exit',
    label: 'Keluar',
  },
};

function handleMainMenu() {
  console.log('\nMain Menu\n');
  Object.entries(mainMenuNavs).forEach(([key, { label }]) => {
    console.log(`${key}. ${label}`);
  });

  return ask('Pilih:').then((a) => {
    if (!Object.hasOwn(mainMenuNavs, a)) {
      console.log('\nPilihan tidak dikenal');
      console.log('Kembali ke Main Menu...');
      return 'mainMenu';
    }

    return mainMenuNavs[a].page;
  });
}

// Exit
function handleExit() {
  console.log('\nSampai jumpa kembali!\n');
  rl.close();
  return Promise.resolve('stop');
}

// Order
// To cart
// Pick --> to confirmation
// To main menu
const orderNavs = {
  '00': {
    page: 'mainMenu',
    label: 'Kembali ke Main Menu',
  },
  '01': {
    page: 'cart',
    label: 'Lihat keranjang',
  },
};

function handleOrder() {
  console.log('\nMenu Pesanan\n');

  Object.entries(orderNavs).forEach(([key, { label }]) => {
    console.log(`${key}. ${label}`);
  });

  console.log();

  products.forEach((i) =>
    console.log(
      `${i.stock > 0 ? `${i.id}. ` : '--'} ${i.name} | harga: ${toIDR(i.price)} | ${i.stock > 0 ? `stok: ${i.stock}` : 'stok habis'}`,
    ),
  );

  return ask('Pilih: ').then((a) => {
    if (Object.hasOwn(orderNavs, a)) return orderNavs[a].page;

    const item = products.find((p) => p.id === Number.parseInt(a));

    if (!item) {
      console.log('\nMenu tidak dikenal');
      return 'order';
    }

    if (item.stock <= 0) {
      console.log(`\nMaaf, ${item.name} lagi habis nih`);
      return 'order';
    }

    return handleConfirm(item.id, 1);
  });
}

// Confirmation
// Ya, to cart
// No, to order
function handleConfirm(id, qty) {
  console.log('\nKonfirmasi pesanan\n');

  const item = products.find((p) => p.id === id);

  if (!item) {
    console.log('Menu tidak dikenal');
    console.log('Kembali ke Menu Pesanan');
    return 'order';
  }

  if (qty > item.stock) {
    console.log(
      `Tidak dapat memesan ${item.name} sebanyak ${qty}. Sisa stok ${item.stock}`,
    );
  } else
    console.log(`Pesan ${item.name} sebanyak ${qty}? Sisa stok ${item.stock}`);

  console.log('\n00. Kembali ke Menu Pesanan');
  if (qty <= item.stock) console.log('01. Udah oke, lanjut ke keranjang');

  return ask('Ubah quantity pesanan menjadi: ').then((a) => {
    if (a === '00') return 'order';

    if (a === '01' && qty <= item.stock) {
      const existing = cart.find((i) => i.id === id);

      if (existing) existing.qty += qty;
      else cart.push({ id, qty });

      return 'cart';
    }

    if (a.startsWith('0')) {
      console.log('\nPilihan tidak dikenal\n');
      return handleConfirm(id, qty);
    }

    return handleConfirm(id, Number.parseInt(a));
  });
}

// Cart
// Order --> To order succes
// Empty --> To empty cart
// To order
// To main menu

function handleCart() {
  console.log('\nKeranjang Pesanan\n');

  if (cart.length === 0) {
    console.log('Keranjang masih kosong, yuk mulai pilih\n');
    return ask('1. Ke menu pesanan').then((a) => {
      if (a !== '1') {
        console.log('\nPilihan tidak dikenali\n');
        return Promise.resolve('order');
      }

      return Promise.resolve('order');
    });
  }

  console.log('Nama Menu | Quantity | Subtotal');

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

  console.log('\n1. Buat pesanan');
  console.log('2. Kosongkan keranjang');
  console.log('0. Kembali ke Main Menu\n');

  return ask('Pilih: ').then((a) => {
    switch (a) {
      case '1':
        return createOrder(cart);

      case '2':
        cart.splice(0);
        return 'order';

      case '0':
        return 'mainMenu';
    }
  });
}

// Order success
// To history or main
function createOrder(items) {
  let total = 0;
  const orderItems = items.reduce((prev, i) => {
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

  pastOrders.push({
    id: randomUUIDv7(),
    items: orderItems,
    total,
    createdAt: new Date(),
  });

  // Reset cart
  cart.splice(0);

  return 'history';
}

// History
function handleHistory() {
  pastOrders
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((o, i) => {
      console.log(`\nOrder No. ${i + 1}`);
      console.log(
        o.createdAt.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Jakarta',
        }),
      );
      console.log('Nominal total pesanan: ', toIDR(o.total));

      o.items.forEach((i) =>
        console.log(`${i.name}, qty: ${i.qty}, subtotal: ${toIDR(i.subtotal)}`),
      );
    });

  return ask('0. Kembali ke Main Menu').then((a) => {
    if (a !== '0') {
      console.log('\nPilihan tidak dikenal');
      return 'history';
    }

    return 'mainMenu';
  });
}

// Empty Cart
// To order or main

// Utils

function toIDR(num) {
  if (typeof num !== 'number') return '';

  return num.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
}

function ask(question) {
  return rl.question('\n' + question + '\n> ').then((a) => {
    const num = Number.parseInt(a);

    if (Number.isNaN(num)) return 'invalid';

    return a;
  });
}

function run(pageName) {
  if (pageName === 'stop') return Promise.resolve();

  if (!Object.hasOwn(pages, pageName)) {
    console.log('\nTidak ditemukan: ', pageName);
    console.log('\nKembali ke Main Menu\n');
    pageName = 'mainMenu';
  }

  return pages[pageName]().then((nextPage) => {
    return run(nextPage);
  });
}

run('mainMenu').catch(() => {
  console.log('\nAda yang salah');
  console.log('Keluar program...');
});

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

const STOP = Symbol.for('stop');

const cart = [
  {
    id: 0,
    qty: 0,
  },
];

const pastOrders = [
  {
    id: '',
    items: [
      {
        productId: 0,
        name: '',
        qty: 0,
        price: 0,
        subtotal: 0,
      },
    ],
    total: 0,
    createdAt: new Date(),
  },
];

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

  return ask('Pilih: ', Object.keys(mainMenuNavs)).then((a) => {
    return mainMenuNavs[a].page;
  });
}

// Exit
function handleExit() {
  console.log('\nSampai jumpa kembali!\n');
  rl.close();
  return Promise.resolve(STOP);
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

  products.forEach((i) =>
    console.log(
      `${i.stock > 0 ? `${i.id}. ` : '--'} ${i.name} | harga: ${toIDR(i.price)} | ${i.stock > 0 ? `stok: ${i.stock}` : 'stok habis'}`,
    ),
  );

  console.log('');

  Object.entries(orderNavs).forEach(([key, { label }]) => {
    console.log(`${key}. ${label}`);
  });

  return ask('Pilih: ', [
    ...Object.keys(orderNavs),
    ...getAvailableProductIDs().map((id) => id.toString(10)),
  ]).then((a) => {
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
    return Promise.resolve('order');
  }

  if (qty > item.stock) {
    console.log(
      `Tidak dapat memesan ${item.name} sebanyak ${qty}. Sisa stok ${item.stock}`,
    );
  } else
    console.log(`Pesan ${item.name} sebanyak ${qty}? Sisa stok ${item.stock}`);

  console.log('\n00. Kembali ke Menu Pesanan');
  if (qty <= item.stock) console.log('01. Udah oke, lanjut ke keranjang');

  return ask('Ubah quantity pesanan menjadi: ', [
    ...generateStockInputs(item.stock),
    '00',
    '01',
  ]).then((a) => {
    if (a === '00') return 'order';

    if (a === '01' && qty <= item.stock) {
      const existing = cart.find((i) => i.id === id);

      if (existing) existing.qty += qty;
      else cart.push({ id, qty });

      return 'cart';
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
    console.log('Keranjang masih kosong, yuk mulai pilih');
    return ask('1. Ke menu pesanan', ['1']).then(() => {
      return 'order';
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

  return ask('Pilih: ', ['1', '2', '0']).then((a) => {
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
  console.log('\nRiwayat Pesanan\n');

  if (pastOrders.length === 0)
    console.log('Waduh, kamu belum pernah pesan apapun nih, yuk mulai memesan');

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

  return ask('\n1. Ke Menu Pesanan\n0. Kembali ke Main Menu', ['0', '1']).then(
    (a) => {
      switch (a) {
        case '0':
          return 'mainMenu';

        default:
          return 'order';
      }
    },
  );
}

// Empty Cart
// To order or main

// Utils
function getAvailableProductIDs() {
  return products.filter((p) => p.stock > 0).map((p) => p.id);
}

/**
 *
 * @param {number} stock
 * @returns
 */
function generateStockInputs(stock) {
  return [...Array(stock)].map((_, i) => (i + 1).toString(10));
}

/**
 *
 * @param {number} num
 * @returns
 */
function toIDR(num) {
  return num.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
}

/**
 *
 * @param {string} question
 * @param {string[]} acceptableOptions
 * @returns
 */
function ask(question, acceptableOptions) {
  return rl.question('\n' + question + '\n> ').then((input) => {
    const answer = input.trim();

    if (!acceptableOptions.includes(answer)) {
      console.log('Jawaban tidak dikenal');
      return ask(question, acceptableOptions);
    }

    return answer;
  });
}

function run(pageName) {
  if (pageName === STOP) return Promise.resolve();

  if (!Object.hasOwn(pages, pageName)) {
    console.log('\nTidak ditemukan: ', pageName);
    console.log('\nKembali ke Main Menu\n');
    pageName = 'mainMenu';
  }

  return pages[pageName]().then((nextPage) => {
    return run(nextPage);
  });
}

// Initializes starting states
pastOrders.splice(0);
cart.splice(0);

run('mainMenu').catch(() => {
  console.log('\nWhoops, ada yang salah');
  console.log('Keluar program...');
});

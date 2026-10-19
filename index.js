import { randomUUIDv7 } from 'node:crypto';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const products = [
  // Source: GoFood
  // Menu Murah
  { id: 1, name: 'Original Tsuka', price: 24000, stock: 50 },
  { id: 2, name: 'Miso Tsuka Ramen Komplit', price: 26000, stock: 50 },

  // Tsuka Bento Hemat
  { id: 3, name: 'Tsuka Bento Hemat A', price: 21000, stock: 50 },
  { id: 4, name: 'Tsuka Bento Hemat B', price: 21000, stock: 50 },
  { id: 5, name: 'Tsuka Bento Hemat C', price: 21000, stock: 50 },

  // Ala Carte
  { id: 6, name: 'Shrimp Roll', price: 12000, stock: 50 },
  { id: 7, name: 'Lumpia Udang', price: 12000, stock: 50 },
  { id: 8, name: 'Tori Ball', price: 12000, stock: 50 },
  { id: 9, name: 'Spicy Tori Ball', price: 12000, stock: 50 },
  { id: 10, name: 'Ayam Keju', price: 12000, stock: 50 },

  // Tsuka Bento Super Hemat
  { id: 11, name: 'Tsuka Bento Super Hemat A', price: 19000, stock: 50 },
  { id: 12, name: 'Tsuka Bento Super Hemat B', price: 19000, stock: 50 },
  { id: 13, name: 'Tsuka Bento Super Hemat C', price: 19000, stock: 50 },

  // Mie Ayam Tsuka Jepang
  { id: 14, name: 'Mie Ayam Tsuka', price: 21000, stock: 50 },

  // Tsuka Ramen Basic
  { id: 16, name: 'Original Tsuka Ramen Basic', price: 20000, stock: 50 },
  { id: 17, name: 'Miso Tsuka Ramen Basic', price: 22000, stock: 50 },
  { id: 18, name: 'Volcano Ramen Basic', price: 25000, stock: 50 },
  { id: 19, name: 'Red Ninja Ramen Basic', price: 25000, stock: 50 },

  // Tsuka Ramen Komplit
  { id: 20, name: 'Volcano Ramen Komplit', price: 28000, stock: 50 },
  { id: 21, name: 'Red Ninja Ramen Komplit', price: 28000, stock: 50 },

  // Side Dish
  { id: 22, name: 'Chicken Karaage Yakitori (Spicy)', price: 9000, stock: 50 },
  { id: 23, name: 'Fried Gyoza', price: 12000, stock: 50 },
  { id: 24, name: 'Nori Tempura', price: 6000, stock: 50 },
  { id: 25, name: 'Egg Tempura', price: 8000, stock: 50 },
  { id: 26, name: 'Chicken Money Bag', price: 6000, stock: 50 },
  { id: 27, name: 'Monster Crab Stick', price: 10000, stock: 50 },
  { id: 28, name: 'Egg Roll', price: 8000, stock: 50 },
  { id: 29, name: 'Chicken Karaage Yakitori (Mentai)', price: 9000, stock: 50 },
  // Drinks
  { id: 30, name: 'Es Mango Sagoo', price: 10000, stock: 50 },
  { id: 31, name: 'Es Teh Susu Cincau', price: 10000, stock: 50 },
  { id: 32, name: 'Teh Hijau Tawar Dingin', price: 6000, stock: 50 },
  { id: 33, name: 'Air Mineral', price: 7000, stock: 50 },
  { id: 34, name: 'Es Teh Blackcurrant', price: 8000, stock: 50 },
  { id: 35, name: 'Es Teh Leci', price: 8000, stock: 50 },
  { id: 36, name: 'Es Cokelat Susu', price: 9000, stock: 50 },
  { id: 37, name: 'Mango Yakult', price: 9000, stock: 50 },
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

function handleExit() {
  console.log('\nSampai jumpa kembali!\n');
  rl.close();
  return Promise.resolve(STOP);
}

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

/**
 *
 * @param {number} id
 * @param {number} qty
 * @returns
 */
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

import { handleAddToCart, handleCart, handleConfirm, handleCreateTransaction, handleHistory, handleMainMenu, handleOrder } from "./app/pages.mjs";
import { newJsonDb } from "./db/json.mjs";
import { products } from "./db/seed.mjs";
import { newIo } from "./io/index.mjs";
import { handleErrorDefault, handleNotFoundDefault } from "./pages/index.mjs";
import { newCartRepo } from "./repos/cart.mjs";
import { newProductRepo } from "./repos/product.mjs";
import { newTransactionRepo } from "./repos/transaction.mjs";
import { newRouter } from "./router/index.mjs";
import { newCartService } from "./services/cart.mjs";
import { newProductsService } from "./services/product.mjs";
import { newTransactionService } from "./services/transaction.mjs";

function main() {
  const productDb = newJsonDb("products", products);
  const productRepo = newProductRepo(productDb);
  const productService = newProductsService(productRepo);

  const cartDb = newJsonDb("carts", []);
  const cartRepo = newCartRepo(cartDb);
  const cartService = newCartService(cartRepo);

  const transactionDb = newJsonDb("transactions", []);
  const transactionRepo = newTransactionRepo(transactionDb);
  const transactionService = newTransactionService({
    productRepo,
    transactionRepo,
  });

  const pages = [{
    id: "order",
    pageHandler: handleOrder,
  }, {
    id: "confirm",
    pageHandler: handleConfirm,
  }, {
    id: "add-to-cart",
    pageHandler: handleAddToCart,
  }, {
    id: "cart",
    pageHandler: handleCart,
  }, {
    id: "create-transaction",
    pageHandler: handleCreateTransaction,
  }, {
    id: "history",
    pageHandler: handleHistory,
  }];

  const start = {
    id: "main-menu",
    pageHandler: handleMainMenu,
  };

  const notFound = {
    id: "not-found",
    pageHandler: handleNotFoundDefault,
  };

  const error = {
    id: "error",
    pageHandler: handleErrorDefault,
  };

  const io = newIo();

  const app = newRouter({
    pages,
    start,
    notFound,
    error,
  });

  app.run({ io, services: {
    productService,
    cartService,
    transactionService,
  },
  })
    .catch((err) => {
      console.error(err);
      console.log("\nWhoops, ada kesalahan sistem nih");
    })
    .finally(() => {
      console.log("Keluar program...");
      io.close();
    });
}

main();

import { newAppError } from "../errors/index.mjs";

export function newTransactionService({
  transactionRepo,
  productRepo,
}) {
  const listAll = async () => {
    return await transactionRepo.getAll();
  };

  const processNew = async (items) => {
    const transaction = {
      id: crypto.randomUUID().replace("-", ""),
      items: [],
      total: 0,
      createdAt: new Date(),
    };

    for (const item of items) {
      const product = await productRepo.findById(item.productId);

      if (!product) throw newAppError(`Produk dengan ID '${item.productId}' tidak ditemukan`);

      if (product.stock < item.qty) throw newAppError("Stock produk kurang");

      transaction.items.push({ productId: product.id, name: product.name, price: product.price, qty: item.qty });
      transaction.total = transaction.total + (item.qty * product.price);

      await transactionRepo.createOne(transaction);

      await productRepo.updateOne({
        ...product,
        stock: product.stock - item.qty,
      });
    }
  };

  return {
    processNew,
    listAll,
  };
}

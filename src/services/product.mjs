import { newAppError } from "../errors/index.mjs";

export function newProductsService(repo) {
  const listProducts = async () => {
    return await repo.getAll();
  };

  const getProduct = async (id) => {
    return await repo.findById(id);
  };

  const addStock = async (id, addend) => {
    const product = await repo.findById(id);

    if (!product) return;

    const newStock = product.stock + addend;

    const updated = await repo.updateOne({ ...product, stock: newStock });

    return updated.stock;
  };

  const removeStock = async (id, subtrahend) => {
    const product = await repo.findById(id);

    if (!product) return;

    const newStock = product.stock - subtrahend;

    if (newStock < 0) throw newAppError(`Tidak bisa mengurangi stock sebanyak ${subtrahend}`);

    const updated = await repo.updateOne({ ...product, stock: newStock });

    return updated.stock;
  };

  return {
    listProducts,
    getProduct,
    addStock,
    removeStock,
  };
}

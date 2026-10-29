import { newAppError } from "../errors/index.mjs";

export function newCartService(repo) {
  const listItems = async () => {
    return await repo.getAll();
  };

  const addLine = async (id, qty) => {
    const item = await repo.getItem(id);

    if (item) {
      await repo.updateItem(id, qty);
      return;
    }

    await repo.addItem(id, qty);
  };

  const updateQty = async (id, qty) => {
    const item = await repo.getItem(id);

    if (!item) throw newAppError(`Item dengan ID ${id} tidak ada di keranjang, tambahkan dahulu untuk mengupdate`);

    await repo.updateItem(id, qty);
  };

  const removeLine = async (id) => {
    await repo.dropItem(id);
  };

  const resetCart = async () => {
    await repo.reset([]);
  };

  return {
    listItems,
    addLine,
    updateQty,
    removeLine,
    resetCart,
  };
}

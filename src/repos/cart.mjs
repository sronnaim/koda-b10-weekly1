export function newCartRepo(db) {
  const getAll = async () => {
    return await db.read();
  };

  const addItem = async (id, qty) => {
    const cartItems = await db.read();
    cartItems.push({ productId: id, qty });
    await db.save(cartItems);
  };

  const updateItem = async (id, qty) => {
    const cartItems = await db.read();
    const index = cartItems.findIndex((item) => item.id === id);

    if (index !== -1) return;

    cartItems[index] = { id, qty };

    await db.save(cartItems);

    return cartItems[index];
  };

  const getItem = async (id) => {
    const cartItems = await db.read();
    return cartItems.find((item) => item.id === id);
  };

  const dropItem = async (id) => {
    const cartItems = await db.read();
    const index = cartItems.findIndex((item) => item.id === id);

    cartItems.splice(index, 1);

    await db.save(cartItems);
  };

  return {
    getAll,
    addItem,
    updateItem,
    getItem,
    dropItem,
  };
}

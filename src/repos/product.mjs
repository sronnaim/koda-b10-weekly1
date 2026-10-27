export async function newProductRepo(db) {
  const getAll = async () => {
    return await db.read();
  };

  const findById = async (id) => {
    const data = await db.read();

    return data.find((item) => id === item.id && !item.deleted);
  };

  const updateOne = async (incoming) => {
    const data = await db.read();

    const index = data.findIndex((item) => incoming.id === item.id && !item.deleted);

    if (index === -1) return;

    data[index] = { ...data[index], ...incoming };

    await db.save(data);

    return data[index];
  };

  const deleteById = async (id) => {
    const data = await db.read();

    const index = data.findIndex((item) => id === item.id && !item.deleted);

    if (index === -1) return;

    data[index] = { ...data[index], deleted: true };

    await db.save(data);

    return data[index];
  };

  return {
    getAll,
    findById,
    updateOne,
    deleteById,
  };
}

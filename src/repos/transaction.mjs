export function newTransactionRepo(db) {
  const getAll = async () => {
    return await db.read();
  };

  const createOne = async (transaction) => {
    const data = await db.read();

    data.push(transaction);

    await db.save(data);
  };

  return {
    getAll,
    createOne,
  };
}

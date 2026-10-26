export async function handleNotFoundDefault(ctx, params) {
  const { io } = ctx;
  const { startPageId, triedId } = params;

  await io.sendMessage(`Maaf, page dengan ID ${triedId} tidak dapat ditemukan`);

  return {
    nextPageId: startPageId,
  };
}

export async function handleErrorDefault(ctx, params) {
  const { io } = ctx;
  const { history: { id }, startPageId } = params;

  await io.sendMessage(`Whoops, ada kesalahan waktu mengakses paged dengan ID ${id}`);

  return {
    nextPageId: startPageId,
  };
}

export async function homePage(ctx, params) {
  const { io } = ctx;

  await io.sendMessage("Welcome!");

  return {
    nextPageId: "home",
    nextParams: params,
  };
}

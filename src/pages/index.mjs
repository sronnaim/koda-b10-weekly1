export async function handleNotFoundDefault(ctx, params) {
  const { io } = ctx;
  const { startPageId, triedId } = params;

  await io.sendMessage(`Maaf, page dengan ID ${triedId} tidak dapat ditemukan`);

  while (true) {
    const answer = await io.prompt("Kembali ke menu utama? (ya)");

    if (answer.toLowerCase() === "ya") break;

    io.sendMessage("Jawaban tidak dikenal");
  }

  return {
    nextPageId: startPageId,
  };
}

export async function handleErrorDefault(ctx, params) {
  const { io } = ctx;
  const { appError, startPageId } = params;

  await io.sendMessage(appError.message);

  while (true) {
    const answer = await io.prompt("Kembali ke menu utama? (ya)");

    if (answer.toLowerCase() === "ya") break;

    io.sendMessage("Jawaban tidak dikenal");
  }

  return {
    nextPageId: startPageId,
  };
}

export async function handleHome(ctx, params) {
  const { io } = ctx;

  await io.sendMessage("Welcome!");

  await io.prompt("Your name?");

  return {
    nextPageId: "home",
    nextParams: params,
  };
}

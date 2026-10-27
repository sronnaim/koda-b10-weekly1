export function newAppError(msg) {
  const err = new Error(`AppError: ${msg}`);

  return err;
}

export function isAppError(err) {
  if (!(err instanceof Error)) return false;

  return err.message.startsWith("AppError");
}

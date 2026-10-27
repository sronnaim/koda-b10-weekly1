export function newAppError(msg) {
  const err = new Error(msg);

  err.code = "APP_ERROR";
  return err;
}

export function isAppError(err) {
  if (!(err instanceof Error)) return false;

  return err.code === "APP_ERROR";
}

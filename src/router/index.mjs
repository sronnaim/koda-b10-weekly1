import { isAppError, newAppError } from "../errors/index.mjs";

/**
 *
 * @param {Object[]} pages
 * @param {string} startPageId
 * @param {string} notFoundPageId
 * @param {string} errorPageId
 */
export function newRouter({ pages, start, notFound, error }) {
  if (
    (!pages || !Array.isArray(pages) || pages.length === 0) ||
    (!start || typeof start !== "object" || typeof start.id !== "string" || typeof start.pageHandler !== "function") ||
    (!notFound || typeof notFound !== "object" || typeof notFound.id !== "string" || typeof notFound.pageHandler !== "function") ||
    (!error || typeof error !== "object" || typeof error.id !== "string" || typeof error.pageHandler !== "function")
  ) {
    throw newAppError("Invalid router configuration");
  }

  const registry = pages.reduce((prevMap, page) => {
    if (typeof page.id !== "string" || page.id.length === 0) throw newAppError("Page ID must be a non-empty string");

    if (typeof page.pageHandler !== "function") throw newAppError(`Handler for '${page.id}' must be a function`);

    if (prevMap.has(page.id)) throw newAppError(`Duplicate page on ID ${page.id}`);

    prevMap.set(page.id, page.pageHandler);

    return prevMap;
  }, new Map());

  if (registry.has(start.id)) registry.delete(start.id);

  if (registry.has(notFound.id)) registry.delete(notFound.id);

  if (registry.has(error.id)) registry.delete(error.id);

  registry.set(start.id, start.pageHandler);
  registry.set(notFound.id, notFound.pageHandler);
  registry.set(error.id, error.pageHandler);

  const run = async (ctx) => {
    let currentId = start.id;
    let currentParams;
    let errCounter = 0;

    function isValidResult(result) {
      if (result === null || typeof result !== "object") return false;

      if (result.exit === true) return true;

      return typeof result.nextPageId === "string" && result.nextPageId.length > 0;
    }

    while (true) {
      if (!has(currentId)) {
        currentParams = { triedId: currentId, startPageId: start.id };
        currentId = notFound.id;
      }

      try {
        const result = await registry.get(currentId)(ctx, currentParams);

        if (!isValidResult(result)) throw newAppError(`Page with ID ${currentId} returned malformed result`);

        if (result.exit) break;

        if (currentId !== error.id) errCounter = 0;

        currentId = result.nextPageId;
        currentParams = result.nextParams;
      } catch (err) {
        if (!isAppError(err)) throw err;

        if (errCounter > 2) throw err;

        currentParams = { appError: err, triedId: currentId, triedParams: currentParams, startPageId: start.id };
        currentId = error.id;

        errCounter++;
      }
    }
  };

  const has = (pageId) => registry.has(pageId);

  return {
    run,
    has,
  };
}

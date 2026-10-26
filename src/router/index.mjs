import { handleErrorDefault, handleNotFoundDefault } from "../pages/index.mjs";

/**
 *
 * @param {Object[]} pages
 * @param {string} startPageId
 * @param {string} notFoundPageId
 * @param {string} errorPageId
 */
export function newRouter(pages, startPageId, notFoundPageId, errorPageId) {
  const resolvedNotFoundId = notFoundPageId || "not-found";
  const resolvedErrorId = errorPageId || "error";

  const registry = pages.reduce((prevMap, page) => {
    if (prevMap.has(page.id)) throw new Error(`Duplicate page on ID ${page.id}`);

    prevMap.set(page.id, page.pageHandler);

    return prevMap;
  }, new Map());

  if (!registry.has(startPageId)) throw new Error(`Start page ID '${startPageId}' does not exist on pages the registry`);

  if (!registry.has(resolvedNotFoundId)) {
    console.warn(`Custom Not Found Page is defined with ID '${resolvedNotFoundId}' but it does not exist on pages config array, setting it up with default Not Found Page...`);
    registry.set(resolvedNotFoundId, handleNotFoundDefault);
  }

  if (!registry.has(resolvedErrorId)) {
    console.warn(`Custom Error Page is defined with ID '${resolvedErrorId}' but it does not exist on pages config array, setting it up with default Error Page...`);
    registry.set(errorPageId, handleErrorDefault);
  }

  const register = (pageId, pageHandler) => {
    if (typeof pageId !== "string" || pageId.length === 0) throw new TypeError("Page ID must be a non-empty string");

    if (typeof pageHandler !== "function") throw new TypeError(`Handler for '${pageId}' must be a function`);

    if (registry.has(pageId)) throw new Error(`Failed to register page ${pageId}`);

    registry.set(pageId, pageHandler);
  };

  const run = async (ctx) => {
    let currentId = startPageId;
    let currentParams;

    while (true) {
      const history = {
        id: currentId,
        params: currentParams,
      };

      try {
        if (!has(currentId)) {
          currentParams = { triedId: currentId, startPageId };
          currentId = resolvedNotFoundId;
        }

        const result = await registry.get(currentId)(ctx, currentParams);

        if (result.exit) break;

        currentId = result.nextPageId;
        currentParams = result.nextParams;
      } catch (e) {
        if (currentId === resolvedErrorId) throw e;

        history.id = currentId;
        history.params = currentParams;

        currentId = resolvedErrorId;
        currentParams = { error: e, history };
      }
    }
  };

  const has = (pageId) => registry.has(pageId);

  return {
    register,
    run,
    has,
  };
}

export const STOP_SIGNAL = Symbol.for("stop");

export function newApp() {
  /**
   * @type {Map<string, PageHandler}
   */
  const pages = new Map();

  /**
   *
   * @param {Destination} nextDestination
   */
  const run = (nextDestination) => {
    let { nextPage, context } = nextDestination;

    if (nextPage === STOP_SIGNAL) return Promise.resolve();

    if (!pages.has(nextPage)) {
      console.log(`\nPage ${nextPage} does not exist`);

      if (!pages.has("mainMenu")) {
        console.log("Main Menu has not registered yet, exiting ...");
        return Promise.resolve(STOP_SIGNAL);
      }

      console.log("Navigating to Main Menu");
      nextPage = "mainMenu";
    }

    return pages
      .get(nextPage)(context)
      .then((nextDestination) => {
        return run(nextDestination);
      });
  };

  return {
    register: pages.set,
    run,
  };
}

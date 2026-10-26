import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

/**
 *
 * @param {string} question
 * @param {ValidationFn} validation
 */
export function ask(question, validation) {
  return rl.question("\n" + question + "\n> ").then((answer) => {
    const a = answer.trim();

    const { valid, msg } = validation(a);

    if (msg) console.log(msg);

    if (!valid) return ask(question, validation);

    return a;
  });
}

import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";

export function newIo(input = stdin, output = stdout) {
  const rl = readline.createInterface(input, output);

  const sendMessage = (msg) => {
    output.write(`\n${msg}\n`);
  };

  const prompt = async (question) => {
    const answer = await rl.question(`${question}\n> `);

    return answer.trim();
  };

  const close = () => {
    rl.close();
  };

  return {
    sendMessage,
    prompt,
    close,
  };
}

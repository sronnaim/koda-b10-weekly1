import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";

export function newIo(input = stdin, output = stdout) {
  const rl = readline.createInterface(input, output);

  const sendMessage = (msg) => {
    output.write(msg);
  };

  const prompt = async (question) => {
    const answer = await rl.question(`${question}\n> `).trim();

    return answer.trim();
  };

  return {
    sendMessage,
    prompt,
  };
}

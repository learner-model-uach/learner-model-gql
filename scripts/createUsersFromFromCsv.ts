import { readFile } from "fs/promises";
import { resolve } from "path";
import csvtojson from "csvtojson";
import { z } from "zod";
import pMap from "p-map";
import { createUser } from "./createAuth0Users";
import { setTimeout } from "timers/promises";

const csvTest = await readFile(resolve(__dirname, "./lista.csv"), "utf-8");

const parsedjson = z
  .array(
    z.object({
      email: z.string(),
      // email_alt: z.string(),
      password: z.string(),
      // tags: z.string(),
    })
  )
  .parse(
    await csvtojson({
      delimiter: "	",
    }).fromString(csvTest)
  );

const controller = new AbortController();

process.on("exit", () => {
  controller.abort();
});

process.on("beforeExit", () => {
  controller.abort();
});

await pMap(
  parsedjson,
  async ({ email, password }) => {
    await createUser({
      email,
      password,
    });

    console.log("Account created for " + email);

    await setTimeout(500);
  },
  {
    concurrency: 1,
    signal: controller.signal,
  }
);

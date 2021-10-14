import Pino from "pino";

import { ENV } from "common";

export const logger = Pino({
  level: ENV.IS_DEVELOPMENT ? "info" : "info",
  //@ts-expect-error
  transport: {
    target: "pino-pretty",
    options: {
      levelFirst: true,
      singleLine: true,
      translateTime: true,
    },
  },
});

import winston from "winston";
const { createLogger, format, transports } = winston;
const { combine, splat, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  const msg = `${timestamp} [${level}] : ${message} `;

  return msg;
});

export const logger = createLogger({
  format: combine(format.colorize(), splat(), timestamp(), myFormat),
  transports: [new transports.Console()],
});

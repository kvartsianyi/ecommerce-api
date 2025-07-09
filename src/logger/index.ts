import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, splat } = format;

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const logFormat = printf(({ level, message, timestamp, context, ...restMeta }) => {
  const contextLabel = context ? ` [${context}]` : '';

  let meta = '';
  if (restMeta && restMeta.error instanceof Error) {
    meta = `\n${restMeta.error.stack}`;
  } else if (Object.keys(restMeta).length) {
    meta = `\n${JSON.stringify(restMeta, null, 2)}`;
  }

  return `${timestamp}${contextLabel} ${level}: ${message}${meta}`;
});

const logger = createLogger({
  level: 'info', // allows error, warn, info
  format: combine(timestamp({ format: TIMESTAMP_FORMAT }), colorize(), splat(), logFormat),
  transports: [new transports.Console()],
});

export default logger;

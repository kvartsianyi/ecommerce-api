export const serializeResponse = <T>(data: T, extras?: Record<string, unknown>): { data: T } => {
  return { data, ...extras };
};

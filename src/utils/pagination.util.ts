export const calcOffset = (page: number, perPage: number) => (page - 1) * perPage;

export const calcTotalPages = (totalCount: number, perPage: number) =>
  Math.ceil(totalCount / perPage);

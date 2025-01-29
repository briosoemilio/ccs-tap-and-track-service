export const isIdentifierEmail = (identifier: string) => {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(identifier);
};

export const ACCESS_ENUM = {
  ADMIN: "admin",
  USER: "user",
  VISITOR: "visitor",
} as const;

export type AccessEnum = (typeof ACCESS_ENUM)[keyof typeof ACCESS_ENUM];

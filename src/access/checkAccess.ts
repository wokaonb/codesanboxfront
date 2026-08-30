import type { UserInfo } from "../store/User";
import { ACCESS_ENUM, type AccessEnum } from "./accessEnum";

const roleRank: Record<AccessEnum, number> = {
  [ACCESS_ENUM.VISITOR]: 0,
  [ACCESS_ENUM.USER]: 1,
  [ACCESS_ENUM.ADMIN]: 2,
};

export function checkAccess(user: UserInfo | null, needRole: AccessEnum): boolean {
  const userRole: AccessEnum = user?.role ?? ACCESS_ENUM.VISITOR;
  return roleRank[userRole] >= roleRank[needRole];
}

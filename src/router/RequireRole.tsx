import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ACCESS_ENUM, type AccessEnum } from "../access/accessEnum";
import { checkAccess } from "../access/checkAccess";
import { useAuthStore } from "../store/User";

function RequireRole({ needRole, children }: { needRole: AccessEnum; children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!checkAccess(user, needRole)) {
    if (needRole !== ACCESS_ENUM.VISITOR && !token) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/problems" replace />;
  }
  return <>{children}</>;
}

export default RequireRole;

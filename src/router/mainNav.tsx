import { lazy, type ComponentType } from "react";
import { ACCESS_ENUM, type AccessEnum } from "../access/accessEnum";

export interface MainNavItem {
  path: string;
  label: string;
  Component: ComponentType;
  needRole: AccessEnum;
}

export const mainNavItems: MainNavItem[] = [
  {
    path: "problems",
    label: "题目列表",
    Component: lazy(() => import("../pages/Problems")),
    needRole: ACCESS_ENUM.VISITOR,
  },
  {
    path: "submissions",
    label: "提交记录",
    Component: lazy(() => import("../pages/SubmissionList")),
    needRole: ACCESS_ENUM.USER,
  },
  {
    path: "admin/problems",
    label: "题目管理",
    Component: lazy(() => import("../pages/AdminProblemList")),
    needRole: ACCESS_ENUM.ADMIN,
  },
  {
    path: "aboutme",
    label: "关于我的",
    Component: lazy(() => import("../pages/Aboutme")),
    needRole: ACCESS_ENUM.VISITOR,
  },
];

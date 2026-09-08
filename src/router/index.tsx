/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ACCESS_ENUM } from "../access/accessEnum";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/User/Login";
import NotFound from "../pages/NotFound";
import Register from "../pages/User/Register";
import RequireRole from "./RequireRole";
import { mainNavItems } from "./mainNav";

const ProblemDetail = lazy(() => import("../pages/ProblemDetail"));
const SubmissionDetail = lazy(() => import("../pages/SubmissionDetail"));
const AdminCreateProblem = lazy(() => import("../pages/AdminCreateProblem"));
const AdminEditProblem = lazy(() => import("../pages/AdminEditProblem"));

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/problems" replace /> },
      ...mainNavItems.map((item) => ({
        path: item.path,
        element: (
          <RequireRole needRole={item.needRole}>
            <item.Component />
          </RequireRole>
        ),
      })),
      {
        path: "problems/:id",
        element: (
          <RequireRole needRole={ACCESS_ENUM.VISITOR}>
            <ProblemDetail />
          </RequireRole>
        ),
      },
      {
        path: "submissions/:id",
        element: (
          <RequireRole needRole={ACCESS_ENUM.USER}>
            <SubmissionDetail />
          </RequireRole>
        ),
      },
      {
        path: "admin/problems/new",
        element: (
          <RequireRole needRole={ACCESS_ENUM.ADMIN}>
            <AdminCreateProblem />
          </RequireRole>
        ),
      },
      {
        path: "admin/problems/:id",
        element: (
          <RequireRole needRole={ACCESS_ENUM.ADMIN}>
            <AdminEditProblem />
          </RequireRole>
        ),
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;

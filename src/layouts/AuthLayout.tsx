import { Outlet } from "react-router-dom";
import FooterLayout from "./footerLayout";
import { Layout } from "@arco-design/web-react";

function AuthLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div className="auth-bg">
        <Outlet />
      </div>
      <FooterLayout />
    </Layout>
  );
}

export default AuthLayout;

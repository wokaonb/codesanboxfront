import { Layout, Spin } from "@arco-design/web-react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import HeaderLayout from "./HeaderLayout";
import FooterLayout from "./footerLayout";

const { Content } = Layout;

function MainLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderLayout />
      <Content style={{ padding: 24 }}>
        <Suspense fallback={<Spin dot style={{ display: "block", margin: "200px auto" }} />}>
          <Outlet />
        </Suspense>
      </Content>
      <FooterLayout />
    </Layout>
  );
}

export default MainLayout;

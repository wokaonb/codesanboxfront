import { Avatar, Button, Dropdown, Layout, Menu } from "@arco-design/web-react";
import { useLocation, useNavigate } from "react-router-dom";
import { mainNavItems } from "../router/mainNav";
import logo from "../assets/favicon.svg";
import { useAuthStore } from "../store/User";
import { checkAccess } from "../access/checkAccess";

const { Header } = Layout;

function HeaderLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const menuItems = mainNavItems
    .filter((item) => checkAccess(user, item.needRole))
    .map((item) => ({
      key: `/${item.path}`,
      label: item.label,
    }));

  const selectedKey = menuItems.find(
    (item) => location.pathname === item.key || location.pathname.startsWith(item.key + "/")
  )?.key;

  const onLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const userDropList = (
    <Menu onClickMenuItem={onLogout}>
      <Menu.Item key="logout">退出登录</Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        height: 60,
        padding: "0 24px",
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={logo} alt="logo" style={{ height: 32, width: 32, display: "block" }} />
        <span style={{ fontSize: 17, fontWeight: 600, color: "#1d2129", whiteSpace: "nowrap" }}>
          CodeSandbox 判题
        </span>
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={selectedKey ? [selectedKey] : []}
        onClickMenuItem={(key) => navigate(key)}
        style={{ flex: 1, minWidth: 0 }}
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        ))}
      </Menu>
      {user ? (
        <Dropdown droplist={userDropList} position="br">
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Avatar style={{ background: "#32ca99" }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <span style={{ color: "#1d2129" }}>{user.username}</span>
          </div>
        </Dropdown>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => navigate("/login")}>登录</Button>
          <Button type="primary" onClick={() => navigate("/register")}>
            注册
          </Button>
        </div>
      )}
    </Header>
  );
}

export default HeaderLayout;

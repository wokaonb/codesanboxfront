import { Button, Card, Form, Input, Link, Message } from "@arco-design/web-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AccessEnum } from "../access/accessEnum";
import { api } from "../api/request";
import { useAuthStore } from "../store/User";

interface LoginResponse {
  token: string;
  user: { id: number; username: string; role: AccessEnum; avatar?: string | null };
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setSubmitting(true);
    try {
      const data = await api.post<LoginResponse>("/auth/login", values);
      setAuth(data.token, { ...data.user, avatar: data.user.avatar ?? "" });
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(from || "/problems", { replace: true });
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="auth-card">
      <h1 className="auth-title">欢迎回来</h1>
      <p className="auth-subtitle">登录 CodeSandbox 在线判题</p>
      <Form
        onSubmit={onFinish}
        style={{ marginTop: 24 }}
        labelCol={{ flex: "76px" }}
        wrapperCol={{ flex: "auto" }}
      >
        <Form.Item
          field="username"
          label="用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input size="large" placeholder="用户名" />
        </Form.Item>
        <Form.Item
          field="password"
          label="密码"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input.Password size="large" placeholder="密码" />
        </Form.Item>
        <Button type="primary" htmlType="submit" long size="large" loading={submitting}>
          登录
        </Button>
      </Form>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link onClick={() => navigate("/register")}>还没有账号？去注册</Link>
      </div>
    </Card>
  );
}

export default Login;

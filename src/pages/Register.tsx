import { Button, Card, Form, Input, Link, Message } from "@arco-design/web-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/request";

function Register() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: { username: string; password: string; email: string }) => {
    setSubmitting(true);
    try {
      await api.post("/auth/register", values);
      Message.success("注册成功，请登录");
      navigate("/login", { replace: true });
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "注册失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="auth-card">
      <h1 className="auth-title">创建账号</h1>
      <p className="auth-subtitle">注册 CodeSandbox 在线判题</p>
      <Form
        onSubmit={onFinish}
        style={{ marginTop: 24 }}
        labelCol={{ flex: "76px" }}
        wrapperCol={{ flex: "auto" }}
      >
        <Form.Item
          field="username"
          label="用户名"
          rules={[
            { required: true, message: "请输入用户名" },
            { minLength: 3, maxLength: 8, message: "用户名长度 3-8 个字符" },
          ]}
        >
          <Input size="large" placeholder="用户名（3-8 个字符）" />
        </Form.Item>
        <Form.Item
          field="password"
          label="密码"
          rules={[
            { required: true, message: "请输入密码" },
            { minLength: 8, message: "密码至少 8 个字符" },
          ]}
        >
          <Input.Password size="large" placeholder="密码（至少 8 个字符）" />
        </Form.Item>
        <Form.Item
          field="email"
          label="邮箱"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "邮箱格式不正确" },
          ]}
        >
          <Input size="large" placeholder="邮箱" />
        </Form.Item>
        <Button type="primary" htmlType="submit" long size="large" loading={submitting}>
          注册
        </Button>
      </Form>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link onClick={() => navigate("/login")}>已有账号？去登录</Link>
      </div>
    </Card>
  );
}

export default Register;

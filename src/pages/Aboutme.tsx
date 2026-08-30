import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Message,
  Modal,
  Space,
  Tag,
  Typography,
  Upload,
} from "@arco-design/web-react";
import type { UploadItem } from "@arco-design/web-react/es/Upload";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/request";
import { useAuthStore } from "../store/User";
import type { UserInfo } from "../store/User";

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  admin: { label: "管理员", color: "gold" },
  user: { label: "普通用户", color: "green" },
};

function Aboutme() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    if (editVisible && user) {
      editForm.setFieldsValue({ username: user.username, email: "" });
    }
  }, [editVisible, user, editForm]);

  const onEditSubmit = async (values: { username: string }) => {
    setSaving(true);
    try {
      const data = await api.put<UserInfo>("/auth/me", values);
      updateUser({ username: data.username, avatar: data.avatar ?? "" });
      Message.success("资料已更新");
      setEditVisible(false);
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "更新失败");
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = async (fileList: UploadItem[]) => {
    const file = fileList[fileList.length - 1]?.originFile;
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const data = await api.postForm<UserInfo>("/auth/me/avatar", form);
      updateUser({ avatar: data.avatar ?? "" });
      Message.success("头像已更新");
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "头像上传失败");
    }
  };

  if (!user) {
    return (
      <Card className="app-card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <Typography.Title heading={4}>关于我的</Typography.Title>
        <Typography.Paragraph>你还没有登录，登录后可查看个人信息和提交记录。</Typography.Paragraph>
        <Button type="primary" onClick={() => navigate("/login")}>
          去登录
        </Button>
      </Card>
    );
  }

  const roleInfo = ROLE_LABEL[user.role] ?? { label: user.role, color: "gray" };

  return (
    <Space direction="vertical" size="large" style={{ display: "flex", maxWidth: 640 }}>
      <Card className="app-card">
        <Space align="center" size="large">
          <Upload
            showUploadList={false}
            accept="image/png,image/jpeg,image/webp,image/gif"
            autoUpload={false}
            onChange={onAvatarChange}
          >
            <Avatar size={64} style={{ background: "#32ca99", fontSize: 28, cursor: "pointer" }}>
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%" }} />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </Avatar>
          </Upload>
          <div>
            <Space align="center">
              <Typography.Title heading={4} style={{ margin: 0 }}>
                {user.username}
              </Typography.Title>
              <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
            </Space>
            <div style={{ marginTop: 8 }}>
              <Descriptions
                column={1}
                data={[
                  { label: "用户 ID", value: String(user.id) },
                  { label: "角色", value: roleInfo.label },
                ]}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <Button size="small" onClick={() => setEditVisible(true)}>
                编辑资料
              </Button>
            </div>
          </div>
        </Space>
        <div style={{ color: "#86909c", fontSize: 12, marginTop: 8 }}>
          点击头像可上传新头像（png/jpg/webp/gif，不超过 2MB）
        </div>
      </Card>

      <Card className="app-card" title="站点说明">
        <Typography.Paragraph>
          CodeSandbox 是一个在线判题系统，支持在线做题、提交代码并获得判定结果。
        </Typography.Paragraph>
        <Typography.Paragraph>
          支持语言：Python 3、C++ 17、Java 17。代码在 Docker
          沙箱中编译和运行，限制资源用量并隔离网络。
        </Typography.Paragraph>
        <Typography.Paragraph>判定结果类型：</Typography.Paragraph>
        <Space wrap>
          <Tag color="green">通过</Tag>
          <Tag color="red">答案错误</Tag>
          <Tag color="orange">超出时间限制</Tag>
          <Tag color="orange">超出内存限制</Tag>
          <Tag color="red">运行时错误</Tag>
          <Tag color="purple">编译错误</Tag>
          <Tag color="gray">系统错误</Tag>
        </Space>
      </Card>

      <Modal
        title="编辑资料"
        visible={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
      >
        <Form form={editForm} onSubmit={onEditSubmit} style={{ marginTop: 16 }}>
          <Form.Item
            field="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { minLength: 3, maxLength: 8, message: "用户名长度 3-8 个字符" },
            ]}
          >
            <Input placeholder="用户名（3-8 个字符）" />
          </Form.Item>
          <Form.Item label=" ">
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存
              </Button>
              <Button onClick={() => setEditVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default Aboutme;

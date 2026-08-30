import { Avatar, Button, Card, Descriptions, Space, Tag, Typography } from "@arco-design/web-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/User";

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  admin: { label: "管理员", color: "gold" },
  user: { label: "普通用户", color: "green" },
};

function Aboutme() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

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
          <Avatar size={64} style={{ background: "#32ca99", fontSize: 28 }}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
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
          </div>
        </Space>
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
    </Space>
  );
}

export default Aboutme;

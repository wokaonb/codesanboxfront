import {
  Button,
  Card,
  Form,
  Input,
  Message,
  Modal,
  Select,
  Space,
  Switch,
  Upload,
} from "@arco-design/web-react";
import type { UploadItem } from "@arco-design/web-react/es/Upload";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/request";
import type { Problem } from "../types";
interface ProblemFormValues {
  title: string;
  description: string;
  difficulty: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  input_format?: string;
  output_format?: string;
  tags?: string;
  is_visible: boolean;
}

function AdminEditProblem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testcasesSubmitting, setTestcasesSubmitting] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.get<Problem>(`/problems/${id}`);
        if (cancelled) return;
        setProblem(data);
        form.setFieldsValue({
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          time_limit_ms: data.time_limit_ms,
          memory_limit_mb: data.memory_limit_mb,
          input_format: data.input_format,
          output_format: data.output_format,
          tags: (data.tags ?? []).join(","),
          is_visible: true,
        });
      } catch (err) {
        if (cancelled) return;
        Message.error(err instanceof Error ? err.message : "加载题目失败");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, form]);

  const onSubmit = async (values: ProblemFormValues) => {
    setSubmitting(true);
    try {
      const tags = (values.tags ?? "")
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean);
      await api.put(`/problems/${id}`, {
        title: values.title,
        description: values.description,
        difficulty: values.difficulty,
        time_limit_ms: values.time_limit_ms,
        memory_limit_mb: values.memory_limit_mb,
        input_format: values.input_format ?? "",
        output_format: values.output_format ?? "",
        tags,
        is_visible: values.is_visible,
      });
      Message.success("保存成功");
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdateTestcases = async () => {
    if (!zipFile) {
      Message.warning("请先选择新的测试用例压缩包");
      return;
    }
    setTestcasesSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("test_cases", zipFile);
      await api.putForm(`/problems/${id}/testcases`, formData);
      Message.success("测试用例更新成功");
      setZipFile(null);
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "更新测试用例失败");
    } finally {
      setTestcasesSubmitting(false);
    }
  };

  const onDelete = () => {
    Modal.confirm({
      title: "删除题目",
      content: "确定删除该题目吗？该操作会同时删除其测试用例，且无法恢复。",
      okButtonProps: { status: "danger" },
      onOk: async () => {
        try {
          await api.delete(`/problems/${id}`);
          Message.success("删除成功");
          navigate("/admin/problems", { replace: true });
        } catch (err) {
          Message.error(err instanceof Error ? err.message : "删除失败");
        }
      },
    });
  };

  if (!problem) {
    return <Card>加载中...</Card>;
  }

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <div>
        <h2 className="page-title">编辑题目 #{id}</h2>
        <Card className="app-card">
          <Form
            form={form}
            onSubmit={onSubmit}
            onSubmitFailed={() => Message.error("请检查表单填写是否完整")}
            style={{ maxWidth: 640 }}
            labelCol={{ span: 6 }}
          >
            <Form.Item
              field="title"
              label="标题"
              rules={[{ required: true, message: "请输入标题" }]}
            >
              <Input placeholder="题目标题" />
            </Form.Item>
            <Form.Item
              field="description"
              label="题目描述"
              rules={[{ required: true, message: "请输入题目描述" }]}
            >
              <Input.TextArea placeholder="题目描述" autoSize={{ minRows: 5, maxRows: 12 }} />
            </Form.Item>
            <Form.Item
              field="difficulty"
              label="难度"
              rules={[{ required: true, message: "请选择难度" }]}
            >
              <Select placeholder="选择难度">
                <Select.Option value="easy">简单</Select.Option>
                <Select.Option value="medium">中等</Select.Option>
                <Select.Option value="hard">困难</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              field="time_limit_ms"
              label="时间限制 (ms)"
              rules={[
                { required: true, message: "请输入时间限制" },
                {
                  validator: (value, callback) => {
                    const num = Number(value);
                    if (!Number.isFinite(num) || num < 1 || num > 10000) {
                      callback("时间限制需在 1-10000 ms 之间");
                    } else {
                      callback();
                    }
                  },
                },
              ]}
            >
              <Input type="number" placeholder="如 1000" />
            </Form.Item>
            <Form.Item
              field="memory_limit_mb"
              label="内存限制 (MB)"
              rules={[
                { required: true, message: "请输入内存限制" },
                {
                  validator: (value, callback) => {
                    const num = Number(value);
                    if (!Number.isFinite(num) || num < 1 || num > 1024) {
                      callback("内存限制需在 1-1024 MB 之间");
                    } else {
                      callback();
                    }
                  },
                },
              ]}
            >
              <Input type="number" placeholder="如 128" />
            </Form.Item>
            <Form.Item field="input_format" label="输入格式">
              <Input.TextArea placeholder="输入格式说明" autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>
            <Form.Item field="output_format" label="输出格式">
              <Input.TextArea placeholder="输出格式说明" autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>
            <Form.Item field="tags" label="标签">
              <Input placeholder="多个标签用逗号分隔，如 数组,排序" />
            </Form.Item>
            <Form.Item field="is_visible" label="是否可见" triggerPropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label=" ">
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  保存
                </Button>
                <Button status="danger" onClick={onDelete}>
                  删除题目
                </Button>
                <Button onClick={() => navigate("/admin/problems")}>返回</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <Card className="app-card" title="更新测试用例">
        <Space>
          <Upload
            accept=".zip"
            autoUpload={false}
            limit={1}
            onChange={(fileList: UploadItem[]) => {
              setZipFile(fileList[0]?.originFile ?? null);
            }}
          >
            <Button>选择新的 .zip 压缩包</Button>
          </Upload>
          <Button type="primary" loading={testcasesSubmitting} onClick={onUpdateTestcases}>
            上传并替换测试用例
          </Button>
        </Space>
        <div style={{ color: "#86909c", fontSize: 12, marginTop: 8 }}>
          压缩包内文件名为 test_1.in / test_1.out，编号从 1 连续，不允许子目录，单个文件不超过 10MB
        </div>
      </Card>
    </Space>
  );
}

export default AdminEditProblem;

import { Button, Card, Form, Input, Message, Select, Space, Upload } from "@arco-design/web-react";
import type { UploadItem } from "@arco-design/web-react/es/Upload";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/request";
import SampleEditor from "../components/SampleEditor";
import type { ProblemSample } from "../types";

interface ProblemFormValues {
  title: string;
  description: string;
  difficulty: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  input_format?: string;
  output_format?: string;
  tags?: string;
  samples?: ProblemSample[];
}

function AdminCreateProblem() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  const onSubmit = async (values: ProblemFormValues) => {
    if (!zipFile) {
      Message.warning("请上传测试用例压缩包（.zip）");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("difficulty", values.difficulty);
      formData.append("time_limit_ms", String(values.time_limit_ms));
      formData.append("memory_limit_mb", String(values.memory_limit_mb));
      formData.append("input_format", values.input_format ?? "");
      formData.append("output_format", values.output_format ?? "");
      const tags = (values.tags ?? "")
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tags));
      formData.append("samples", JSON.stringify(values.samples ?? []));
      formData.append("test_cases", zipFile);
      await api.postForm("/problems", formData);
      Message.success("创建成功");
      navigate("/admin/problems", { replace: true });
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">新建题目</h2>
      <Card className="app-card">
        <Form
          form={form}
          onSubmit={onSubmit}
          onSubmitFailed={() => Message.error("请检查表单填写是否完整")}
          style={{ maxWidth: 640 }}
          labelCol={{ span: 6 }}
        >
          <Form.Item field="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input placeholder="题目标题" />
          </Form.Item>
          <Form.Item
            field="description"
            label="题目描述"
            rules={[{ required: true, message: "请输入题目描述" }]}
          >
            <Input.TextArea
              placeholder="支持 Markdown 与 $公式$，例如 **加粗**、`代码`、$$a^2+b^2$$"
              autoSize={{ minRows: 5, maxRows: 12 }}
            />
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
          <Form.Item field="samples" label="样例">
            <SampleEditor />
          </Form.Item>
          <Form.Item label="测试用例">
            <Upload
              accept=".zip"
              autoUpload={false}
              limit={1}
              onChange={(fileList: UploadItem[]) => {
                setZipFile(fileList[0]?.originFile ?? null);
              }}
            >
              <Button icon={<span>上传</span>}>选择 .zip 压缩包</Button>
            </Upload>
            <div style={{ color: "#86909c", fontSize: 12, marginTop: 4 }}>
              压缩包内文件名为 test_1.in / test_1.out，编号从 1 连续，不允许子目录，单个文件不超过
              10MB
            </div>
          </Form.Item>
          <Form.Item label=" ">
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                创建
              </Button>
              <Button onClick={() => navigate("/admin/problems")}>返回</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default AdminCreateProblem;

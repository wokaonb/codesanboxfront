import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import type { Extension } from "@codemirror/state";
import {
  Button,
  Card,
  Descriptions,
  Message,
  Modal,
  Result,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import CodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ACCESS_ENUM } from "../access/accessEnum";
import { api } from "../api/request";
import { JUDGE_STATUS, JUDGE_STATUS_DESCRIPTION } from "../constants/judgeStatus";
import { usePolling } from "../hooks/usePolling";
import { useAuthStore } from "../store/User";
import type { Submission, TestResult } from "../types";

const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python 3",
  c: "C 17",
  cpp: "C++ 17",
  java: "Java 17",
};

const LANGUAGE_EXTENSIONS: Record<string, Extension[]> = {
  python: [python()],
  c: [cpp()],
  cpp: [cpp()],
  java: [java()],
};

function OutputBlock({ label, content }: { label: string; content?: string }) {
  if (!content) {
    return null;
  }
  return (
    <div>
      <div className="sample-label">{label}</div>
      <pre className="code-block">{content}</pre>
    </div>
  );
}

function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === ACCESS_ENUM.ADMIN;
  const [resetKey, setResetKey] = useState(0);
  const [rejudging, setRejudging] = useState(false);

  const { data, loading, error } = usePolling(
    () => api.get<Submission>(`/submissions/${id}`),
    (submission) => submission.status !== "Pending" && submission.status !== "Running",
    1000,
    30000,
    resetKey
  );

  const onRejudge = () => {
    Modal.confirm({
      title: "重新判题",
      content: "将这条提交记录重新排队判题，原有的判定结果会被覆盖。",
      onOk: async () => {
        setRejudging(true);
        try {
          await api.post<Submission>(`/submissions/${id}/rejudge`);
          Message.success("已重新排队判题");
          setResetKey((key) => key + 1);
        } catch (err) {
          Message.error(err instanceof Error ? err.message : "重判失败");
        } finally {
          setRejudging(false);
        }
      },
    });
  };

  if (loading && !data) {
    return <Spin dot style={{ display: "block", margin: "200px auto" }} />;
  }
  if (error) {
    return <Result status="error" title="加载失败" subTitle={error} />;
  }
  if (!data) {
    return <Result status="error" title="提交记录不存在" />;
  }

  const statusInfo = JUDGE_STATUS[data.status] ?? { label: data.status, color: "gray" };
  const statusDescription = JUDGE_STATUS_DESCRIPTION[data.status];

  const resultColumns: ColumnProps<TestResult>[] = [
    { title: "用例", dataIndex: "case", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      render: (value) => {
        const info = JUDGE_STATUS[value as string] ?? { label: value, color: "gray" };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: "耗时",
      dataIndex: "time_ms",
      width: 120,
      render: (value) => `${value} ms`,
    },
    {
      title: "内存",
      dataIndex: "memory_kb",
      width: 120,
      render: (value) => `${(value / 1024).toFixed(1)} MB`,
    },
    {
      title: "说明",
      dataIndex: "detail",
      render: (value) => (value ? <Typography.Text type="warning">{value}</Typography.Text> : "-"),
    },
  ];

  const renderCaseDetail = (record: TestResult) => (
    <Space direction="vertical" size="small" style={{ display: "flex", padding: "4px 0" }}>
      <OutputBlock label="期望输出" content={record.expected_output} />
      <OutputBlock label="实际输出" content={record.stdout || "（无输出）"} />
      <OutputBlock label="标准错误" content={record.stderr} />
    </Space>
  );

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <Card className="app-card">
        <Space align="center" style={{ marginBottom: 16 }}>
          <Typography.Title heading={4} style={{ margin: 0 }}>
            提交 #{data.id}
          </Typography.Title>
          <Tag color={statusInfo.color} size="large">
            {statusInfo.label}
          </Tag>
          {isAdmin && (
            <Button size="small" loading={rejudging} onClick={onRejudge}>
              重判
            </Button>
          )}
        </Space>
        {statusDescription && (
          <Typography.Paragraph type="warning" style={{ marginTop: 0 }}>
            {statusDescription}
          </Typography.Paragraph>
        )}
        <Space size="large" style={{ marginBottom: 16 }}>
          <Statistic
            title="耗时"
            value={data.time_used_ms ?? "-"}
            suffix={data.time_used_ms != null ? "ms" : ""}
          />
          <Statistic
            title="内存"
            value={
              data.memory_used_kb != null ? Number((data.memory_used_kb / 1024).toFixed(1)) : "-"
            }
            suffix={data.memory_used_kb != null ? "MB" : ""}
          />
        </Space>
        <Descriptions
          column={4}
          data={[
            { label: "提交者", value: data.username || `用户 ${data.user_id}` },
            { label: "题目编号", value: String(data.problem_id) },
            { label: "语言", value: LANGUAGE_LABEL[data.language] ?? data.language },
            {
              label: "提交时间",
              value: data.created_at.replace("T", " ").slice(0, 19),
            },
          ]}
        />
      </Card>

      {data.code_visible && data.status === "Compile Error" && data.compile_output && (
        <Card className="app-card" title="编译错误信息">
          <pre className="code-block">{data.compile_output}</pre>
        </Card>
      )}

      {data.test_results && data.test_results.length > 0 && (
        <Card className="app-card" title="测试用例结果">
          <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
            {data.code_visible
              ? "展开任意一行可查看该用例的实际输出、期望输出与标准错误。"
              : "他人的提交只展示用例判定结果，代码与输出仅提交者和管理员可见。"}
          </Typography.Paragraph>
          <Table
            rowKey="case"
            data={data.test_results}
            columns={resultColumns}
            pagination={false}
            expandedRowRender={data.code_visible ? renderCaseDetail : undefined}
          />
        </Card>
      )}

      {data.code_visible && data.code ? (
        <Card className="app-card" title="提交代码">
          <CodeMirror
            value={data.code}
            extensions={LANGUAGE_EXTENSIONS[data.language] ?? []}
            height="auto"
            readOnly
            basicSetup={{ lineNumbers: true, foldGutter: true }}
            style={{ fontSize: 13 }}
          />
        </Card>
      ) : (
        <Card className="app-card" title="提交代码">
          <Typography.Text type="secondary">
            代码、编译输出与用例输出仅提交者本人和管理员可见。
          </Typography.Text>
        </Card>
      )}
    </Space>
  );
}

export default SubmissionDetail;

import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import type { Extension } from "@codemirror/state";
import {
  Card,
  Descriptions,
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
import { useParams } from "react-router-dom";
import { api } from "../api/request";
import { JUDGE_STATUS, JUDGE_STATUS_DESCRIPTION } from "../constants/judgeStatus";
import { usePolling } from "../hooks/usePolling";
import type { Submission, TestResult } from "../types";

const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python 3",
  cpp: "C++ 17",
  java: "Java 17",
};

const LANGUAGE_EXTENSIONS: Record<string, Extension[]> = {
  python: [python()],
  cpp: [cpp()],
  java: [java()],
};

function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = usePolling(
    () => api.get<Submission>(`/submissions/${id}`),
    (s) => s.status !== "Pending" && s.status !== "Running",
    1000,
    30000
  );

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
  ];

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
          column={3}
          data={[
            { label: "题目编号", value: String(data.problem_id) },
            { label: "语言", value: LANGUAGE_LABEL[data.language] ?? data.language },
            {
              label: "提交时间",
              value: data.created_at.replace("T", " ").slice(0, 19),
            },
          ]}
        />
      </Card>

      {data.status === "Compile Error" && data.compile_output && (
        <Card className="app-card" title="编译错误信息">
          <pre className="code-block">{data.compile_output}</pre>
        </Card>
      )}

      {data.test_results && data.test_results.length > 0 && (
        <Card className="app-card" title="测试用例结果">
          <Table
            rowKey="case"
            data={data.test_results}
            columns={resultColumns}
            pagination={false}
          />
        </Card>
      )}

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
    </Space>
  );
}

export default SubmissionDetail;

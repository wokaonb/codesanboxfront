import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import {
  Button,
  Card,
  Descriptions,
  Input,
  Message,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "@arco-design/web-react";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/request";
import MarkdownView from "../components/MarkdownView";
import { JUDGE_STATUS, SUPPORTED_LANGUAGES } from "../constants/judgeStatus";
import { useAuthStore } from "../store/User";
import type { Problem, RunResult } from "../types";

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  easy: { label: "简单", color: "green" },
  medium: { label: "中等", color: "orange" },
  hard: { label: "困难", color: "red" },
};

const TEMPLATES: Record<string, string> = {
  python:
    'import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 在这里实现你的代码\n    pass\n\nif __name__ == "__main__":\n    main()\n',
  c: "#include <stdio.h>\n\nint main() {\n    // 在这里实现你的代码\n    return 0;\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里实现你的代码\n    return 0;\n}\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // 在这里实现你的代码\n    }\n}\n",
};

const LANGUAGE_EXTENSIONS: Record<string, Extension[]> = {
  python: [python(), indentUnit.of("    ")],
  c: [cpp(), indentUnit.of("    ")],
  cpp: [cpp(), indentUnit.of("    ")],
  java: [java(), indentUnit.of("    ")],
};

function ProblemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(TEMPLATES.python);
  const [submitting, setSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.get<Problem>(`/problems/${id}`);
        if (cancelled) return;
        setProblem(data);
      } catch (err) {
        if (cancelled) return;
        Message.error(err instanceof Error ? err.message : "加载题目失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onLanguageChange = (value: string) => {
    setLanguage(value);
    setCode(TEMPLATES[value] ?? "");
  };

  const requireLogin = () => {
    Message.info("请先登录");
    navigate("/login", { state: { from: { pathname: `/problems/${id}` } } });
  };

  const onSubmit = async () => {
    if (!token) {
      Message.info("请先登录后再提交代码");
      navigate("/login", { state: { from: { pathname: `/problems/${id}` } } });
      return;
    }
    if (!code.trim()) {
      Message.warning("代码不能为空");
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.post<{ id: number }>("/submissions", {
        problem_id: Number(id),
        language,
        code,
      });
      Message.success("提交成功，正在判题");
      navigate(`/submissions/${data.id}`);
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const onRun = async () => {
    if (!token) {
      requireLogin();
      return;
    }
    if (!code.trim()) {
      Message.warning("代码不能为空");
      return;
    }
    setRunning(true);
    setRunResult(null);
    try {
      const data = await api.post<RunResult>("/submissions/run", {
        problem_id: Number(id),
        language,
        code,
        input: customInput,
      });
      setRunResult(data);
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "运行失败");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <Spin dot style={{ display: "block", margin: "200px auto" }} />;
  }
  if (!problem) {
    return <Card>题目不存在</Card>;
  }

  const difficultyInfo = DIFFICULTY_MAP[problem.difficulty] ?? {
    label: problem.difficulty,
    color: "gray",
  };
  const runStatus = runResult
    ? (JUDGE_STATUS[runResult.status] ?? { label: runResult.status, color: "gray" })
    : null;

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <Card className="app-card">
        <Space align="center" style={{ marginBottom: 16 }}>
          <Typography.Title heading={4} style={{ margin: 0 }}>
            {problem.title}
          </Typography.Title>
          <Tag color={difficultyInfo.color}>{difficultyInfo.label}</Tag>
          {problem.tags.map((tag) => (
            <Tag key={tag} color="arcoblue">
              {tag}
            </Tag>
          ))}
        </Space>
        <Descriptions
          column={4}
          data={[
            { label: "时间限制", value: `${problem.time_limit_ms} ms` },
            { label: "内存限制", value: `${problem.memory_limit_mb} MB` },
            { label: "提交次数", value: String(problem.submission_count) },
            {
              label: "通过率",
              value: `${problem.accepted_count} / ${problem.submission_count}（${(
                problem.acceptance_rate * 100
              ).toFixed(1)}%）`,
            },
          ]}
        />
      </Card>

      {problem.description && (
        <Card className="app-card" title="题目描述">
          <MarkdownView content={problem.description} />
        </Card>
      )}

      {problem.input_format && (
        <Card className="app-card" title="输入格式">
          <MarkdownView content={problem.input_format} />
        </Card>
      )}

      {problem.output_format && (
        <Card className="app-card" title="输出格式">
          <MarkdownView content={problem.output_format} />
        </Card>
      )}

      {problem.samples.length > 0 && (
        <Card className="app-card" title="样例">
          <Space direction="vertical" size="medium" style={{ display: "flex" }}>
            {problem.samples.map((sample, index) => (
              <Space key={index} align="start" size="large" wrap>
                <div className="sample-box">
                  <div className="sample-label">输入</div>
                  <pre className="code-block" style={{ background: "transparent", padding: 0 }}>
                    {sample.input}
                  </pre>
                </div>
                <div className="sample-box">
                  <div className="sample-label">输出</div>
                  <pre className="code-block" style={{ background: "transparent", padding: 0 }}>
                    {sample.output}
                  </pre>
                </div>
              </Space>
            ))}
          </Space>
        </Card>
      )}

      <Card className="app-card" title="在线做题">
        <Space direction="vertical" style={{ display: "flex" }}>
          <Select value={language} onChange={onLanguageChange} style={{ width: 160 }}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Select.Option key={lang.value} value={lang.value}>
                {lang.label}
              </Select.Option>
            ))}
          </Select>
          <CodeMirror
            value={code}
            onChange={setCode}
            extensions={LANGUAGE_EXTENSIONS[language] ?? []}
            height="420px"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              autocompletion: true,
              highlightActiveLine: true,
              bracketMatching: true,
              closeBrackets: true,
            }}
            style={{ fontSize: 13 }}
          />
          <Space>
            <Button type="primary" loading={submitting} onClick={onSubmit}>
              提交代码
            </Button>
            <Button onClick={() => setCode(TEMPLATES[language] ?? "")}>恢复模板</Button>
          </Space>
        </Space>
      </Card>

      <Card className="app-card" title="自定义输入试运行">
        <Space direction="vertical" style={{ display: "flex" }}>
          <Typography.Text type="secondary">
            用自定义输入运行当前代码，只查看输出与耗时，不计入提交记录与通过率。
          </Typography.Text>
          <Input.TextArea
            value={customInput}
            placeholder="在此输入程序的标准输入，留空表示无输入"
            autoSize={{ minRows: 4, maxRows: 10 }}
            onChange={setCustomInput}
          />
          <Space>
            <Button type="primary" loading={running} onClick={onRun}>
              运行代码
            </Button>
            <Button onClick={() => setRunResult(null)}>清空结果</Button>
          </Space>
          {runResult && (
            <Space direction="vertical" size="medium" style={{ display: "flex" }}>
              <Space align="center">
                <Tag color={runStatus?.color}>{runStatus?.label}</Tag>
                <Typography.Text type="secondary">
                  耗时 {runResult.time_ms} ms ／ 内存 {(runResult.memory_kb / 1024).toFixed(1)} MB
                </Typography.Text>
              </Space>
              {runResult.detail && (
                <Typography.Text type="warning">{runResult.detail}</Typography.Text>
              )}
              {runResult.compile_output && (
                <div>
                  <div className="sample-label">编译输出</div>
                  <pre className="code-block">{runResult.compile_output}</pre>
                </div>
              )}
              <div>
                <div className="sample-label">运行输出</div>
                <pre className="code-block">{runResult.stdout || "（无输出）"}</pre>
              </div>
              {runResult.stderr && (
                <div>
                  <div className="sample-label">标准错误</div>
                  <pre className="code-block">{runResult.stderr}</pre>
                </div>
              )}
            </Space>
          )}
        </Space>
      </Card>
    </Space>
  );
}

export default ProblemDetail;

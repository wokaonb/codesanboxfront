import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import {
  Button,
  Card,
  Descriptions,
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
import { SUPPORTED_LANGUAGES } from "../constants/judgeStatus";
import { useAuthStore } from "../store/User";
import type { Problem } from "../types";

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  easy: { label: "简单", color: "green" },
  medium: { label: "中等", color: "orange" },
  hard: { label: "困难", color: "red" },
};

const TEMPLATES: Record<string, string> = {
  python:
    'import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 在这里实现你的代码\n    pass\n\nif __name__ == "__main__":\n    main()\n',
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里实现你的代码\n    return 0;\n}\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // 在这里实现你的代码\n    }\n}\n",
};

const LANGUAGE_EXTENSIONS: Record<string, Extension[]> = {
  python: [python(), indentUnit.of("    ")],
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
          column={3}
          data={[
            { label: "时间限制", value: `${problem.time_limit_ms} ms` },
            { label: "内存限制", value: `${problem.memory_limit_mb} MB` },
            { label: "提交语言", value: SUPPORTED_LANGUAGES.map((l) => l.label).join(" / ") },
          ]}
        />
      </Card>

      <Card className="app-card" title="题目描述">
        <Typography.Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
          {problem.description}
        </Typography.Paragraph>
      </Card>

      {problem.input_format && (
        <Card className="app-card" title="输入格式">
          <Typography.Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {problem.input_format}
          </Typography.Paragraph>
        </Card>
      )}

      {problem.output_format && (
        <Card className="app-card" title="输出格式">
          <Typography.Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {problem.output_format}
          </Typography.Paragraph>
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
    </Space>
  );
}

export default ProblemDetail;

import { Button, Input, Space, Typography } from "@arco-design/web-react";
import type { ProblemSample } from "../types";

interface SampleEditorProps {
  value?: ProblemSample[];
  onChange?: (value: ProblemSample[]) => void;
}

function SampleEditor({ value = [], onChange }: SampleEditorProps) {
  const update = (index: number, patch: Partial<ProblemSample>) => {
    onChange?.(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const remove = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange?.([...value, { input: "", output: "" }]);
  };

  return (
    <Space direction="vertical" size="medium" style={{ display: "flex", width: "100%" }}>
      {value.map((sample, index) => (
        <div className="sample-editor" key={index}>
          <Space align="start" size="large" style={{ display: "flex" }} wrap>
            <div className="sample-editor-field">
              <Typography.Text type="secondary">输入</Typography.Text>
              <Input.TextArea
                value={sample.input}
                placeholder="样例输入"
                autoSize={{ minRows: 3, maxRows: 8 }}
                onChange={(text) => update(index, { input: text })}
              />
            </div>
            <div className="sample-editor-field">
              <Typography.Text type="secondary">输出</Typography.Text>
              <Input.TextArea
                value={sample.output}
                placeholder="样例输出"
                autoSize={{ minRows: 3, maxRows: 8 }}
                onChange={(text) => update(index, { output: text })}
              />
            </div>
          </Space>
          <Button
            size="small"
            status="danger"
            style={{ marginTop: 8 }}
            onClick={() => remove(index)}
          >
            删除该样例
          </Button>
        </div>
      ))}
      <Button onClick={add}>添加样例</Button>
    </Space>
  );
}

export default SampleEditor;

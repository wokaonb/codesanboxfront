import {
  Card,
  Input,
  Message,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/request";
import type { ProblemListItem, ProblemListResponse } from "../types";

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  easy: { label: "简单", color: "green" },
  medium: { label: "中等", color: "orange" },
  hard: { label: "困难", color: "red" },
};

function Problems() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProblemListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
        if (difficulty) params.set("difficulty", difficulty);
        if (keyword) params.set("keyword", keyword);
        const data = await api.get<ProblemListResponse>(`/problems?${params.toString()}`);
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
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
  }, [page, pageSize, difficulty, keyword]);

  const columns: ColumnProps<ProblemListItem>[] = [
    { title: "编号", dataIndex: "id", width: 80 },
    {
      title: "标题",
      dataIndex: "title",
      render: (value, record) => <a onClick={() => navigate(`/problems/${record.id}`)}>{value}</a>,
    },
    {
      title: "难度",
      dataIndex: "difficulty",
      width: 100,
      render: (value) => {
        const info = DIFFICULTY_MAP[value as string] ?? { label: value, color: "gray" };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: "标签",
      dataIndex: "tags",
      render: (value) => (
        <Space wrap>
          {(value as string[]).map((tag) => (
            <Tag key={tag} color="arcoblue">
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "通过率",
      dataIndex: "acceptance_rate",
      width: 180,
      render: (value, record) =>
        `${record.accepted_count} / ${record.submission_count}（${((value as number) * 100).toFixed(
          1
        )}%）`,
    },
  ];

  return (
    <div>
      <h2 className="page-title">题目列表</h2>
      <Card className="app-card">
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            style={{ width: 260 }}
            placeholder="按标题搜索"
            allowClear
            onSearch={(value) => {
              setPage(1);
              setLoading(true);
              setKeyword(value.trim());
            }}
          />
          <Select
            style={{ width: 120 }}
            placeholder="全部难度"
            allowClear
            value={difficulty}
            onChange={(value) => {
              setPage(1);
              setLoading(true);
              setDifficulty(value);
            }}
          >
            <Select.Option value="easy">简单</Select.Option>
            <Select.Option value="medium">中等</Select.Option>
            <Select.Option value="hard">困难</Select.Option>
          </Select>
        </Space>
        <Table
          rowKey="id"
          loading={loading}
          data={items}
          columns={columns}
          onRow={(record) => ({
            onClick: () => navigate(`/problems/${record.id}`),
            className: "clickable-row",
          })}
          pagination={false}
        />
        <Pagination
          style={{ marginTop: 16, justifyContent: "flex-end" }}
          total={total}
          current={page}
          pageSize={pageSize}
          showTotal
          showJumper
          onChange={(value) => {
            setPage(value);
            setLoading(true);
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
            setLoading(true);
          }}
        />
      </Card>
    </div>
  );
}

export default Problems;

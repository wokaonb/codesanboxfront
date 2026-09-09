import { Card, Input, Message, Pagination, Space, Table, Tag } from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/request";
import { JUDGE_STATUS } from "../constants/judgeStatus";
import type { SubmissionListItem, SubmissionListResponse } from "../types";

function SubmissionList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SubmissionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [problemId, setProblemId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
        const pid = Number(problemId);
        if (pid > 0) params.set("problem_id", String(pid));
        const data = await api.get<SubmissionListResponse>(`/submissions?${params.toString()}`);
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        if (cancelled) return;
        Message.error(err instanceof Error ? err.message : "加载提交记录失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, problemId]);

  const columns: ColumnProps<SubmissionListItem>[] = [
    { title: "编号", dataIndex: "id", width: 80 },
    { title: "提交者", dataIndex: "username", width: 120 },
    { title: "题目编号", dataIndex: "problem_id", width: 100 },
    { title: "语言", dataIndex: "language", width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      width: 140,
      render: (value) => {
        const info = JUDGE_STATUS[value as string] ?? { label: value, color: "gray" };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: "耗时",
      dataIndex: "time_used_ms",
      width: 100,
      render: (value) => (value == null ? "-" : `${value} ms`),
    },
    {
      title: "内存",
      dataIndex: "memory_used_kb",
      width: 100,
      render: (value) => (value == null ? "-" : `${(value / 1024).toFixed(1)} MB`),
    },
    {
      title: "提交时间",
      dataIndex: "created_at",
      render: (value) => String(value).replace("T", " ").slice(0, 19),
    },
  ];

  return (
    <div>
      <h2 className="page-title">提交记录</h2>
      <Card className="app-card">
        <Space style={{ marginBottom: 16 }}>
          <Input
            style={{ width: 180 }}
            placeholder="按题目编号筛选"
            allowClear
            value={problemId}
            onChange={(value) => {
              setPage(1);
              setLoading(true);
              setProblemId(value);
            }}
          />
        </Space>
        <Table
          rowKey="id"
          loading={loading}
          data={items}
          columns={columns}
          onRow={(record) => ({
            onClick: () => navigate(`/submissions/${record.id}`),
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

export default SubmissionList;

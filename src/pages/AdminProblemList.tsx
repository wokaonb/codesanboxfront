import {
  Button,
  Card,
  Message,
  Modal,
  Pagination,
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

function AdminProblemList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProblemListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(pageSize),
          include_hidden: "true",
        });
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
  }, [page, pageSize, refreshKey]);

  const onDelete = (record: ProblemListItem) => {
    Modal.confirm({
      title: "删除题目",
      content: `确定删除题目「${record.title}」吗？该操作会同时删除其测试用例，且无法恢复。`,
      okButtonProps: { status: "danger" },
      onOk: async () => {
        try {
          await api.delete(`/problems/${record.id}`);
          Message.success("删除成功");
          setLoading(true);
          setRefreshKey((key) => key + 1);
        } catch (err) {
          Message.error(err instanceof Error ? err.message : "删除失败");
        }
      },
    });
  };

  const columns: ColumnProps<ProblemListItem>[] = [
    { title: "编号", dataIndex: "id", width: 80 },
    { title: "标题", dataIndex: "title" },
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
      title: "可见性",
      dataIndex: "is_visible",
      width: 100,
      render: (value) => (value ? <Tag color="green">可见</Tag> : <Tag color="gray">已隐藏</Tag>),
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
    {
      title: "操作",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/admin/problems/${record.id}`)}>
            编辑
          </Button>
          <Button size="small" status="danger" onClick={() => onDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">题目管理</h2>
      <Card
        className="app-card"
        extra={
          <Button type="primary" onClick={() => navigate("/admin/problems/new")}>
            新建题目
          </Button>
        }
      >
        <Table rowKey="id" loading={loading} data={items} columns={columns} pagination={false} />
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

export default AdminProblemList;

import { request } from "@playwright/test";

import { readState } from "./state.js";

export default async function globalTeardown(): Promise<void> {
  const state = readState();
  if (!state.problemCreated) {
    return;
  }

  const api = await request.newContext({ baseURL: state.baseUrl });
  try {
    const login = await api.post("/api/v1/auth/login", { data: state.admin });
    if (!login.ok()) {
      throw new Error(`收尾阶段管理员登录失败: ${login.status()} ${await login.text()}`);
    }
    const response = await api.put(`/api/v1/problems/${state.problemId}`, {
      headers: { Authorization: `Bearer ${(await login.json()).token}` },
      data: { is_visible: false },
    });
    if (!response.ok()) {
      throw new Error(`隐藏测试题目失败: ${response.status()} ${await response.text()}`);
    }
    console.log(`已隐藏测试题目 ${state.problemId}（${state.problemTitle}）`);
  } finally {
    await api.dispose();
  }
}

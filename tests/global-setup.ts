import { request, type APIRequestContext, type APIResponse } from "@playwright/test";
import JSZip from "jszip";

import { writeState, type E2EState } from "./state.js";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1";
const API_PREFIX = "/api/v1";
const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admint01";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin1234";

const TERMINAL = new Set([
  "Accepted",
  "Wrong Answer",
  "Time Limit Exceeded",
  "Memory Limit Exceeded",
  "Runtime Error",
  "Compile Error",
  "System Error",
]);

const C_SUM = `#include <stdio.h>

int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) != 2) {
        return 1;
    }
    printf("%d\\n", a + b);
    return 0;
}
`;

async function requireJson(response: APIResponse, message: string): Promise<unknown> {
  if (!response.ok()) {
    throw new Error(`${message}: ${response.status()} ${await response.text()}`);
  }
  return response.json();
}

async function buildTestcasesZip(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file("test_1.in", "1 2\n");
  zip.file("test_1.out", "3\n");
  zip.file("test_2.in", "10 20\n");
  zip.file("test_2.out", "30\n");
  return zip.generateAsync({ type: "nodebuffer" });
}

async function waitForSubmission(
  api: APIRequestContext,
  headers: Record<string, string>,
  submissionId: number
): Promise<number> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const data = (await requireJson(
      await api.get(`${API_PREFIX}/submissions/${submissionId}`, { headers }),
      "读取提交失败"
    )) as { status: string };
    if (TERMINAL.has(data.status)) {
      return submissionId;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`提交 ${submissionId} 判题超时`);
}

async function submitAndWait(
  api: APIRequestContext,
  headers: Record<string, string>,
  problemId: number,
  code: string
): Promise<number> {
  const created = (await requireJson(
    await api.post(`${API_PREFIX}/submissions`, {
      headers,
      data: { problem_id: problemId, language: "c", code },
    }),
    "创建提交失败"
  )) as { id: number };
  return waitForSubmission(api, headers, created.id);
}

export default async function globalSetup(): Promise<void> {
  const suffix = Date.now().toString(36).slice(-5);
  const api = await request.newContext({ baseURL: BASE_URL });

  try {
    const login = (await requireJson(
      await api.post(`${API_PREFIX}/auth/login`, {
        data: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
      }),
      "管理员登录失败"
    )) as { token: string };
    const adminHeaders = { Authorization: `Bearer ${login.token}` };

    const username = `e2e${suffix}`;
    const password = "e2e-pass-123";
    const register = await api.post(`${API_PREFIX}/auth/register`, {
      data: { username, password, email: `${username}@example.com` },
    });
    if (!register.ok() && register.status() !== 400) {
      throw new Error(`注册测试用户失败: ${register.status()} ${await register.text()}`);
    }

    let problemId = Number(process.env.E2E_PROBLEM_ID ?? 0);
    let problemTitle = process.env.E2E_PROBLEM_TITLE ?? "";
    const problemCreated = !problemId;
    if (problemCreated) {
      problemTitle = `E2E 测试题 ${suffix}`;
      const created = (await requireJson(
        await api.post(`${API_PREFIX}/problems`, {
          headers: adminHeaders,
          multipart: {
            title: problemTitle,
            description: "给定两个整数，输出它们的和。\n\n**注意**：支持负数。\n\n$$a+b$$",
            difficulty: "easy",
            time_limit_ms: "2000",
            memory_limit_mb: "128",
            input_format: "一行两个整数",
            output_format: "一行一个整数",
            tags: JSON.stringify(["E2E"]),
            samples: JSON.stringify([{ input: "1 2\n", output: "3\n" }]),
            test_cases: {
              name: "cases.zip",
              mimeType: "application/zip",
              buffer: await buildTestcasesZip(),
            },
          },
        }),
        "创建测试题目失败"
      )) as { id: number };
      problemId = created.id;
    }

    const adminSubmissionId = await submitAndWait(api, adminHeaders, problemId, C_SUM);

    const userLogin = (await requireJson(
      await api.post(`${API_PREFIX}/auth/login`, { data: { username, password } }),
      "测试用户登录失败"
    )) as { token: string };
    const userHeaders = { Authorization: `Bearer ${userLogin.token}` };
    const userSubmissionId = await submitAndWait(api, userHeaders, problemId, C_SUM);

    const state: E2EState = {
      baseUrl: BASE_URL,
      apiBase: `${BASE_URL}/api/v1`,
      problemId,
      problemTitle,
      problemCreated,
      admin: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
      user: { username, password },
      adminSubmissionId,
      userSubmissionId,
    };
    writeState(state);
    console.log(
      `E2E 准备完成：题目 ${problemId}，普通用户 ${username}，提交 ${userSubmissionId}/${adminSubmissionId}`
    );
  } finally {
    await api.dispose();
  }
}

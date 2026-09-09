import { expect, request, test } from "@playwright/test";

import { state } from "./helpers.js";

const C_BUSY_123MS = `#include <stdio.h>
#include <time.h>

int main() {
    clock_t start = clock();
    while ((clock() - start) * 1000 / CLOCKS_PER_SEC < 123) {
    }
    printf("ok\\n");
    return 0;
}
`;

const TERMINAL = new Set([
  "Accepted",
  "Wrong Answer",
  "Time Limit Exceeded",
  "Memory Limit Exceeded",
  "Runtime Error",
  "Compile Error",
  "System Error",
]);

test("判题耗时精确到毫秒，不受 10 毫秒粒度限制", async () => {
  const api = await request.newContext({ baseURL: state().baseUrl });
  try {
    const login = await api.post("/api/v1/auth/login", { data: state().admin });
    expect(login.ok()).toBeTruthy();
    const headers = { Authorization: `Bearer ${(await login.json()).token}` };

    const samples: number[] = [];
    for (let round = 0; round < 3; round += 1) {
      const created = await api.post("/api/v1/submissions", {
        headers,
        data: { problem_id: state().problemId, language: "c", code: C_BUSY_123MS },
      });
      expect(created.ok()).toBeTruthy();
      const submissionId = (await created.json()).id as number;

      let timeMs = 0;
      for (let attempt = 0; attempt < 240; attempt += 1) {
        const data = (await (
          await api.get(`/api/v1/submissions/${submissionId}`, { headers })
        ).json()) as { status: string; time_used_ms: number | null };
        if (TERMINAL.has(data.status)) {
          timeMs = data.time_used_ms ?? 0;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      samples.push(timeMs);
    }

    expect(samples.every((value) => value >= 110 && value <= 400)).toBeTruthy();
    expect(samples.some((value) => value % 10 !== 0)).toBeTruthy();
  } finally {
    await api.dispose();
  }
});

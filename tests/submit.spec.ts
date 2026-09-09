import { expect, test } from "@playwright/test";

import {
  C_BROKEN,
  C_SUM,
  loginAsUser,
  state,
  submitCode,
  waitForSubmissionStatus,
} from "./helpers.js";

test("提交正确的 C 代码判定通过并展示用例输出", async ({ page }) => {
  await loginAsUser(page);
  await submitCode(page, state().problemId, "C 17", C_SUM);
  await waitForSubmissionStatus(page, "通过");

  const caseCard = page.locator(".arco-card").filter({ hasText: "测试用例结果" });
  await expect(caseCard).toBeVisible();
  await expect(caseCard.locator("tbody tr")).toHaveCount(2);

  await caseCard.locator(".arco-table-expand-icon-cell button").first().click();
  await expect(caseCard).toContainText("实际输出");
  await expect(caseCard).toContainText("3");
});

test("提交语法错误的 C 代码判定编译错误并显示编译信息", async ({ page }) => {
  await loginAsUser(page);
  await submitCode(page, state().problemId, "C 17", C_BROKEN);
  await waitForSubmissionStatus(page, "编译错误");

  await expect(page.getByText("编译错误信息", { exact: true })).toBeVisible();
  await expect(page.locator(".code-block").first()).toContainText("error");
});

test("提交记录中可以找到自己的提交", async ({ page }) => {
  await loginAsUser(page);
  await page.goto("/submissions");
  const row = page.locator("tbody tr").filter({ hasText: state().user.username }).first();
  await expect(row).toBeVisible();
});

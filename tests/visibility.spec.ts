import { expect, test } from "@playwright/test";

import { loginAsAdmin, loginAsUser, state, tableHeaders } from "./helpers.js";

test("提交记录列表显示提交者且包含所有用户的提交", async ({ page }) => {
  await loginAsUser(page);
  await page.goto("/submissions");
  await expect(tableHeaders(page)).toContainText(["编号", "提交者", "题目编号", "语言", "状态"]);
  const rows = page.locator("tbody tr");
  await expect(rows.filter({ hasText: state().user.username })).not.toHaveCount(0);
  await expect(rows.filter({ hasText: state().admin.username })).not.toHaveCount(0);
});

test("普通用户查看他人提交时看不到代码与用例输出", async ({ page }) => {
  await loginAsUser(page);
  await page.goto(`/submissions/${state().adminSubmissionId}`);
  await page.waitForSelector(".arco-card");
  await expect(page.locator(".arco-descriptions").first()).toContainText(state().admin.username);
  await expect(page.getByText("仅提交者本人和管理员可见").first()).toBeVisible();
  await expect(page.locator(".cm-content")).toHaveCount(0);
  await expect(page.locator(".arco-table-expand-icon-cell")).toHaveCount(0);
  const caseCard = page.locator(".arco-card").filter({ hasText: "测试用例结果" });
  await expect(caseCard).toBeVisible();
  await expect(caseCard).not.toContainText("实际输出");
});

test("普通用户查看自己的提交可以看到代码与用例输出", async ({ page }) => {
  await loginAsUser(page);
  await page.goto(`/submissions/${state().userSubmissionId}`);
  await page.waitForSelector(".cm-content");
  await expect(page.locator(".cm-content")).toContainText("scanf");
  const caseCard = page.locator(".arco-card").filter({ hasText: "测试用例结果" });
  await caseCard.locator(".arco-table-expand-icon-cell button").first().click();
  await expect(caseCard).toContainText("实际输出");
});

test("管理员查看他人提交可以看到代码与用例输出", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto(`/submissions/${state().userSubmissionId}`);
  await page.waitForSelector(".cm-content");
  await expect(page.locator(".cm-content")).toContainText("scanf");
  const caseCard = page.locator(".arco-card").filter({ hasText: "测试用例结果" });
  await caseCard.locator(".arco-table-expand-icon-cell button").first().click();
  await expect(caseCard).toContainText("实际输出");
});

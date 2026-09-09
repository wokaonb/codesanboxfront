import { expect, test } from "@playwright/test";

import { loginAsAdmin, state, tableHeaders } from "./helpers.js";

test("题目管理列表显示可见性与通过率", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/problems");
  await expect(page.getByRole("heading", { name: "题目管理" })).toBeVisible();
  await expect(tableHeaders(page)).toContainText([
    "编号",
    "标题",
    "难度",
    "可见性",
    "通过率",
    "操作",
  ]);
  const row = page.locator("tbody tr").filter({ hasText: state().problemTitle });
  await expect(row).toContainText("可见");
});

test("编辑题目页包含样例编辑器、可见性开关与重判按钮", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto(`/admin/problems/${state().problemId}`);
  await expect(page.locator(".sample-editor").first()).toBeVisible();
  await expect(page.locator(".sample-editor textarea").first()).toHaveValue("1 2\n");
  await expect(page.getByRole("button", { name: "添加样例" })).toBeVisible();
  await expect(page.locator(".arco-switch")).toBeVisible();
  await expect(page.getByRole("button", { name: "重判全部提交" })).toBeVisible();
});

test("新建题目页包含样例编辑器与测试用例上传", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/problems/new");
  await expect(page.getByRole("button", { name: "添加样例" })).toBeVisible();
  await expect(page.getByText("选择 .zip 压缩包")).toBeVisible();
});

import { expect, test } from "@playwright/test";

import { editorCard, state, tableHeaders } from "./helpers.js";

test("题目列表包含通过率列并显示统计", async ({ page }) => {
  await page.goto("/problems");
  await expect(page.getByRole("heading", { name: "题目列表" })).toBeVisible();
  await expect(tableHeaders(page)).toContainText(["编号", "标题", "难度", "标签", "通过率"]);
  const row = page.locator("tbody tr").filter({ hasText: state().problemTitle });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(/\d+ \/ \d+（\d+\.\d%）/);
});

test("题目详情渲染 Markdown 加粗与公式并显示样例", async ({ page }) => {
  await page.goto(`/problems/${state().problemId}`);
  await page.waitForSelector(".markdown-body");
  await expect(page.locator(".markdown-body strong").first()).toHaveText("注意");
  await expect(page.locator(".markdown-body .katex").first()).toBeVisible();
  await expect(page.locator(".sample-box").first()).toContainText("1 2");
  await expect(page.locator(".sample-box").nth(1)).toContainText("3");
});

test("题目详情显示统计信息与全部语言选项", async ({ page }) => {
  await page.goto(`/problems/${state().problemId}`);
  await page.waitForSelector(".cm-content");
  await expect(page.locator(".arco-descriptions").first()).toContainText("提交次数");
  await expect(page.locator(".arco-descriptions").first()).toContainText("通过率");
  await editorCard(page).locator(".arco-select").click();
  await expect(page.locator(".arco-select-option")).toContainText([
    "Python 3",
    "C 17",
    "C++ 17",
    "Java 17",
  ]);
});

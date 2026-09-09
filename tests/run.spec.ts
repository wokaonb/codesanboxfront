import { expect, test } from "@playwright/test";

import { C_SUM, loginAsUser, runCard, selectLanguage, setCode, state } from "./helpers.js";

test("自定义输入试运行返回正确输出", async ({ page }) => {
  await loginAsUser(page);
  await page.goto(`/problems/${state().problemId}`);
  await page.waitForSelector(".cm-content");
  await selectLanguage(page, "C 17");
  await setCode(page, C_SUM);

  const card = runCard(page);
  await card.locator("textarea").fill("3 4\n");
  await card.getByRole("button", { name: "运行代码" }).click();

  await expect(card).toContainText("运行完成", { timeout: 90_000 });
  await expect(card).toContainText("运行输出");
  await expect(card.locator(".code-block").last()).toHaveText(/7/);
});

test("自定义输入运行错误时展示标准错误与退出码", async ({ page }) => {
  await loginAsUser(page);
  await page.goto(`/problems/${state().problemId}`);
  await page.waitForSelector(".cm-content");
  await selectLanguage(page, "C 17");
  await setCode(
    page,
    ["#include <stdio.h>", "", 'int main() { fprintf(stderr, "boom\\n"); return 1; }'].join("\n")
  );

  const card = runCard(page);
  await card.locator("textarea").fill("");
  await card.getByRole("button", { name: "运行代码" }).click();

  await expect(card).toContainText("运行时错误", { timeout: 90_000 });
  await expect(card).toContainText("程序退出码 1");
  await expect(card).toContainText("boom");
});

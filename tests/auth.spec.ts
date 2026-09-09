import { expect, test } from "@playwright/test";

import { login, loginAsUser, state } from "./helpers.js";

test("密码错误时提示错误信息并停留在登录页", async ({ page }) => {
  await login(page, state().user.username, "wrong-password");
  await expect(page.getByText("用户名或密码错误")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("普通用户登录后进入题目列表并显示用户名", async ({ page }) => {
  await loginAsUser(page);
  await expect(page.getByRole("heading", { name: "题目列表" })).toBeVisible();
  await expect(page.getByText(state().user.username).first()).toBeVisible();
});

test("未登录访问提交记录会跳转到登录页", async ({ page }) => {
  await page.goto("/submissions");
  await expect(page).toHaveURL(/\/login$/);
});

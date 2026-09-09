import { expect, type Page } from "@playwright/test";

import { readState } from "./state.js";

export function state() {
  return readState();
}

export const C_SUM = `#include <stdio.h>

int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) != 2) {
        return 1;
    }
    printf("%d\\n", a + b);
    return 0;
}
`;

export const C_BROKEN = "int main() { this is not c }\n";

export async function login(page: Page, username: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "用户名" }).fill(username);
  await page.getByRole("textbox", { name: "密码" }).fill(password);
  await page.getByRole("button", { name: "登录" }).click();
}

export async function loginAsUser(page: Page): Promise<void> {
  await login(page, state().user.username, state().user.password);
  await expect(page).toHaveURL(/\/problems$/);
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, state().admin.username, state().admin.password);
  await expect(page).toHaveURL(/\/problems$/);
}

export function editorCard(page: Page) {
  return page.locator(".arco-card").filter({ hasText: "在线做题" });
}

export function runCard(page: Page) {
  return page.locator(".arco-card").filter({ hasText: "自定义输入试运行" });
}

export async function selectLanguage(page: Page, label: string): Promise<void> {
  await editorCard(page).locator(".arco-select").click();
  await page.locator(".arco-select-option").filter({ hasText: label }).click();
}

export async function setCode(page: Page, code: string): Promise<void> {
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(code);
}

export async function waitForSubmissionStatus(
  page: Page,
  label: string,
  timeout = 120_000
): Promise<void> {
  await expect(page.locator(".arco-card").first().locator(".arco-tag").first()).toHaveText(label, {
    timeout,
  });
}

export async function submitCode(
  page: Page,
  problemId: number,
  language: string,
  code: string
): Promise<void> {
  await page.goto(`/problems/${problemId}`);
  await page.waitForSelector(".cm-content");
  await selectLanguage(page, language);
  await setCode(page, code);
  await page.getByRole("button", { name: "提交代码" }).click();
  await page.waitForURL(/\/submissions\/\d+$/, { timeout: 60_000 });
}

export function tableHeaders(page: Page) {
  return page.locator(".arco-table-th");
}

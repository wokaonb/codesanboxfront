# React + TypeScript + Vite

## 端到端测试（Playwright）

`tests/` 下的用例覆盖登录、题目列表与详情、自定义输入试运行、提交判题、提交可见性与管理页面。

前置条件：前后端服务已启动（本地开发执行 `docker compose up -d`，站点为 `http://127.0.0.1`），并且宿主机 Docker 可用（判题与试运行需要创建沙箱容器）。

```bash
npx playwright install chromium   # 首次运行需要下载浏览器
npm run test:e2e                  # 运行全部用例
npm run test:e2e:ui               # 图形界面调试
```

全局准备阶段会自动完成：管理员登录、注册一个随机普通用户、创建一道带测试用例的题目（压缩包由 jszip 现场生成）、两个账号各提交一次 C 代码，并把结果写入 `tests/.state.json` 供用例读取。用例全部结束后（globalTeardown）会把这道题设为隐藏，测试题目不会留在公开题目列表里；用 `E2E_PROBLEM_ID` 指定既有题目时不会改动它。

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `E2E_BASE_URL` | `http://127.0.0.1` | 被测站点地址 |
| `E2E_ADMIN_USERNAME` | `admint01` | 管理员账号 |
| `E2E_ADMIN_PASSWORD` | `admin1234` | 管理员密码 |
| `E2E_PROBLEM_ID` | 空 | 指定后跳过创建题目，直接使用该题目 |
| `E2E_PROBLEM_TITLE` | 空 | 与 `E2E_PROBLEM_ID` 搭配，用于列表断言 |

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

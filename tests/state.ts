import fs from "node:fs";
import path from "node:path";

export interface E2EState {
  baseUrl: string;
  apiBase: string;
  problemId: number;
  problemTitle: string;
  admin: { username: string; password: string };
  user: { username: string; password: string };
  adminSubmissionId: number;
  userSubmissionId: number;
}

const STATE_PATH = path.join(process.cwd(), "tests", ".state.json");

export function writeState(state: E2EState): void {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
}

export function readState(): E2EState {
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as E2EState;
}

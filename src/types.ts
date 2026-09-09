export interface ProblemSample {
  input: string;
  output: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  input_format: string;
  output_format: string;
  samples: ProblemSample[];
  tags: string[];
  is_visible: boolean;
  submission_count: number;
  accepted_count: number;
  acceptance_rate: number;
  created_at: string;
}

export interface ProblemListItem {
  id: number;
  title: string;
  difficulty: string;
  tags: string[];
  is_visible: boolean;
  submission_count: number;
  accepted_count: number;
  acceptance_rate: number;
}

export interface ProblemListResponse {
  total: number;
  items: ProblemListItem[];
}

export interface TestResult {
  case: number;
  status: string;
  time_ms: number;
  memory_kb: number;
  detail?: string;
  stdout?: string;
  stderr?: string;
  expected_output?: string;
}

export interface Submission {
  id: number;
  user_id: number;
  username: string;
  problem_id: number;
  language: string;
  code: string | null;
  code_visible: boolean;
  status: string;
  time_used_ms: number | null;
  memory_used_kb: number | null;
  compile_output: string | null;
  test_results: TestResult[] | null;
  created_at: string;
  judged_at: string | null;
}

export interface SubmissionListItem {
  id: number;
  user_id: number;
  username: string;
  problem_id: number;
  language: string;
  status: string;
  time_used_ms: number | null;
  memory_used_kb: number | null;
  created_at: string;
}

export interface SubmissionListResponse {
  total: number;
  items: SubmissionListItem[];
}

export interface RunResult {
  status: string;
  time_ms: number;
  memory_kb: number;
  stdout: string;
  stderr: string;
  detail: string;
  compile_output: string;
}

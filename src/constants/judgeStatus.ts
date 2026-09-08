export interface JudgeStatusInfo {
  label: string;
  color: string;
}

export const JUDGE_STATUS: Record<string, JudgeStatusInfo> = {
  Pending: { label: "等待判题", color: "gray" },
  Running: { label: "判题中", color: "blue" },
  Accepted: { label: "通过", color: "green" },
  Finished: { label: "运行完成", color: "green" },
  "Wrong Answer": { label: "答案错误", color: "red" },
  "Time Limit Exceeded": { label: "超出时间限制", color: "orange" },
  "Memory Limit Exceeded": { label: "超出内存限制", color: "orange" },
  "Runtime Error": { label: "运行时错误", color: "red" },
  "Compile Error": { label: "编译错误", color: "purple" },
  "System Error": { label: "系统错误", color: "gray" },
};

export const JUDGE_STATUS_DESCRIPTION: Record<string, string> = {
  "Time Limit Exceeded": "程序运行超过题目限定的时间，可能存在死循环或算法复杂度太高。",
  "Memory Limit Exceeded": "程序占用的内存超过题目限定的大小。",
  "Runtime Error": "程序运行时发生错误（如数组越界、空指针、除零），或进程被异常终止。",
  "Compile Error": "代码编译失败，请查看编译错误信息修正代码。",
  "System Error": "判题服务内部错误，请稍后重试。",
};

export const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "c", label: "C 17" },
  { value: "cpp", label: "C++ 17" },
  { value: "java", label: "Java 17" },
];

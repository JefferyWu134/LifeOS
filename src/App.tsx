import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  BarChart3,
  BedDouble,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Dumbbell,
  Flower2,
  HeartPulse,
  Home,
  Leaf,
  Moon,
  NotebookPen,
  PiggyBank,
  Plus,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Sprout,
  SunMedium,
  TimerReset,
  Trash2,
  Upload,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Status = "done" | "partial" | "lost" | "recovery" | "planned";
type Pillar = "training" | "nutrition" | "work" | "spending" | "stimulus" | "sleep";
type PageId =
  | "dashboard"
  | "calendar"
  | "checkin"
  | "nutrition"
  | "fitness"
  | "work"
  | "spending"
  | "stimulus"
  | "sleep"
  | "mood"
  | "stats"
  | "review"
  | "settings";

type DayPlanEntry = {
  pillar: Pillar;
  label: string;
  status: Status;
  note: string;
};

type DayPlan = {
  dayName: string;
  entries: DayPlanEntry[];
};

type DailyCheckin = {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  trainingDone: boolean;
  trainingType: string;
  trainingMinutes: number;
  rpe: number;
  dietScore: number;
  proteinHit: boolean;
  binge: boolean;
  workDone: boolean;
  deepWorkMinutes: number;
  impulseSpend: boolean;
  spendAmount: number;
  porn: boolean;
  masturbation: boolean;
  sleepAffected: boolean;
  energy: number;
  note: string;
};

type TrainingLog = {
  id: string;
  date: string;
  type: string;
  minutes: number;
  rpe: number;
  weight: number;
  state: string;
  warmedUp: boolean;
  stretched: boolean;
  note: string;
};

type WorkTask = {
  id: string;
  date: string;
  category: "收入任务" | "产品任务" | "成长任务";
  title: string;
  status: "active" | "done" | "deferred";
};

type SpendingRequest = {
  id: string;
  date: string;
  item: string;
  amount: number;
  category: SpendingCategory;
  reason: string;
  answers: SpendingAnswers;
  decision: SpendingDecision;
};

type SpendingCategory =
  | "必要消费"
  | "成长消费"
  | "情绪消费"
  | "面子消费"
  | "游戏消费"
  | "服装消费"
  | "健身消费"
  | "电子产品"
  | "社交消费";

type SpendingAnswers = {
  income: boolean;
  health: boolean;
  efficiency: boolean;
  stillWantAfter7Days: boolean;
  emotionDriven: boolean;
  budgetEnough: boolean;
};

type SpendingDecision = "可以买" | "延迟24小时" | "延迟7天" | "不建议买";

type StimulusLog = {
  id: string;
  date: string;
  porn: boolean;
  masturbation: boolean;
  time: string;
  beforeSleep: boolean;
  afterTraining: boolean;
  sleepAffected: boolean;
  nextDayAffected: boolean;
  trigger: string;
  note: string;
};

type SleepLog = {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  hours: number;
  quality: number;
  wokeAtNight: boolean;
  phoneBeforeBed: boolean;
  lateCoffee: boolean;
  lateTraining: boolean;
  stimulusAffected: boolean;
};

type MoodLog = {
  id: string;
  date: string;
  mood: number;
  stress: number;
  anxiety: number;
  impulse: number;
  energy: number;
  avoidance: string;
  bestThing: string;
};

type SettingsState = {
  weight: number;
  proteinMin: number;
  proteinMax: number;
  sleepTarget: number;
  cool24Threshold: number;
  cool7Threshold: number;
  trainingTemplate: string[];
  nutritionTemplates: Record<string, string[]>;
};

type WeeklyReviewNote = {
  biggestProblem: string;
  nextFocus: string;
};

type AppData = {
  settings: SettingsState;
  weekPlan: DayPlan[];
  checkins: Record<string, DailyCheckin>;
  trainingLogs: TrainingLog[];
  workTasks: WorkTask[];
  spendingRequests: SpendingRequest[];
  stimulusLogs: StimulusLog[];
  sleepLogs: SleepLog[];
  moodLogs: MoodLog[];
  outputs: Record<string, string>;
  weeklyReviewNotes: Record<string, WeeklyReviewNote>;
};

const storageKey = "life-garden-os:v1";

const pillars: { key: Pillar; label: string; short: string }[] = [
  { key: "training", label: "训练", short: "训" },
  { key: "nutrition", label: "饮食", short: "食" },
  { key: "work", label: "学习/创业", short: "创" },
  { key: "spending", label: "消费", short: "财" },
  { key: "stimulus", label: "刺激管理", short: "清" },
  { key: "sleep", label: "睡眠", short: "眠" },
];

const statusMeta: Record<Status, { label: string; dot: string; cell: string; badge: string }> = {
  done: {
    label: "完成",
    dot: "bg-leaf-500",
    cell: "bg-leaf-50 border-leaf-200",
    badge: "bg-leaf-100 text-leaf-800",
  },
  partial: {
    label: "部分完成",
    dot: "bg-amber-400",
    cell: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-800",
  },
  lost: {
    label: "失控",
    dot: "bg-rose-500",
    cell: "bg-rose-50 border-rose-200",
    badge: "bg-rose-100 text-rose-800",
  },
  recovery: {
    label: "恢复日",
    dot: "bg-stone-400",
    cell: "bg-stone-100 border-stone-200",
    badge: "bg-stone-200 text-stone-700",
  },
  planned: {
    label: "计划中",
    dot: "bg-sky-500",
    cell: "bg-sky-50 border-sky-200",
    badge: "bg-sky-100 text-sky-800",
  },
};

const navItems: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "今日花园", icon: Home },
  { id: "calendar", label: "一周日历", icon: CalendarDays },
  { id: "checkin", label: "每日打卡", icon: CheckCircle2 },
  { id: "nutrition", label: "饮食", icon: Apple },
  { id: "fitness", label: "健身", icon: Dumbbell },
  { id: "work", label: "学习创业", icon: BriefcaseBusiness },
  { id: "spending", label: "消费冷静", icon: PiggyBank },
  { id: "stimulus", label: "清醒模式", icon: ShieldCheck },
  { id: "sleep", label: "睡眠", icon: BedDouble },
  { id: "mood", label: "情绪日记", icon: HeartPulse },
  { id: "stats", label: "数据统计", icon: BarChart3 },
  { id: "review", label: "周复盘", icon: NotebookPen },
  { id: "settings", label: "设置", icon: Settings },
];

const spendingCategories: SpendingCategory[] = [
  "必要消费",
  "成长消费",
  "情绪消费",
  "面子消费",
  "游戏消费",
  "服装消费",
  "健身消费",
  "电子产品",
  "社交消费",
];

const triggerOptions = ["压力", "无聊", "焦虑", "熬夜", "习惯", "奖励自己", "刷短视频", "独处太久"];

const todayISO = () => toISODate(new Date());

function toISODate(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mondayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

function getWeekKey(date = new Date()) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - mondayIndex(date));
  return toISODate(monday);
}

function getLastDates(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - index - 1));
    return toISODate(date);
  });
}

function defaultCheckin(date: string): DailyCheckin {
  return {
    date,
    sleepHours: 7,
    sleepQuality: 3,
    trainingDone: false,
    trainingType: "",
    trainingMinutes: 0,
    rpe: 5,
    dietScore: 3,
    proteinHit: false,
    binge: false,
    workDone: false,
    deepWorkMinutes: 0,
    impulseSpend: false,
    spendAmount: 0,
    porn: false,
    masturbation: false,
    sleepAffected: false,
    energy: 3,
    note: "",
  };
}

const defaultWeekPlan: DayPlan[] = [
  {
    dayName: "周一",
    entries: [
      { pillar: "training", label: "HYROX技术 + 上肢力量", status: "planned", note: "" },
      { pillar: "nutrition", label: "高蛋白", status: "planned", note: "" },
      { pillar: "work", label: "产品开发", status: "planned", note: "" },
      { pillar: "spending", label: "不大额消费", status: "planned", note: "" },
      { pillar: "stimulus", label: "睡前无刺激", status: "planned", note: "" },
      { pillar: "sleep", label: "23:30睡", status: "planned", note: "" },
    ],
  },
  {
    dayName: "周二",
    entries: [
      { pillar: "training", label: "下肢力量 + Zone2", status: "planned", note: "" },
      { pillar: "nutrition", label: "正常外食", status: "planned", note: "" },
      { pillar: "work", label: "客户跟进", status: "planned", note: "" },
      { pillar: "spending", label: "预算内消费", status: "planned", note: "" },
      { pillar: "stimulus", label: "手机离床", status: "planned", note: "" },
      { pillar: "sleep", label: "23:30睡", status: "planned", note: "" },
    ],
  },
  {
    dayName: "周三",
    entries: [
      { pillar: "training", label: "HYROX专项间歇", status: "planned", note: "" },
      { pillar: "nutrition", label: "训练前加碳水", status: "planned", note: "" },
      { pillar: "work", label: "内容输出", status: "planned", note: "" },
      { pillar: "spending", label: "不下单", status: "planned", note: "" },
      { pillar: "stimulus", label: "控制短视频", status: "planned", note: "" },
      { pillar: "sleep", label: "23:30睡", status: "planned", note: "" },
    ],
  },
  {
    dayName: "周四",
    entries: [
      { pillar: "training", label: "恢复日：快走、拉伸、灵活性", status: "recovery", note: "" },
      { pillar: "nutrition", label: "稳定外食", status: "planned", note: "" },
      { pillar: "work", label: "学习AI", status: "planned", note: "" },
      { pillar: "spending", label: "财务复盘", status: "planned", note: "" },
      { pillar: "stimulus", label: "低刺激流程", status: "planned", note: "" },
      { pillar: "sleep", label: "23:00睡", status: "planned", note: "" },
    ],
  },
  {
    dayName: "周五",
    entries: [
      { pillar: "training", label: "上肢力量 + 跑步间歇", status: "planned", note: "" },
      { pillar: "nutrition", label: "高蛋白", status: "planned", note: "" },
      { pillar: "work", label: "销售推进", status: "planned", note: "" },
      { pillar: "spending", label: "不冲动买", status: "planned", note: "" },
      { pillar: "stimulus", label: "睡前离线", status: "planned", note: "" },
      { pillar: "sleep", label: "23:30睡", status: "planned", note: "" },
    ],
  },
  {
    dayName: "周六",
    entries: [
      { pillar: "training", label: "HYROX长训练", status: "planned", note: "" },
      { pillar: "nutrition", label: "允许一餐自由", status: "planned", note: "" },
      { pillar: "work", label: "周总结", status: "planned", note: "" },
      { pillar: "spending", label: "控制娱乐消费", status: "planned", note: "" },
      { pillar: "stimulus", label: "不报复放纵", status: "planned", note: "" },
      { pillar: "sleep", label: "00:00前睡", status: "planned", note: "" },
    ],
  },
  {
    dayName: "周日",
    entries: [
      { pillar: "training", label: "休息或低强度活动", status: "recovery", note: "" },
      { pillar: "nutrition", label: "正常吃", status: "planned", note: "" },
      { pillar: "work", label: "下周计划", status: "planned", note: "" },
      { pillar: "spending", label: "预算整理", status: "planned", note: "" },
      { pillar: "stimulus", label: "早点睡", status: "planned", note: "" },
      { pillar: "sleep", label: "23:00睡", status: "planned", note: "" },
    ],
  },
];

const defaultNutritionTemplates: Record<string, string[]> = {
  早餐: ["星巴克高蛋白拿铁 + 贝果 + 香蕉", "便利店饭团2个 + 茶叶蛋2个 + 无糖酸奶", "黑咖啡 + 鸡蛋 + 饭团"],
  训练后: ["蛋白粉1-2勺 + 肌酸", "牛肉饭", "鸡腿饭", "拉面加牛肉加蛋"],
  午餐: ["牛肉饭双肉", "鸡腿饭加蛋", "兰州拉面加牛肉加蛋", "肠粉加瘦肉加鸡蛋", "轻食碗双蛋白", "赛百味双肉少酱"],
  晚餐: ["南城香鸡腿饭", "吉野家双拼饭", "赛百味双肉", "饺子20个以内", "面加肉加蛋", "拉面少喝汤"],
  睡前: ["450ml牛奶", "无糖酸奶", "不吃直接睡"],
};

const defaultData: AppData = {
  settings: {
    weight: 75,
    proteinMin: 130,
    proteinMax: 160,
    sleepTarget: 7.5,
    cool24Threshold: 500,
    cool7Threshold: 3000,
    trainingTemplate: defaultWeekPlan.map((day) => day.entries.find((entry) => entry.pillar === "training")?.label ?? ""),
    nutritionTemplates: defaultNutritionTemplates,
  },
  weekPlan: defaultWeekPlan,
  checkins: {},
  trainingLogs: [],
  workTasks: [],
  spendingRequests: [],
  stimulusLogs: [],
  sleepLogs: [],
  moodLogs: [],
  outputs: {},
  weeklyReviewNotes: {},
};

function cloneDefaultData(): AppData {
  return JSON.parse(JSON.stringify(defaultData)) as AppData;
}

function normalizeData(raw: Partial<AppData> | null): AppData {
  const base = cloneDefaultData();
  if (!raw) {
    return base;
  }
  return {
    ...base,
    ...raw,
    settings: {
      ...base.settings,
      ...(raw.settings ?? {}),
      nutritionTemplates: {
        ...base.settings.nutritionTemplates,
        ...(raw.settings?.nutritionTemplates ?? {}),
      },
      trainingTemplate: raw.settings?.trainingTemplate?.length ? raw.settings.trainingTemplate : base.settings.trainingTemplate,
    },
    weekPlan: raw.weekPlan?.length === 7 ? raw.weekPlan : base.weekPlan,
    checkins: raw.checkins ?? {},
    trainingLogs: raw.trainingLogs ?? [],
    workTasks: raw.workTasks ?? [],
    spendingRequests: raw.spendingRequests ?? [],
    stimulusLogs: raw.stimulusLogs ?? [],
    sleepLogs: raw.sleepLogs ?? [],
    moodLogs: raw.moodLogs ?? [],
    outputs: raw.outputs ?? {},
    weeklyReviewNotes: raw.weeklyReviewNotes ?? {},
  };
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(storageKey);
    return normalizeData(raw ? (JSON.parse(raw) as Partial<AppData>) : null);
  } catch {
    return cloneDefaultData();
  }
}

function calculateScore(checkin: DailyCheckin, settings: SettingsState) {
  const sleep = checkin.sleepHours >= settings.sleepTarget ? 18 : checkin.sleepHours >= 6 ? 13 : 7;
  const sleepQuality = checkin.sleepQuality * 2;
  const training = checkin.trainingDone ? 14 : 0;
  const nutrition = checkin.dietScore * 4 + (checkin.proteinHit ? 4 : 0) - (checkin.binge ? 8 : 0);
  const work = (checkin.workDone ? 12 : 0) + clamp(Math.round(checkin.deepWorkMinutes / 20), 0, 8);
  const spending = checkin.impulseSpend ? -6 : 9;
  const stimulus = checkin.porn || checkin.masturbation ? 2 : 9;
  const sleepGuard = checkin.sleepAffected ? -8 : 4;
  const energy = checkin.energy * 2;
  return clamp(Math.round(sleep + sleepQuality + training + nutrition + work + spending + stimulus + sleepGuard + energy), 0, 100);
}

function evaluateSpending(
  item: string,
  amount: number,
  category: SpendingCategory,
  answers: SpendingAnswers,
  settings: SettingsState
): SpendingDecision {
  const normalizedItem = item.trim().toLowerCase();
  if (amount >= settings.cool7Threshold || category === "游戏消费" || normalizedItem.includes("游戏账号") || normalizedItem.includes("奢侈")) {
    return "延迟7天";
  }
  if (amount >= settings.cool24Threshold || category === "情绪消费" || answers.emotionDriven) {
    return "延迟24小时";
  }
  if (!answers.budgetEnough) {
    return "不建议买";
  }
  if ((category === "必要消费" || category === "成长消费" || category === "健身消费") && (answers.income || answers.health || answers.efficiency)) {
    return "可以买";
  }
  if (!answers.stillWantAfter7Days) {
    return "延迟7天";
  }
  return answers.income || answers.health || answers.efficiency ? "可以买" : "不建议买";
}

function getDecisionStyle(decision: SpendingDecision) {
  if (decision === "可以买") return "border-leaf-200 bg-leaf-50 text-leaf-800";
  if (decision === "延迟24小时") return "border-amber-200 bg-amber-50 text-amber-800";
  if (decision === "延迟7天") return "border-sky-200 bg-sky-50 text-sky-800";
  return "border-rose-200 bg-rose-50 text-rose-800";
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function findEntry(day: DayPlan, pillar: Pillar) {
  return day.entries.find((entry) => entry.pillar === pillar);
}

function getCompletionRate(entries: DayPlanEntry[]) {
  if (!entries.length) return 0;
  const points = entries.reduce((sum, entry) => {
    if (entry.status === "done" || entry.status === "recovery") return sum + 1;
    if (entry.status === "partial") return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((points / entries.length) * 100);
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-lg border border-white/70 bg-white/78 p-4 shadow-soft backdrop-blur ${className}`}>{children}</section>;
}

function SectionTitle({
  icon: Icon,
  title,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-leaf-600" /> : null}
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium text-stone-700 ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function inputClass(extra = "") {
  return `min-h-10 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm transition focus:border-water focus:ring-2 focus:ring-water/20 ${extra}`;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
        checked ? "border-leaf-300 bg-leaf-50 text-leaf-900" : "border-stone-200 bg-white text-stone-700"
      }`}
    >
      <span>{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition ${checked ? "bg-leaf-500" : "bg-stone-300"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function StatPill({ label, value, icon: Icon }: { label: string; value: string | number; icon?: LucideIcon }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/70 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        {Icon ? <Icon className="h-4 w-4 text-leaf-600" /> : null}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-stone-950">{value}</div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="grid h-28 w-28 place-items-center rounded-full"
      style={{
        background: `conic-gradient(#3f9850 ${score * 3.6}deg, rgba(221, 226, 216, 0.86) 0deg)`,
      }}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-inner">
        <div className="text-center">
          <div className="text-3xl font-bold text-stone-950">{score}</div>
          <div className="text-xs font-semibold text-stone-500">状态分</div>
        </div>
      </div>
    </div>
  );
}

function GardenScene({ checkin, score }: { checkin: DailyCheckin; score: number }) {
  const sunlight = checkin.sleepHours >= 7 && checkin.sleepQuality >= 4;
  const soil = checkin.dietScore >= 4 && !checkin.binge;
  const trained = checkin.trainingDone;
  const worked = checkin.workDone || checkin.deepWorkMinutes >= 60;
  const wealth = !checkin.impulseSpend;
  const stars = !checkin.sleepAffected && !checkin.porn;
  const plantHeight = 54 + Math.round(score * 0.52) + (trained ? 12 : 0);
  const leaves = 3 + (worked ? 3 : 0) + (checkin.proteinHit ? 1 : 0);

  return (
    <div className="garden-scene" aria-label="今日花园状态">
      <div className={`garden-sun ${sunlight ? "sun-bright" : ""}`} />
      <div className="garden-cloud cloud-one" />
      <div className="garden-cloud cloud-two" />
      <div className={`garden-stars ${stars ? "stars-clear" : ""}`}>
        <span />
        <span />
        <span />
      </div>
      <div className="wealth-bed">
        <div className={wealth ? "coin coin-good" : "coin"} />
        <div className={wealth ? "coin coin-good" : "coin"} />
      </div>
      <div className={`garden-soil ${soil ? "soil-healthy" : ""}`} />
      <div className="plant" style={{ height: `${plantHeight}px` }}>
        <div className="stem" />
        {Array.from({ length: leaves }).map((_, index) => (
          <span
            key={index}
            className={`leaf leaf-${index % 6}`}
            style={{ bottom: `${22 + index * 12}px` }}
          />
        ))}
        <div className="flower-head">
          <span />
          <span />
          <span />
          <span />
          <i />
        </div>
      </div>
      <div className="garden-ground-lines">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function MiniStatus({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "bad" | "calm" }) {
  const toneClass = {
    good: "bg-leaf-100 text-leaf-800",
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-rose-100 text-rose-800",
    calm: "bg-sky-100 text-sky-800",
  }[tone];
  return (
    <div className="rounded-lg border border-white/70 bg-white/62 p-3">
      <div className="text-xs font-semibold text-stone-500">{label}</div>
      <div className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [page, setPage] = useState<PageId>("dashboard");
  const today = todayISO();
  const todayIndex = mondayIndex();
  const todayCheckin = data.checkins[today] ?? defaultCheckin(today);
  const todayPlan = data.weekPlan[todayIndex] ?? data.weekPlan[0];
  const score = calculateScore(todayCheckin, data.settings);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  function updateCheckin(date: string, patch: Partial<DailyCheckin>) {
    setData((current) => ({
      ...current,
      checkins: {
        ...current.checkins,
        [date]: {
          ...(current.checkins[date] ?? defaultCheckin(date)),
          ...patch,
        },
      },
    }));
  }

  function updateSettings(patch: Partial<SettingsState>) {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...patch,
      },
    }));
  }

  function updateWeekEntry(dayIndexToUpdate: number, pillar: Pillar, patch: Partial<DayPlanEntry>) {
    setData((current) => ({
      ...current,
      weekPlan: current.weekPlan.map((day, index) =>
        index === dayIndexToUpdate
          ? {
              ...day,
              entries: day.entries.map((entry) => (entry.pillar === pillar ? { ...entry, ...patch } : entry)),
            }
          : day
      ),
    }));
  }

  const pageTitle = navItems.find((item) => item.id === page)?.label ?? "Life Garden OS";

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1500px] gap-5 px-3 py-4 sm:px-5 lg:px-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-lg border border-white/70 bg-white/72 p-4 shadow-garden backdrop-blur lg:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-leaf-600 text-white shadow-soft">
              <Flower2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-950">Life Garden OS</h1>
              <p className="text-xs font-medium text-stone-500">生活花园式自律系统</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPage(item.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-leaf-600 text-white shadow-soft" : "text-stone-650 hover:bg-leaf-50 hover:text-leaf-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-4 rounded-lg border border-white/70 bg-white/72 p-3 shadow-soft backdrop-blur lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-leaf-600 text-white">
                  <Flower2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-stone-950">Life Garden OS</h1>
                  <p className="text-xs font-medium text-stone-500">{pageTitle}</p>
                </div>
              </div>
              <div className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold text-leaf-800">{score}</div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPage(item.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                      page === item.id ? "border-leaf-600 bg-leaf-600 text-white" : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </header>

          {page === "dashboard" && (
            <Dashboard
              data={data}
              today={today}
              todayPlan={todayPlan}
              todayCheckin={todayCheckin}
              score={score}
              updateCheckin={updateCheckin}
              updateWeekEntry={updateWeekEntry}
            />
          )}
          {page === "calendar" && <WeeklyCalendar data={data} updateWeekEntry={updateWeekEntry} />}
          {page === "checkin" && <DailyCheckinPage checkin={todayCheckin} updateCheckin={(patch) => updateCheckin(today, patch)} />}
          {page === "nutrition" && <NutritionPage data={data} updateCheckin={(patch) => updateCheckin(today, patch)} updateSettings={updateSettings} />}
          {page === "fitness" && <FitnessPage data={data} setData={setData} updateCheckin={(patch) => updateCheckin(today, patch)} />}
          {page === "work" && <WorkPage data={data} setData={setData} updateCheckin={(patch) => updateCheckin(today, patch)} />}
          {page === "spending" && <SpendingPage data={data} setData={setData} updateCheckin={(patch) => updateCheckin(today, patch)} />}
          {page === "stimulus" && <StimulusPage data={data} setData={setData} updateCheckin={(patch) => updateCheckin(today, patch)} />}
          {page === "sleep" && <SleepPage data={data} setData={setData} updateCheckin={(patch) => updateCheckin(today, patch)} />}
          {page === "mood" && <MoodPage data={data} setData={setData} />}
          {page === "stats" && <StatsPage data={data} />}
          {page === "review" && <ReviewPage data={data} setData={setData} />}
          {page === "settings" && <SettingsPage data={data} setData={setData} updateSettings={updateSettings} />}
        </main>
      </div>
    </div>
  );
}

function Dashboard({
  data,
  today,
  todayPlan,
  todayCheckin,
  score,
  updateCheckin,
  updateWeekEntry,
}: {
  data: AppData;
  today: string;
  todayPlan: DayPlan;
  todayCheckin: DailyCheckin;
  score: number;
  updateCheckin: (date: string, patch: Partial<DailyCheckin>) => void;
  updateWeekEntry: (dayIndexToUpdate: number, pillar: Pillar, patch: Partial<DayPlanEntry>) => void;
}) {
  const risks = getTodayRisks(todayCheckin, data);
  const bodyTask = findEntry(todayPlan, "training")?.label ?? "身体任务";
  const workTask = findEntry(todayPlan, "work")?.label ?? "学习/创业任务";
  const controlTask = findEntry(todayPlan, "stimulus")?.label ?? "控制任务";

  function backOnTrack() {
    updateCheckin(today, {
      energy: Math.max(todayCheckin.energy, 3),
      impulseSpend: false,
      porn: false,
      masturbation: false,
      sleepAffected: false,
      binge: false,
      note: `${todayCheckin.note ? `${todayCheckin.note}\n` : ""}已启动回到正轨流程：喝水、走10分钟、整理下一步、手机离床。`,
    });
    const dayIndex = mondayIndex();
    updateWeekEntry(dayIndex, "spending", { status: "planned" });
    updateWeekEntry(dayIndex, "stimulus", { status: "planned" });
    updateWeekEntry(dayIndex, "sleep", { status: "planned" });
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-[1fr_310px]">
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold text-leaf-800">
                    <Sprout className="h-4 w-4" />
                    今日花园
                  </div>
                  <h2 className="text-2xl font-bold text-stone-950 sm:text-3xl">把真实生活养成一座花园</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                    睡眠给阳光，饮食养土壤，训练让植物长高，学习创业长叶，消费冷静扩展财富区，清醒模式稳定夜空。
                  </p>
                </div>
                <ScoreRing score={score} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <MiniStatus
                  label="阳光"
                  value={todayCheckin.sleepHours >= data.settings.sleepTarget ? "充足" : todayCheckin.sleepHours < 6 ? "偏弱" : "柔和"}
                  tone={todayCheckin.sleepHours >= data.settings.sleepTarget ? "good" : todayCheckin.sleepHours < 6 ? "bad" : "warn"}
                />
                <MiniStatus
                  label="土壤"
                  value={todayCheckin.dietScore >= 4 && !todayCheckin.binge ? "健康" : todayCheckin.binge ? "需修复" : "稳定中"}
                  tone={todayCheckin.dietScore >= 4 && !todayCheckin.binge ? "good" : todayCheckin.binge ? "bad" : "warn"}
                />
                <MiniStatus
                  label="植物"
                  value={todayCheckin.trainingDone ? "长高" : "等待浇灌"}
                  tone={todayCheckin.trainingDone ? "good" : "calm"}
                />
                <MiniStatus
                  label="叶片"
                  value={todayCheckin.workDone ? "展开" : "待生长"}
                  tone={todayCheckin.workDone ? "good" : "calm"}
                />
                <MiniStatus
                  label="财富区"
                  value={todayCheckin.impulseSpend ? "有波动" : "稳步成长"}
                  tone={todayCheckin.impulseSpend ? "bad" : "good"}
                />
                <MiniStatus
                  label="夜空"
                  value={todayCheckin.sleepAffected || todayCheckin.porn ? "有扰动" : "稳定"}
                  tone={todayCheckin.sleepAffected || todayCheckin.porn ? "bad" : "good"}
                />
              </div>
            </div>
            <div className="min-h-[320px] border-t border-white/70 bg-gradient-to-br from-sky-100 via-leaf-50 to-amber-50 p-4 md:border-l md:border-t-0">
              <GardenScene checkin={todayCheckin} score={score} />
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Zap} title="今日成长能量" />
          <div className="grid grid-cols-2 gap-3">
            <StatPill label="成长能量" value={`${Math.round(score / 10) + todayCheckin.energy}`} icon={Sparkles} />
            <StatPill label="深度工作" value={`${todayCheckin.deepWorkMinutes}m`} icon={Clock3} />
            <StatPill label="训练时长" value={`${todayCheckin.trainingMinutes}m`} icon={Dumbbell} />
            <StatPill label="睡眠" value={`${todayCheckin.sleepHours}h`} icon={Moon} />
          </div>
          <button
            type="button"
            onClick={backOnTrack}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-stone-800"
          >
            <RotateCcw className="h-4 w-4" />
            一键回到正轨
          </button>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <SectionTitle icon={CheckCircle2} title="今日三件事" />
          <div className="grid gap-3 md:grid-cols-3">
            <TaskFocus icon={Dumbbell} label="身体任务" value={bodyTask} tone="leaf" />
            <TaskFocus icon={BriefcaseBusiness} label="学习/创业任务" value={workTask} tone="sky" />
            <TaskFocus icon={ShieldCheck} label="控制任务" value={controlTask} tone="amber" />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Activity} title="今日风险提醒" />
          <div className="grid gap-2">
            {risks.length ? (
              risks.map((risk) => (
                <div key={risk} className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{risk}</span>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-leaf-200 bg-leaf-50 px-3 py-3 text-sm font-semibold text-leaf-800">今天状态稳定，保持节奏。</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function TaskFocus({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "leaf" | "sky" | "amber" }) {
  const toneClass = {
    leaf: "bg-leaf-100 text-leaf-800",
    sky: "bg-sky-100 text-sky-800",
    amber: "bg-amber-100 text-amber-800",
  }[tone];
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-xs font-bold text-stone-500">{label}</div>
      <div className="mt-1 min-h-12 text-base font-semibold leading-6 text-stone-950">{value}</div>
    </div>
  );
}

function getTodayRisks(checkin: DailyCheckin, data: AppData) {
  const risks: string[] = [];
  if (checkin.sleepHours < 6) risks.push("睡眠少于6小时，今天训练强度建议下调。");
  if (checkin.rpe >= 9) risks.push("RPE偏高，留意疲劳堆积和恢复窗口。");
  if (checkin.binge) risks.push("饮食出现失控，不做补偿性节食，下一餐恢复正常。");
  if (checkin.impulseSpend) risks.push("出现冲动消费，暂停下单并进入冷静流程。");
  if (checkin.sleepAffected || checkin.porn) risks.push("夜间刺激影响风险升高，优先执行低刺激晚间流程。");
  if (!checkin.workDone && checkin.deepWorkMinutes === 0) risks.push("学习/创业还没有推进，先做一个25分钟番茄钟。");
  const last3 = getLastDates(3).map((date) => data.checkins[date]).filter(Boolean);
  if (last3.length >= 3 && last3.every((item) => item.rpe >= 8 || item.trainingMinutes >= 75)) {
    risks.push("连续3天高强度，明天建议安排恢复或低强度。");
  }
  return risks;
}

function WeeklyCalendar({ data, updateWeekEntry }: { data: AppData; updateWeekEntry: (dayIndexToUpdate: number, pillar: Pillar, patch: Partial<DayPlanEntry>) => void }) {
  return (
    <Card>
      <SectionTitle icon={CalendarDays} title="一周日历" />
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(statusMeta) as Status[]).map((status) => (
          <span key={status} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusMeta[status].badge}`}>
            <span className={`h-2 w-2 rounded-full ${statusMeta[status].dot}`} />
            {statusMeta[status].label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="w-24 px-2 py-2 text-left text-xs font-bold text-stone-500">项目</th>
              {data.weekPlan.map((day) => (
                <th key={day.dayName} className="px-2 py-2 text-left text-sm font-bold text-stone-900">
                  {day.dayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pillars.map((pillar) => (
              <tr key={pillar.key}>
                <td className="align-top">
                  <div className="rounded-md bg-stone-900 px-3 py-3 text-sm font-bold text-white">{pillar.label}</div>
                </td>
                {data.weekPlan.map((day, dayIndexToUpdate) => {
                  const entry = findEntry(day, pillar.key);
                  if (!entry) return <td key={day.dayName} />;
                  return (
                    <td key={`${day.dayName}-${pillar.key}`} className="align-top">
                      <div className={`min-h-[180px] rounded-lg border p-3 ${statusMeta[entry.status].cell}`}>
                        <textarea
                          value={entry.label}
                          onChange={(event) => updateWeekEntry(dayIndexToUpdate, pillar.key, { label: event.target.value })}
                          className={inputClass("min-h-16 w-full resize-none bg-white/85 text-xs leading-5")}
                        />
                        <select
                          value={entry.status}
                          onChange={(event) => updateWeekEntry(dayIndexToUpdate, pillar.key, { status: event.target.value as Status })}
                          className={inputClass("mt-2 w-full text-xs font-semibold")}
                        >
                          {(Object.keys(statusMeta) as Status[]).map((status) => (
                            <option key={status} value={status}>
                              {statusMeta[status].label}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={entry.note}
                          onChange={(event) => updateWeekEntry(dayIndexToUpdate, pillar.key, { note: event.target.value })}
                          placeholder="备注"
                          className={inputClass("mt-2 min-h-14 w-full resize-none bg-white/85 text-xs leading-5")}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DailyCheckinPage({ checkin, updateCheckin }: { checkin: DailyCheckin; updateCheckin: (patch: Partial<DailyCheckin>) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <SectionTitle icon={CheckCircle2} title="每日打卡" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="睡眠小时数">
            <input type="number" min={0} step={0.25} value={checkin.sleepHours} onChange={(event) => updateCheckin({ sleepHours: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="睡眠质量 1-5">
            <input type="range" min={1} max={5} value={checkin.sleepQuality} onChange={(event) => updateCheckin({ sleepQuality: Number(event.target.value) })} />
            <span className="text-xs font-bold text-leaf-700">{checkin.sleepQuality}</span>
          </Field>
          <Toggle checked={checkin.trainingDone} onChange={(value) => updateCheckin({ trainingDone: value })} label="完成训练" />
          <Field label="训练类型">
            <input value={checkin.trainingType} onChange={(event) => updateCheckin({ trainingType: event.target.value })} className={inputClass()} />
          </Field>
          <Field label="训练时长">
            <input type="number" min={0} value={checkin.trainingMinutes} onChange={(event) => updateCheckin({ trainingMinutes: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="RPE强度 1-10">
            <input type="range" min={1} max={10} value={checkin.rpe} onChange={(event) => updateCheckin({ rpe: Number(event.target.value) })} />
            <span className="text-xs font-bold text-leaf-700">{checkin.rpe}</span>
          </Field>
          <Field label="饮食评分 1-5">
            <input type="range" min={1} max={5} value={checkin.dietScore} onChange={(event) => updateCheckin({ dietScore: Number(event.target.value) })} />
            <span className="text-xs font-bold text-leaf-700">{checkin.dietScore}</span>
          </Field>
          <Toggle checked={checkin.proteinHit} onChange={(value) => updateCheckin({ proteinHit: value })} label="蛋白达标" />
          <Toggle checked={checkin.binge} onChange={(value) => updateCheckin({ binge: value })} label="暴食" />
          <Toggle checked={checkin.workDone} onChange={(value) => updateCheckin({ workDone: value })} label="完成学习/创业任务" />
          <Field label="深度工作分钟数">
            <input type="number" min={0} value={checkin.deepWorkMinutes} onChange={(event) => updateCheckin({ deepWorkMinutes: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Toggle checked={checkin.impulseSpend} onChange={(value) => updateCheckin({ impulseSpend: value })} label="冲动消费" />
          <Field label="消费金额">
            <input type="number" min={0} value={checkin.spendAmount} onChange={(event) => updateCheckin({ spendAmount: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Toggle checked={checkin.porn} onChange={(value) => updateCheckin({ porn: value })} label="看色情内容" />
          <Toggle checked={checkin.masturbation} onChange={(value) => updateCheckin({ masturbation: value })} label="自慰" />
          <Toggle checked={checkin.sleepAffected} onChange={(value) => updateCheckin({ sleepAffected: value })} label="影响睡眠" />
          <Field label="今日精力 1-5">
            <input type="range" min={1} max={5} value={checkin.energy} onChange={(event) => updateCheckin({ energy: Number(event.target.value) })} />
            <span className="text-xs font-bold text-leaf-700">{checkin.energy}</span>
          </Field>
        </div>
        <Field label="备注" className="mt-4">
          <textarea value={checkin.note} onChange={(event) => updateCheckin({ note: event.target.value })} className={inputClass("min-h-28 resize-y")} />
        </Field>
      </Card>
      <Card>
        <SectionTitle icon={Flower2} title="打卡即时反馈" />
        <GardenScene checkin={checkin} score={calculateScore(checkin, defaultData.settings)} />
      </Card>
    </div>
  );
}

function NutritionPage({
  data,
  updateCheckin,
  updateSettings,
}: {
  data: AppData;
  updateCheckin: (patch: Partial<DailyCheckin>) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <SectionTitle icon={Apple} title="饮食规则" />
        <div className="grid gap-3">
          <RuleLine title="每日蛋白" value={`${data.settings.proteinMin}-${data.settings.proteinMax}g`} />
          <RuleLine title="蛋白粉" value="最多2勺" />
          <RuleLine title="肌酸" value="3-5g" />
          <RuleLine title="训练日碳水" value="不能太低" />
          <RuleLine title="吃多以后" value="不补偿性节食，下一餐恢复正常" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => updateCheckin({ dietScore: 5, proteinHit: true, binge: false })} className="rounded-md bg-leaf-600 px-4 py-3 text-sm font-bold text-white">
            标记饮食稳定
          </button>
          <button type="button" onClick={() => updateCheckin({ dietScore: 3, binge: false })} className="rounded-md border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-800">
            下一餐恢复正常
          </button>
        </div>
      </Card>
      <Card>
        <SectionTitle icon={BookOpen} title="外食模板" />
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(data.settings.nutritionTemplates).map(([meal, items]) => (
            <div key={meal} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="mb-3 text-sm font-bold text-stone-950">{meal}</div>
              <div className="grid gap-2">
                {items.map((item) => (
                  <div key={item} className="rounded-md bg-stone-50 px-3 py-2 text-sm leading-5 text-stone-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-leaf-200 bg-leaf-50 p-4">
          <div className="mb-3 text-sm font-bold text-leaf-900">目标参数</div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="体重 kg">
              <input type="number" min={0} value={data.settings.weight} onChange={(event) => updateSettings({ weight: Number(event.target.value) })} className={inputClass()} />
            </Field>
            <Field label="蛋白下限 g">
              <input type="number" min={0} value={data.settings.proteinMin} onChange={(event) => updateSettings({ proteinMin: Number(event.target.value) })} className={inputClass()} />
            </Field>
            <Field label="蛋白上限 g">
              <input type="number" min={0} value={data.settings.proteinMax} onChange={(event) => updateSettings({ proteinMax: Number(event.target.value) })} className={inputClass()} />
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
}

function RuleLine({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-stone-200 bg-white px-3 py-3">
      <span className="text-sm font-bold text-stone-700">{title}</span>
      <span className="text-right text-sm font-semibold text-stone-950">{value}</span>
    </div>
  );
}

function FitnessPage({
  data,
  setData,
  updateCheckin,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  updateCheckin: (patch: Partial<DailyCheckin>) => void;
}) {
  const [form, setForm] = useState<TrainingLog>({
    id: "",
    date: todayISO(),
    type: "",
    minutes: 60,
    rpe: 7,
    weight: data.settings.weight,
    state: "正常",
    warmedUp: true,
    stretched: false,
    note: "",
  });
  const reminders = getTrainingReminders(data);

  function addLog() {
    const log = { ...form, id: createId("training") };
    setData((current) => ({ ...current, trainingLogs: [log, ...current.trainingLogs] }));
    updateCheckin({
      trainingDone: true,
      trainingType: form.type,
      trainingMinutes: form.minutes,
      rpe: form.rpe,
    });
    setForm((current) => ({ ...current, type: "", note: "" }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <SectionTitle icon={Dumbbell} title="训练记录" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="日期">
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass()} />
          </Field>
          <Field label="训练类型">
            <input value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className={inputClass()} />
          </Field>
          <Field label="训练时长">
            <input type="number" min={0} value={form.minutes} onChange={(event) => setForm({ ...form, minutes: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="RPE">
            <input type="range" min={1} max={10} value={form.rpe} onChange={(event) => setForm({ ...form, rpe: Number(event.target.value) })} />
            <span className="text-xs font-bold text-leaf-700">{form.rpe}</span>
          </Field>
          <Field label="今日体重">
            <input type="number" min={0} step={0.1} value={form.weight} onChange={(event) => setForm({ ...form, weight: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="今日状态">
            <input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className={inputClass()} />
          </Field>
          <Toggle checked={form.warmedUp} onChange={(value) => setForm({ ...form, warmedUp: value })} label="已热身" />
          <Toggle checked={form.stretched} onChange={(value) => setForm({ ...form, stretched: value })} label="已拉伸" />
        </div>
        <Field label="备注" className="mt-3">
          <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className={inputClass("min-h-24 resize-y")} />
        </Field>
        <button type="button" onClick={addLog} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 py-3 text-sm font-bold text-white">
          <Plus className="h-4 w-4" />
          添加训练
        </button>
      </Card>
      <div className="grid gap-4">
        <Card>
          <SectionTitle icon={CalendarDays} title="默认一周训练" />
          <div className="grid gap-2">
            {data.settings.trainingTemplate.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-md border border-stone-200 bg-white px-3 py-3">
                <span className="w-12 shrink-0 text-sm font-bold text-leaf-700">{defaultWeekPlan[index]?.dayName}</span>
                <span className="text-sm font-semibold text-stone-800">{item}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Activity} title="自动提醒" />
          <div className="grid gap-2">
            {reminders.map((item) => (
              <div key={item} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-semibold text-amber-900">
                {item}
              </div>
            ))}
            {!reminders.length && <div className="rounded-md border border-leaf-200 bg-leaf-50 px-3 py-3 text-sm font-semibold text-leaf-800">训练负荷稳定。</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getTrainingReminders(data: AppData) {
  const reminders: string[] = [];
  const last3 = getLastDates(3).map((date) => data.checkins[date]).filter(Boolean);
  if (last3.length >= 3 && last3.every((item) => item.rpe >= 8 || item.trainingMinutes >= 75)) {
    reminders.push("连续3天高强度，建议安排恢复。");
  }
  const today = data.checkins[todayISO()];
  if (today?.sleepHours && today.sleepHours < 6) {
    reminders.push("睡眠少于6小时，今天降低训练强度。");
  }
  const lastRpe = getLastDates(4).map((date) => data.checkins[date]).filter(Boolean);
  if (lastRpe.filter((item) => item.rpe >= 8).length >= 3) {
    reminders.push("RPE连续过高，减少训练量。");
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayLog = data.trainingLogs.find((log) => log.date === toISODate(yesterday));
  if (yesterdayLog && (yesterdayLog.minutes >= 90 || yesterdayLog.type.includes("长训练"))) {
    reminders.push("长训练后第二天不安排腿部大重量。");
  }
  if (data.weekPlan[mondayIndex()]?.entries.find((entry) => entry.pillar === "training")?.status === "recovery") {
    reminders.push("今天是恢复日，快走、拉伸、灵活性也算完成。");
  }
  return reminders;
}

function WorkPage({
  data,
  setData,
  updateCheckin,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  updateCheckin: (patch: Partial<DailyCheckin>) => void;
}) {
  const today = todayISO();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WorkTask["category"]>("收入任务");
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const todayTasks = data.workTasks.filter((task) => task.date === today);
  const output = data.outputs[today] ?? "";

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setTimerSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setTimerRunning(false);
          updateCheckin({ deepWorkMinutes: (data.checkins[today]?.deepWorkMinutes ?? 0) + 25 });
          return 25 * 60;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, data.checkins, today, updateCheckin]);

  function addTask() {
    if (!title.trim() || todayTasks.length >= 3) return;
    const task: WorkTask = { id: createId("task"), date: today, category, title: title.trim(), status: "active" };
    setData((current) => ({ ...current, workTasks: [task, ...current.workTasks] }));
    setTitle("");
  }

  function updateTask(id: string, status: WorkTask["status"]) {
    setData((current) => ({
      ...current,
      workTasks: current.workTasks.map((task) => (task.id === id ? { ...task, status } : task)),
    }));
    if (status === "done") updateCheckin({ workDone: true });
  }

  function deleteTask(id: string) {
    setData((current) => ({ ...current, workTasks: current.workTasks.filter((task) => task.id !== id) }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <SectionTitle icon={BriefcaseBusiness} title="学习/创业任务" />
        <div className="mb-4 grid gap-3 sm:grid-cols-[150px_1fr_auto]">
          <select value={category} onChange={(event) => setCategory(event.target.value as WorkTask["category"])} className={inputClass()}>
            <option>收入任务</option>
            <option>产品任务</option>
            <option>成长任务</option>
          </select>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass()} placeholder="添加任务" />
          <button type="button" onClick={addTask} className="flex items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 py-2 text-sm font-bold text-white disabled:bg-stone-300" disabled={todayTasks.length >= 3}>
            <Plus className="h-4 w-4" />
            添加
          </button>
        </div>
        <div className="grid gap-2">
          {todayTasks.map((task) => (
            <div key={task.id} className="grid gap-3 rounded-lg border border-stone-200 bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="text-xs font-bold text-leaf-700">{task.category}</div>
                <div className={`mt-1 text-sm font-semibold ${task.status === "done" ? "text-stone-400 line-through" : "text-stone-950"}`}>{task.title}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => updateTask(task.id, "done")} className="rounded-md bg-leaf-600 px-3 py-2 text-xs font-bold text-white">
                  完成
                </button>
                <button type="button" onClick={() => updateTask(task.id, "deferred")} className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800">
                  延后
                </button>
                <button type="button" onClick={() => deleteTask(task.id)} className="rounded-md border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700" aria-label="删除任务">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!todayTasks.length && <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-4 text-sm font-semibold text-stone-600">今天最多添加三个任务。</div>}
        </div>
      </Card>
      <div className="grid gap-4">
        <Card>
          <SectionTitle icon={TimerReset} title="番茄钟" />
          <div className="grid place-items-center rounded-lg border border-stone-200 bg-white p-8">
            <div className="font-mono text-5xl font-bold text-stone-950">{formatTimer(timerSeconds)}</div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setTimerRunning((value) => !value)} className="rounded-md bg-stone-900 px-5 py-2 text-sm font-bold text-white">
                {timerRunning ? "暂停" : "开始"}
              </button>
              <button type="button" onClick={() => { setTimerRunning(false); setTimerSeconds(25 * 60); }} className="rounded-md border border-stone-200 bg-white px-5 py-2 text-sm font-bold text-stone-800">
                重置
              </button>
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle icon={NotebookPen} title="今日产出记录" />
          <textarea
            value={output}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                outputs: {
                  ...current.outputs,
                  [today]: event.target.value,
                },
              }))
            }
            className={inputClass("min-h-36 w-full resize-y")}
          />
        </Card>
      </div>
    </div>
  );
}

function SpendingPage({
  data,
  setData,
  updateCheckin,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  updateCheckin: (patch: Partial<DailyCheckin>) => void;
}) {
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<SpendingCategory>("必要消费");
  const [reason, setReason] = useState("");
  const [answers, setAnswers] = useState<SpendingAnswers>({
    income: false,
    health: false,
    efficiency: false,
    stillWantAfter7Days: false,
    emotionDriven: false,
    budgetEnough: true,
  });
  const decision = evaluateSpending(item, amount, category, answers, data.settings);

  function saveRequest() {
    const request: SpendingRequest = {
      id: createId("spending"),
      date: todayISO(),
      item: item || "未命名商品",
      amount,
      category,
      reason,
      answers,
      decision,
    };
    setData((current) => ({ ...current, spendingRequests: [request, ...current.spendingRequests] }));
    updateCheckin({ impulseSpend: decision !== "可以买", spendAmount: amount });
    setItem("");
    setAmount(0);
    setReason("");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <SectionTitle icon={PiggyBank} title="大额消费拦截器" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="商品名称">
            <input value={item} onChange={(event) => setItem(event.target.value)} className={inputClass()} />
          </Field>
          <Field label="金额">
            <input type="number" min={0} value={amount} onChange={(event) => setAmount(Number(event.target.value))} className={inputClass()} />
          </Field>
          <Field label="消费类别">
            <select value={category} onChange={(event) => setCategory(event.target.value as SpendingCategory)} className={inputClass()}>
              {spendingCategories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="购买理由">
            <input value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass()} />
          </Field>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Toggle checked={answers.income} onChange={(value) => setAnswers({ ...answers, income: value })} label="提高收入" />
          <Toggle checked={answers.health} onChange={(value) => setAnswers({ ...answers, health: value })} label="提高健康" />
          <Toggle checked={answers.efficiency} onChange={(value) => setAnswers({ ...answers, efficiency: value })} label="提高效率" />
          <Toggle checked={answers.stillWantAfter7Days} onChange={(value) => setAnswers({ ...answers, stillWantAfter7Days: value })} label="7天后仍想买" />
          <Toggle checked={answers.emotionDriven} onChange={(value) => setAnswers({ ...answers, emotionDriven: value })} label="焦虑、奖励、攀比或无聊驱动" />
          <Toggle checked={answers.budgetEnough} onChange={(value) => setAnswers({ ...answers, budgetEnough: value })} label="本月自由额度足够" />
        </div>
        <div className={`mt-4 rounded-lg border px-4 py-4 text-center text-xl font-bold ${getDecisionStyle(decision)}`}>{decision}</div>
        <button type="button" onClick={saveRequest} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 py-3 text-sm font-bold text-white">
          <Plus className="h-4 w-4" />
          保存判断
        </button>
      </Card>
      <Card>
        <SectionTitle icon={Clock3} title="冷静记录" />
        <div className="grid gap-3">
          {data.spendingRequests.slice(0, 8).map((request) => (
            <div key={request.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-stone-950">{request.item}</div>
                  <div className="mt-1 text-xs font-semibold text-stone-500">
                    {request.date} · {request.category} · ¥{request.amount}
                  </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getDecisionStyle(request.decision)}`}>{request.decision}</span>
              </div>
              {request.reason && <div className="mt-3 text-sm leading-6 text-stone-600">{request.reason}</div>}
            </div>
          ))}
          {!data.spendingRequests.length && <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-4 text-sm font-semibold text-stone-600">暂无消费判断记录。</div>}
        </div>
      </Card>
    </div>
  );
}

function StimulusPage({
  data,
  setData,
  updateCheckin,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  updateCheckin: (patch: Partial<DailyCheckin>) => void;
}) {
  const [form, setForm] = useState<Omit<StimulusLog, "id">>({
    date: todayISO(),
    porn: false,
    masturbation: false,
    time: "23:00",
    beforeSleep: false,
    afterTraining: false,
    sleepAffected: false,
    nextDayAffected: false,
    trigger: "压力",
    note: "",
  });

  function saveLog() {
    const log = { ...form, id: createId("stimulus") };
    setData((current) => ({ ...current, stimulusLogs: [log, ...current.stimulusLogs] }));
    if (form.date === todayISO()) {
      updateCheckin({
        porn: form.porn,
        masturbation: form.masturbation,
        sleepAffected: form.sleepAffected,
      });
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <SectionTitle icon={ShieldCheck} title="清醒模式记录" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="日期">
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass()} />
          </Field>
          <Field label="发生时间">
            <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className={inputClass()} />
          </Field>
          <Toggle checked={form.porn} onChange={(value) => setForm({ ...form, porn: value })} label="看色情内容" />
          <Toggle checked={form.masturbation} onChange={(value) => setForm({ ...form, masturbation: value })} label="自慰" />
          <Toggle checked={form.beforeSleep} onChange={(value) => setForm({ ...form, beforeSleep: value })} label="睡前发生" />
          <Toggle checked={form.afterTraining} onChange={(value) => setForm({ ...form, afterTraining: value })} label="训练后发生" />
          <Toggle checked={form.sleepAffected} onChange={(value) => setForm({ ...form, sleepAffected: value })} label="影响睡眠" />
          <Toggle checked={form.nextDayAffected} onChange={(value) => setForm({ ...form, nextDayAffected: value })} label="影响第二天状态" />
          <Field label="触发原因">
            <select value={form.trigger} onChange={(event) => setForm({ ...form, trigger: event.target.value })} className={inputClass()}>
              {triggerOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="备注" className="mt-3">
          <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className={inputClass("min-h-24 resize-y")} />
        </Field>
        <button type="button" onClick={saveLog} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 py-3 text-sm font-bold text-white">
          <Plus className="h-4 w-4" />
          保存记录
        </button>
      </Card>
      <div className="grid gap-4">
        <Card>
          <SectionTitle icon={Moon} title="低刺激晚间流程" />
          <div className="grid gap-2">
            {[
              ["22:30", "洗澡"],
              ["22:45", "拉伸"],
              ["23:00", "手机离床"],
              ["23:10", "读书/听播客"],
              ["23:30", "睡觉"],
            ].map(([time, label]) => (
              <div key={time} className="flex items-center gap-3 rounded-md border border-stone-200 bg-white px-3 py-3">
                <span className="w-16 rounded-full bg-sky-100 px-3 py-1 text-center text-xs font-bold text-sky-800">{time}</span>
                <span className="text-sm font-semibold text-stone-800">{label}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Activity} title="最近记录" />
          <div className="grid gap-2">
            {data.stimulusLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700">
                <strong className="text-stone-950">{log.date}</strong> · {log.trigger} · {log.sleepAffected ? "影响睡眠" : "未影响睡眠"}
              </div>
            ))}
            {!data.stimulusLogs.length && <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-4 text-sm font-semibold text-stone-600">暂无清醒模式记录。</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SleepPage({
  data,
  setData,
  updateCheckin,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  updateCheckin: (patch: Partial<DailyCheckin>) => void;
}) {
  const [form, setForm] = useState<Omit<SleepLog, "id">>({
    date: todayISO(),
    bedTime: "23:30",
    wakeTime: "07:00",
    hours: 7.5,
    quality: 4,
    wokeAtNight: false,
    phoneBeforeBed: false,
    lateCoffee: false,
    lateTraining: false,
    stimulusAffected: false,
  });

  function saveSleep() {
    const log = { ...form, id: createId("sleep") };
    setData((current) => ({ ...current, sleepLogs: [log, ...current.sleepLogs] }));
    if (form.date === todayISO()) {
      updateCheckin({ sleepHours: form.hours, sleepQuality: form.quality, sleepAffected: form.stimulusAffected });
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <SectionTitle icon={BedDouble} title="睡眠记录" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="日期">
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass()} />
          </Field>
          <Field label="睡眠小时数">
            <input type="number" min={0} step={0.25} value={form.hours} onChange={(event) => setForm({ ...form, hours: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="入睡时间">
            <input type="time" value={form.bedTime} onChange={(event) => setForm({ ...form, bedTime: event.target.value })} className={inputClass()} />
          </Field>
          <Field label="起床时间">
            <input type="time" value={form.wakeTime} onChange={(event) => setForm({ ...form, wakeTime: event.target.value })} className={inputClass()} />
          </Field>
          <Field label="睡眠质量">
            <input type="range" min={1} max={5} value={form.quality} onChange={(event) => setForm({ ...form, quality: Number(event.target.value) })} />
            <span className="text-xs font-bold text-leaf-700">{form.quality}</span>
          </Field>
          <Toggle checked={form.wokeAtNight} onChange={(value) => setForm({ ...form, wokeAtNight: value })} label="夜醒" />
          <Toggle checked={form.phoneBeforeBed} onChange={(value) => setForm({ ...form, phoneBeforeBed: value })} label="睡前刷手机" />
          <Toggle checked={form.lateCoffee} onChange={(value) => setForm({ ...form, lateCoffee: value })} label="咖啡太晚" />
          <Toggle checked={form.lateTraining} onChange={(value) => setForm({ ...form, lateTraining: value })} label="训练太晚" />
          <Toggle checked={form.stimulusAffected} onChange={(value) => setForm({ ...form, stimulusAffected: value })} label="色情刺激影响入睡" />
        </div>
        <button type="button" onClick={saveSleep} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 py-3 text-sm font-bold text-white">
          <Plus className="h-4 w-4" />
          保存睡眠
        </button>
      </Card>
      <Card>
        <SectionTitle icon={Moon} title="睡眠趋势" />
        <ChartBox>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={getStatsData(data)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="睡眠" stroke="#5ca8c7" fill="#cfeaf3" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>
      </Card>
    </div>
  );
}

function MoodPage({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const [form, setForm] = useState<Omit<MoodLog, "id">>({
    date: todayISO(),
    mood: 3,
    stress: 3,
    anxiety: 3,
    impulse: 3,
    energy: 3,
    avoidance: "",
    bestThing: "",
  });

  function saveMood() {
    const log = { ...form, id: createId("mood") };
    setData((current) => ({ ...current, moodLogs: [log, ...current.moodLogs] }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <SectionTitle icon={HeartPulse} title="情绪日记" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="日期">
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass()} />
          </Field>
          {[
            ["mood", "今日心情"],
            ["stress", "今日压力"],
            ["anxiety", "今日焦虑"],
            ["impulse", "今日冲动"],
            ["energy", "今日精力"],
          ].map(([key, label]) => (
            <Field key={key} label={`${label} 1-5`}>
              <input
                type="range"
                min={1}
                max={5}
                value={form[key as keyof Pick<MoodLog, "mood" | "stress" | "anxiety" | "impulse" | "energy">]}
                onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })}
              />
              <span className="text-xs font-bold text-leaf-700">{form[key as keyof Pick<MoodLog, "mood" | "stress" | "anxiety" | "impulse" | "energy">]}</span>
            </Field>
          ))}
        </div>
        <Field label="今日最想逃避的事" className="mt-3">
          <textarea value={form.avoidance} onChange={(event) => setForm({ ...form, avoidance: event.target.value })} className={inputClass("min-h-24 resize-y")} />
        </Field>
        <Field label="今日做得最好的一件事" className="mt-3">
          <textarea value={form.bestThing} onChange={(event) => setForm({ ...form, bestThing: event.target.value })} className={inputClass("min-h-24 resize-y")} />
        </Field>
        <button type="button" onClick={saveMood} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 py-3 text-sm font-bold text-white">
          <Plus className="h-4 w-4" />
          保存日记
        </button>
      </Card>
      <Card>
        <SectionTitle icon={NotebookPen} title="最近日记" />
        <div className="grid gap-3">
          {data.moodLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold text-stone-500">
                <span>{log.date}</span>
                <span className="rounded-full bg-leaf-100 px-2 py-1 text-leaf-800">心情 {log.mood}</span>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">压力 {log.stress}</span>
              </div>
              <div className="grid gap-2 text-sm leading-6 text-stone-700">
                {log.avoidance && <p>逃避：{log.avoidance}</p>}
                {log.bestThing && <p>最好：{log.bestThing}</p>}
              </div>
            </div>
          ))}
          {!data.moodLogs.length && <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-4 text-sm font-semibold text-stone-600">暂无情绪日记。</div>}
        </div>
      </Card>
    </div>
  );
}

function StatsPage({ data }: { data: AppData }) {
  const chartData = getStatsData(data);
  const dietRate = Math.round((chartData.filter((item) => item.饮食 >= 4).length / Math.max(chartData.length, 1)) * 100);
  const weightData = getWeightData(data);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="7天均分" value={Math.round(chartData.reduce((sum, item) => sum + item.状态分, 0) / chartData.length)} icon={Activity} />
        <StatPill label="睡眠均值" value={`${(chartData.reduce((sum, item) => sum + item.睡眠, 0) / chartData.length).toFixed(1)}h`} icon={Moon} />
        <StatPill label="训练总时长" value={`${chartData.reduce((sum, item) => sum + item.训练, 0)}m`} icon={Dumbbell} />
        <StatPill label="饮食达标率" value={`${dietRate}%`} icon={Apple} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="7天状态分" icon={Activity}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="状态分" stroke="#3f9850" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ChartCard>
        <ChartCard title="7天睡眠" icon={Moon}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="睡眠" stroke="#5ca8c7" fill="#cfeaf3" />
          </AreaChart>
        </ChartCard>
        <ChartCard title="7天训练时长" icon={Dumbbell}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="训练" radius={[5, 5, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill="#60b46d" />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
        <ChartCard title="7天深度工作" icon={BriefcaseBusiness}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="深度工作" fill="#5ca8c7" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="7天消费金额" icon={PiggyBank}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="消费" fill="#f5b85f" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="7天冲动与刺激影响" icon={ShieldCheck}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="冲动次数" fill="#c8667e" radius={[5, 5, 0, 0]} />
            <Bar dataKey="刺激影响睡眠" fill="#8aa0d6" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="体重趋势" icon={Activity}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip />
            <Line type="monotone" dataKey="体重" stroke="#9b6a4f" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ChartCard>
        <ChartCard title="饮食评分" icon={Apple}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Area type="monotone" dataKey="饮食" stroke="#3f9850" fill="#dff3df" />
          </AreaChart>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartBox({ children }: { children: React.ReactNode }) {
  return <div className="h-[280px] min-w-0">{children}</div>;
}

function ChartCard({ title, icon, children }: { title: string; icon: LucideIcon; children: React.ReactElement }) {
  return (
    <Card>
      <SectionTitle icon={icon} title={title} />
      <ChartBox>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </ChartBox>
    </Card>
  );
}

function getStatsData(data: AppData) {
  return getLastDates(7).map((date) => {
    const checkin = data.checkins[date] ?? defaultCheckin(date);
    const day = date.slice(5);
    return {
      date,
      day,
      状态分: calculateScore(checkin, data.settings),
      睡眠: checkin.sleepHours,
      训练: checkin.trainingMinutes,
      深度工作: checkin.deepWorkMinutes,
      消费: checkin.spendAmount,
      冲动次数: checkin.impulseSpend ? 1 : 0,
      刺激影响睡眠: checkin.sleepAffected ? 1 : 0,
      饮食: checkin.dietScore,
    };
  });
}

function getWeightData(data: AppData) {
  const dates = getLastDates(7);
  return dates.map((date) => {
    const log = data.trainingLogs.find((item) => item.date === date);
    return {
      day: date.slice(5),
      体重: log?.weight ?? data.settings.weight,
    };
  });
}

function ReviewPage({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const weekKey = getWeekKey();
  const note = data.weeklyReviewNotes[weekKey] ?? { biggestProblem: "", nextFocus: "" };
  const stats = getWeeklyReviewStats(data);

  function updateNote(patch: Partial<WeeklyReviewNote>) {
    setData((current) => ({
      ...current,
      weeklyReviewNotes: {
        ...current.weeklyReviewNotes,
        [weekKey]: {
          ...note,
          ...patch,
        },
      },
    }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <SectionTitle icon={NotebookPen} title="周复盘" />
        <div className="grid gap-3 sm:grid-cols-2">
          <ReviewMetric label="本周状态分" value={stats.avgScore} />
          <ReviewMetric label="花园成长情况" value={`${stats.gardenGrowth}%`} />
          <ReviewMetric label="训练完成率" value={`${stats.trainingRate}%`} />
          <ReviewMetric label="饮食稳定性" value={`${stats.dietStability}%`} />
          <ReviewMetric label="睡眠均值" value={`${stats.avgSleep}h`} />
          <ReviewMetric label="消费失控次数" value={stats.impulseSpend} />
          <ReviewMetric label="刺激失控次数" value={stats.stimulusLost} />
        </div>
      </Card>
      <Card>
        <SectionTitle icon={Leaf} title="下周调整" />
        <Field label="本周最大问题">
          <textarea value={note.biggestProblem} onChange={(event) => updateNote({ biggestProblem: event.target.value })} className={inputClass("min-h-28 resize-y")} />
        </Field>
        <Field label="下周只改一个重点" className="mt-3">
          <textarea value={note.nextFocus} onChange={(event) => updateNote({ nextFocus: event.target.value })} className={inputClass("min-h-28 resize-y")} />
        </Field>
      </Card>
    </div>
  );
}

function ReviewMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="text-xs font-bold text-stone-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-stone-950">{value}</div>
    </div>
  );
}

function getWeeklyReviewStats(data: AppData) {
  const weekDates = getLastDates(7);
  const checkins = weekDates.map((date) => data.checkins[date] ?? defaultCheckin(date));
  const avgScore = Math.round(checkins.reduce((sum, item) => sum + calculateScore(item, data.settings), 0) / checkins.length);
  const trainingRate = Math.round((checkins.filter((item) => item.trainingDone).length / checkins.length) * 100);
  const dietStability = Math.round((checkins.filter((item) => item.dietScore >= 4 && !item.binge).length / checkins.length) * 100);
  const avgSleep = (checkins.reduce((sum, item) => sum + item.sleepHours, 0) / checkins.length).toFixed(1);
  const impulseSpend = checkins.filter((item) => item.impulseSpend).length;
  const stimulusLost = checkins.filter((item) => item.porn || item.masturbation || item.sleepAffected).length;
  return {
    avgScore,
    gardenGrowth: Math.round((avgScore + trainingRate + dietStability) / 3),
    trainingRate,
    dietStability,
    avgSleep,
    impulseSpend,
    stimulusLost,
  };
}

function SettingsPage({
  data,
  setData,
  updateSettings,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  updateSettings: (patch: Partial<SettingsState>) => void;
}) {
  const [importError, setImportError] = useState("");

  function updateTrainingTemplate(index: number, value: string) {
    const trainingTemplate = data.settings.trainingTemplate.map((item, itemIndex) => (itemIndex === index ? value : item));
    updateSettings({ trainingTemplate });
  }

  function updateNutritionTemplate(meal: string, value: string) {
    updateSettings({
      nutritionTemplates: {
        ...data.settings.nutritionTemplates,
        [meal]: value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    });
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `life-garden-os-${todayISO()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<AppData>;
        setData(normalizeData(parsed));
        setImportError("");
      } catch {
        setImportError("JSON解析失败");
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    if (!window.confirm("确认清空 Life Garden OS 的本地数据？")) return;
    setData(cloneDefaultData());
  }

  return (
    <div className="grid gap-4">
      <Card>
        <SectionTitle icon={Settings} title="基础设置" />
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="体重 kg">
            <input type="number" value={data.settings.weight} onChange={(event) => updateSettings({ weight: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="蛋白目标下限 g">
            <input type="number" value={data.settings.proteinMin} onChange={(event) => updateSettings({ proteinMin: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="蛋白目标上限 g">
            <input type="number" value={data.settings.proteinMax} onChange={(event) => updateSettings({ proteinMax: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="睡眠目标 h">
            <input type="number" step={0.25} value={data.settings.sleepTarget} onChange={(event) => updateSettings({ sleepTarget: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="24小时冷静阈值">
            <input type="number" value={data.settings.cool24Threshold} onChange={(event) => updateSettings({ cool24Threshold: Number(event.target.value) })} className={inputClass()} />
          </Field>
          <Field label="7天冷静阈值">
            <input type="number" value={data.settings.cool7Threshold} onChange={(event) => updateSettings({ cool7Threshold: Number(event.target.value) })} className={inputClass()} />
          </Field>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle icon={Dumbbell} title="一周训练模板" />
          <div className="grid gap-3">
            {data.settings.trainingTemplate.map((item, index) => (
              <Field key={defaultWeekPlan[index]?.dayName} label={defaultWeekPlan[index]?.dayName ?? `第${index + 1}天`}>
                <input value={item} onChange={(event) => updateTrainingTemplate(index, event.target.value)} className={inputClass()} />
              </Field>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Apple} title="饮食模板" />
          <div className="grid gap-3">
            {Object.entries(data.settings.nutritionTemplates).map(([meal, items]) => (
              <Field key={meal} label={meal}>
                <textarea value={items.join("\n")} onChange={(event) => updateNutritionTemplate(meal, event.target.value)} className={inputClass("min-h-28 resize-y")} />
              </Field>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={Download} title="数据管理" />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={exportJSON} className="flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-bold text-white">
            <Download className="h-4 w-4" />
            导出JSON
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-800">
            <Upload className="h-4 w-4" />
            导入JSON
            <input type="file" accept="application/json" className="hidden" onChange={(event) => importJSON(event.target.files?.[0] ?? null)} />
          </label>
          <button type="button" onClick={clearData} className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800">
            <Trash2 className="h-4 w-4" />
            清空数据
          </button>
        </div>
        {importError && <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800">{importError}</div>}
      </Card>
    </div>
  );
}

export default App;

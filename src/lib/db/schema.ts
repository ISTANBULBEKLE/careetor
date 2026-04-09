import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums
// ============================================================

export const planEnum = pgEnum("plan", ["free", "pro", "team"]);
export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "evaluated",
  "applied",
  "responded",
  "interview",
  "offer",
  "rejected",
  "discarded",
  "skip",
]);
export const jobSourceEnum = pgEnum("job_source", [
  "manual",
  "scan",
  "import",
]);
export const atsTypeEnum = pgEnum("ats_type", [
  "greenhouse",
  "lever",
  "ashby",
  "workday",
  "custom",
]);
export const scanMethodEnum = pgEnum("scan_method", [
  "playwright",
  "api",
  "websearch",
]);
export const scanStatusEnum = pgEnum("scan_status_type", [
  "running",
  "completed",
  "failed",
]);
export const scanResultEnum = pgEnum("scan_result", [
  "added",
  "skipped_title",
  "skipped_dup",
  "skipped_expired",
]);
export const evalBlockEnum = pgEnum("eval_block", [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
]);
export const recommendationEnum = pgEnum("recommendation", [
  "strong_apply",
  "apply",
  "review",
  "skip",
]);
export const cvSectionTypeEnum = pgEnum("cv_section_type", [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "other",
]);
export const paperFormatEnum = pgEnum("paper_format", ["letter", "a4"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "new_jobs",
  "status_change",
  "evaluation_complete",
  "scan_complete",
]);
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

// ============================================================
// Users & Auth
// ============================================================

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  plan: planEnum("plan").default("free"),
  aiCredits: integer("ai_credits").default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// Profiles
// ============================================================

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  headline: text("headline"),
  location: text("location"),
  timezone: text("timezone"),
  targetRoles: jsonb("target_roles").$type<string[]>(),
  archetypes: jsonb("archetypes").$type<
    { name: string; level: string; fit: string }[]
  >(),
  salaryMin: integer("salary_min"),
  salaryTarget: integer("salary_target"),
  salaryCurrency: text("salary_currency").default("USD"),
  visaStatus: text("visa_status"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  githubUrl: text("github_url"),
  superpowers: jsonb("superpowers").$type<string[]>(),
  exitStory: text("exit_story"),
  preferences: jsonb("preferences").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// CVs
// ============================================================

export const cvs = pgTable("cvs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isMaster: boolean("is_master").default(false),
  rawText: text("raw_text"),
  parsedJson: jsonb("parsed_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cvSections = pgTable("cv_sections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  cvId: text("cv_id")
    .notNull()
    .references(() => cvs.id, { onDelete: "cascade" }),
  type: cvSectionTypeEnum("type").notNull(),
  title: text("title"),
  content: text("content"),
  orderIndex: integer("order_index").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// Jobs & Evaluations
// ============================================================

export const jobs = pgTable(
  "jobs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    source: jobSourceEnum("source").default("manual"),
    sourceUrl: text("source_url"),
    company: text("company").notNull(),
    companySlug: text("company_slug").notNull(),
    role: text("role").notNull(),
    location: text("location"),
    remotePolicy: text("remote_policy"),
    salaryRange: text("salary_range"),
    jdText: text("jd_text").notNull(),
    jdHtml: text("jd_html"),
    detectedArchetype: text("detected_archetype"),
    status: jobStatusEnum("status").default("pending"),
    score: decimal("score", { precision: 2, scale: 1 }),
    scanId: text("scan_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_jobs_user_status").on(table.userId, table.status),
    index("idx_jobs_user_score").on(table.userId, table.score),
    uniqueIndex("idx_jobs_user_company_role").on(
      table.userId,
      table.companySlug,
      table.role
    ),
  ]
);

export const evaluations = pgTable("evaluations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" })
    .unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  overallScore: decimal("overall_score", { precision: 2, scale: 1 }).notNull(),
  scoresJson: jsonb("scores_json").notNull(),
  archetype: text("archetype").notNull(),
  summary: text("summary"),
  recommendation: recommendationEnum("recommendation").notNull(),
  keywords: jsonb("keywords").$type<string[]>(),
  gaps: jsonb("gaps").$type<
    { skill: string; severity: string; mitigation: string }[]
  >(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evaluationBlocks = pgTable(
  "evaluation_blocks",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    evaluationId: text("evaluation_id")
      .notNull()
      .references(() => evaluations.id, { onDelete: "cascade" }),
    block: evalBlockEnum("block").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    uniqueIndex("idx_eval_block_unique").on(table.evaluationId, table.block),
  ]
);

// ============================================================
// Tailored CVs & PDFs
// ============================================================

export const tailoredCvs = pgTable("tailored_cvs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cvId: text("cv_id").references(() => cvs.id),
  htmlContent: text("html_content").notNull(),
  keywordsUsed: jsonb("keywords_used").$type<string[]>(),
  changesMade: jsonb("changes_made").$type<string[]>(),
  pdfUrl: text("pdf_url"),
  pdfFormat: paperFormatEnum("pdf_format").default("letter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// Applications
// ============================================================

export const applications = pgTable("applications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" })
    .unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tailoredCvId: text("tailored_cv_id").references(() => tailoredCvs.id),
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at"),
  responseAt: timestamp("response_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applicationAnswers = pgTable("application_answers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  aiGenerated: boolean("ai_generated").default(true),
  edited: boolean("edited").default(false),
});

// ============================================================
// Interview Prep
// ============================================================

export const stories = pgTable("stories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  situation: text("situation").notNull(),
  task: text("task").notNull(),
  action: text("action").notNull(),
  result: text("result").notNull(),
  reflection: text("reflection"),
  tags: jsonb("tags").$type<string[]>(),
  usedCount: integer("used_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewPreps = pgTable("interview_preps", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  processOverview: text("process_overview"),
  roundsJson: jsonb("rounds_json"),
  likelyQuestions: jsonb("likely_questions"),
  techChecklist: jsonb("tech_checklist"),
  companySignals: jsonb("company_signals"),
  sources: jsonb("sources"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// Scanning
// ============================================================

export const portals = pgTable(
  "portals",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    company: text("company").notNull(),
    companySlug: text("company_slug").notNull(),
    careersUrl: text("careers_url"),
    atsType: atsTypeEnum("ats_type").default("custom"),
    apiEndpoint: text("api_endpoint"),
    enabled: boolean("enabled").default(true),
    scanMethod: scanMethodEnum("scan_method").default("playwright"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_portals_user_company").on(
      table.userId,
      table.companySlug
    ),
  ]
);

export const scans = pgTable("scans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  status: scanStatusEnum("status").default("running"),
  jobsFound: integer("jobs_found").default(0),
  jobsNew: integer("jobs_new").default(0),
  jobsSkipped: integer("jobs_skipped").default(0),
  error: text("error"),
});

export const scanHistory = pgTable(
  "scan_history",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    scanId: text("scan_id").references(() => scans.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    company: text("company"),
    role: text("role"),
    portal: text("portal"),
    result: scanResultEnum("result"),
    seenAt: timestamp("seen_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_scan_history_url").on(table.userId, table.url),
  ]
);

// ============================================================
// Settings & Notifications
// ============================================================

export const userSettings = pgTable("user_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  titleFilterPositive: jsonb("title_filter_positive").$type<string[]>(),
  titleFilterNegative: jsonb("title_filter_negative").$type<string[]>(),
  seniorityBoost: jsonb("seniority_boost").$type<string[]>(),
  scanFrequency: text("scan_frequency").default("weekly"),
  emailNotifications: boolean("email_notifications").default(true),
  theme: themeEnum("theme").default("system"),
  language: text("language").default("en"),
});

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    read: boolean("read").default(false),
    data: jsonb("data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_notifications_user_unread").on(
      table.userId,
      table.read,
      table.createdAt
    ),
  ]
);

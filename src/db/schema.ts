import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

// Enums
export const languageEnum = pgEnum('language', [
  'javascript',
  'typescript',
  'python',
])

export const difficultyEnum = pgEnum('difficulty', [
  'beginner',
  'intermediate',
  'advanced',
  'hardcore',
])

export const snippetCategoryEnum = pgEnum('snippet_category', [
  'functions',
  'loops',
  'conditionals',
  'classes',
  'react-components',
  'async',
  'data-structures',
  'algorithms',
])

export const achievementTypeEnum = pgEnum('achievement_type', [
  'speed',
  'accuracy',
  'consistency',
  'special',
])

export const leaderboardPeriodEnum = pgEnum('leaderboard_period', [
  'daily',
  'weekly',
  'alltime',
])

export const practiceModeEnum = pgEnum('practice_mode', [
  'symbols',
  'keywords',
  'weak-spots',
  'speed',
  'accuracy',
  'warm-up',
])

export const raceStatusEnum = pgEnum('race_status', [
  'waiting',
  'countdown',
  'racing',
  'finished',
])

// Users table
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    displayName: varchar('display_name', { length: 100 }),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_username_idx').on(table.username),
  ]
)

// User settings table
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  theme: varchar('theme', { length: 20 }).default('dark'),
  autoIndent: boolean('auto_indent').default(true),
  tabSize: integer('tab_size').default(2),
  soundEnabled: boolean('sound_enabled').default(false),
  soundVolume: integer('sound_volume').default(50),
  showLineNumbers: boolean('show_line_numbers').default(true),
  smoothCaret: boolean('smooth_caret').default(true),
  caretStyle: varchar('caret_style', { length: 20 }).default('line'),
  fontSize: integer('font_size').default(16),
  strictMode: boolean('strict_mode').default(false),
  showWpm: boolean('show_wpm').default(true),
  showAccuracy: boolean('show_accuracy').default(true),
  showTimer: boolean('show_timer').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Code snippets table
export const snippets = pgTable(
  'snippets',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    content: text('content').notNull(),
    language: languageEnum('language').notNull(),
    difficulty: difficultyEnum('difficulty').notNull(),
    category: snippetCategoryEnum('category').notNull(),
    characterCount: integer('character_count').notNull(),
    lineCount: integer('line_count').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('snippets_language_idx').on(table.language),
    index('snippets_difficulty_idx').on(table.difficulty),
    index('snippets_category_idx').on(table.category),
    index('snippets_language_difficulty_idx').on(
      table.language,
      table.difficulty
    ),
  ]
)

// Test results table
export const testResults = pgTable(
  'test_results',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    snippetId: integer('snippet_id')
      .notNull()
      .references(() => snippets.id, { onDelete: 'cascade' }),
    wpm: real('wpm').notNull(),
    rawWpm: real('raw_wpm').notNull(),
    accuracy: real('accuracy').notNull(),
    symbolAccuracy: real('symbol_accuracy'),
    keywordAccuracy: real('keyword_accuracy'),
    charactersTyped: integer('characters_typed').notNull(),
    correctCharacters: integer('correct_characters').notNull(),
    incorrectCharacters: integer('incorrect_characters').notNull(),
    backspaceCount: integer('backspace_count').default(0),
    duration: integer('duration').notNull(), // in seconds
    completedAt: timestamp('completed_at').defaultNow().notNull(),
    isStrictMode: boolean('is_strict_mode').default(false),
  },
  (table) => [
    index('test_results_user_idx').on(table.userId),
    index('test_results_completed_at_idx').on(table.completedAt),
    index('test_results_user_wpm_idx').on(table.userId, table.wpm),
  ]
)

// Achievement definitions table
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  type: achievementTypeEnum('type').notNull(),
  iconUrl: text('icon_url'),
  criteria: text('criteria').notNull(), // JSON string with criteria
  points: integer('points').default(10),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// User achievements (earned achievements)
export const userAchievements = pgTable(
  'user_achievements',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    achievementId: integer('achievement_id')
      .notNull()
      .references(() => achievements.id, { onDelete: 'cascade' }),
    progress: real('progress').default(0), // 0-100 percentage
    unlockedAt: timestamp('unlocked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('user_achievements_user_idx').on(table.userId),
    index('user_achievements_unique').on(table.userId, table.achievementId),
  ]
)

// Leaderboard entries table
export const leaderboardEntries = pgTable(
  'leaderboard_entries',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    period: leaderboardPeriodEnum('period').notNull(),
    language: languageEnum('language').notNull(),
    difficulty: difficultyEnum('difficulty').notNull(),
    bestWpm: real('best_wpm').notNull(),
    bestAccuracy: real('best_accuracy').notNull(),
    testResultId: integer('test_result_id').references(() => testResults.id, {
      onDelete: 'set null',
    }),
    periodStart: timestamp('period_start').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('leaderboard_period_idx').on(table.period),
    index('leaderboard_language_idx').on(table.language),
    index('leaderboard_ranking_idx').on(
      table.period,
      table.language,
      table.difficulty,
      table.bestWpm
    ),
  ]
)

// Practice sessions table
export const practiceSessions = pgTable(
  'practice_sessions',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mode: practiceModeEnum('mode').notNull(),
    language: languageEnum('language'),
    difficulty: difficultyEnum('difficulty'),
    targetCharacters: text('target_characters'), // For symbol/weak-spot practice
    duration: integer('duration').notNull(), // in seconds
    charactersTyped: integer('characters_typed').notNull(),
    correctCharacters: integer('correct_characters').notNull(),
    accuracy: real('accuracy').notNull(),
    wpm: real('wpm').notNull(),
    completedAt: timestamp('completed_at').defaultNow().notNull(),
  },
  (table) => [
    index('practice_sessions_user_idx').on(table.userId),
    index('practice_sessions_mode_idx').on(table.mode),
    index('practice_sessions_user_mode_idx').on(table.userId, table.mode),
  ]
)

// Multiplayer races table
export const races = pgTable(
  'races',
  {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 6 }).notNull().unique(), // 6-char join code
    hostId: uuid('host_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    snippetId: integer('snippet_id').references(() => snippets.id, {
      onDelete: 'set null',
    }),
    status: raceStatusEnum('status').default('waiting').notNull(),
    maxPlayers: integer('max_players').default(4).notNull(),
    countdownDuration: integer('countdown_duration').default(3).notNull(), // seconds
    language: languageEnum('language'),
    difficulty: difficultyEnum('difficulty'),
    isPrivate: boolean('is_private').default(false).notNull(),
    startedAt: timestamp('started_at'),
    finishedAt: timestamp('finished_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('races_code_idx').on(table.code),
    index('races_host_idx').on(table.hostId),
    index('races_status_idx').on(table.status),
    index('races_created_at_idx').on(table.createdAt),
  ]
)

// Race participants table
export const raceParticipants = pgTable(
  'race_participants',
  {
    id: serial('id').primaryKey(),
    raceId: integer('race_id')
      .notNull()
      .references(() => races.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    progress: real('progress').default(0).notNull(), // 0-100
    wpm: real('wpm').default(0).notNull(),
    accuracy: real('accuracy').default(100).notNull(),
    isReady: boolean('is_ready').default(false).notNull(),
    isFinished: boolean('is_finished').default(false).notNull(),
    finishTime: integer('finish_time'), // ms since race start
    position: integer('position'), // 1st, 2nd, etc.
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [
    index('race_participants_race_idx').on(table.raceId),
    index('race_participants_user_idx').on(table.userId),
    index('race_participants_race_user_idx').on(table.raceId, table.userId),
  ]
)

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  testResults: many(testResults),
  achievements: many(userAchievements),
  leaderboardEntries: many(leaderboardEntries),
  practiceSessions: many(practiceSessions),
  hostedRaces: many(races),
  raceParticipations: many(raceParticipants),
}))

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}))

export const snippetsRelations = relations(snippets, ({ many }) => ({
  testResults: many(testResults),
  races: many(races),
}))

export const testResultsRelations = relations(testResults, ({ one }) => ({
  user: one(users, {
    fields: [testResults.userId],
    references: [users.id],
  }),
  snippet: one(snippets, {
    fields: [testResults.snippetId],
    references: [snippets.id],
  }),
}))

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}))

export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    user: one(users, {
      fields: [userAchievements.userId],
      references: [users.id],
    }),
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
  })
)

export const leaderboardEntriesRelations = relations(
  leaderboardEntries,
  ({ one }) => ({
    user: one(users, {
      fields: [leaderboardEntries.userId],
      references: [users.id],
    }),
    testResult: one(testResults, {
      fields: [leaderboardEntries.testResultId],
      references: [testResults.id],
    }),
  })
)

export const practiceSessionsRelations = relations(
  practiceSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [practiceSessions.userId],
      references: [users.id],
    }),
  })
)

export const racesRelations = relations(races, ({ one, many }) => ({
  host: one(users, {
    fields: [races.hostId],
    references: [users.id],
  }),
  snippet: one(snippets, {
    fields: [races.snippetId],
    references: [snippets.id],
  }),
  participants: many(raceParticipants),
}))

export const raceParticipantsRelations = relations(
  raceParticipants,
  ({ one }) => ({
    race: one(races, {
      fields: [raceParticipants.raceId],
      references: [races.id],
    }),
    user: one(users, {
      fields: [raceParticipants.userId],
      references: [users.id],
    }),
  })
)

// Type exports for use in application
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserSettings = typeof userSettings.$inferSelect
export type NewUserSettings = typeof userSettings.$inferInsert
export type Snippet = typeof snippets.$inferSelect
export type NewSnippet = typeof snippets.$inferInsert
export type TestResult = typeof testResults.$inferSelect
export type NewTestResult = typeof testResults.$inferInsert
export type Achievement = typeof achievements.$inferSelect
export type NewAchievement = typeof achievements.$inferInsert
export type UserAchievement = typeof userAchievements.$inferSelect
export type NewUserAchievement = typeof userAchievements.$inferInsert
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect
export type NewLeaderboardEntry = typeof leaderboardEntries.$inferInsert
export type PracticeSession = typeof practiceSessions.$inferSelect
export type NewPracticeSession = typeof practiceSessions.$inferInsert
export type Race = typeof races.$inferSelect
export type NewRace = typeof races.$inferInsert
export type RaceParticipant = typeof raceParticipants.$inferSelect
export type NewRaceParticipant = typeof raceParticipants.$inferInsert

// Enum type exports
export type Language = (typeof languageEnum.enumValues)[number]
export type Difficulty = (typeof difficultyEnum.enumValues)[number]
export type SnippetCategory = (typeof snippetCategoryEnum.enumValues)[number]
export type AchievementType = (typeof achievementTypeEnum.enumValues)[number]
export type LeaderboardPeriod = (typeof leaderboardPeriodEnum.enumValues)[number]
export type PracticeMode = (typeof practiceModeEnum.enumValues)[number]
export type RaceStatus = (typeof raceStatusEnum.enumValues)[number]

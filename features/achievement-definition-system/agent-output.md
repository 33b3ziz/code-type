
🔧 Tool: Task
Input: {
  "description": "Explore codebase structure",
  "prompt": "Explore this codebase to understand its structure. I need to implement an \"achievement definition system\" - a configuration system defining achievement milestones with descriptions, criteria, and badge icons. Support various achievement types including speed, accuracy, consistency, and specific code patterns.\n\nPlease find:\n1. The overall project structure (what kind of project is this - React, Next.js, etc.)\n2. How configuration files are typically structured in this project\n3. Any existing achievement, badge, or gamification-related code\n4. The patterns used for TypeScript types/interfaces\n5. Where configuration/constants are typically stored\n\nBe thorough in your exploration - look at package.json, src directory structure, existing config files, and any relevant existing code.",
  "subagent_type": "Explore"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/package.json"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/",
  "description": "List directory contents to understand project structure"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming -type f -name \"tsconfig.json\" -o -name \"next.config.js\" -o -name \"vite.config.ts\" | head -20",
  "description": "Find build/config files"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming -maxdepth 3 -type f | head -50",
  "description": "Find all files up to 3 levels deep"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/.automaker/",
  "description": "Check automaker directory contents"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/app_spec.txt"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/categories.json"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/ | head -30",
  "description": "List feature directories"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/achievement-definition-system/",
  "description": "List achievement-definition-system feature files"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/achievement-badge-display/",
  "description": "List achievement-badge-display feature files"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/ | wc -l",
  "description": "Count total features"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/features/achievement-definition-system/feature.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/features/achievement-badge-display/feature.json"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.json\" | grep -v node_modules | grep -v .git | head -30",
  "description": "Find TypeScript and JSON files in the project"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming -type d -name \"src\" -o -type d -name \"app\" -o -type d -name \"components\" 2>/dev/null | head -10",
  "description": "Search for typical source directories"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming -maxdepth 1 -type f",
  "description": "Find root level files"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/.automaker/context/",
  "description": "List context directory"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/context/clean-code.md"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/context/context-metadata.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/features/achievement-definition-system/agent-output.md"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/difficulty-selector-component/feature.json",
  "description": "Read difficulty selector feature definition"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/database-schema-setup/feature.json",
  "description": "Read database schema feature definition"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming/.automaker/features -name \"feature.json\" | xargs grep -l \"achievement\\|gamification\\|badge\" 2>/dev/null",
  "description": "Find achievement-related feature files"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/achievement-progress-tracker/feature.json",
  "description": "Read achievement progress tracker"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/achievement-tracking-storage/feature.json",
  "description": "Read achievement tracking storage"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/perfect-accuracy-achievement/feature.json",
  "description": "Read perfect accuracy achievement feature"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/no-backspace-achievement/feature.json",
  "description": "Read no-backspace achievement feature"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/symbol-accuracy-achievement/feature.json",
  "description": "Read symbol accuracy achievement feature"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming/.automaker/features -type d -name \"*config*\" -o -type d -name \"*constant*\"",
  "description": "Find config-related features"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming/.automaker/features -type f -name \"*.md\" | head -20",
  "description": "Find markdown documentation in features"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/wpm-calculation-engine/feature.json",
  "description": "Read WPM calculation engine feature"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/features/difficulty-selector-component/agent-output.md"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/features/database-schema-setup/agent-output.md"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/language-selector-component/feature.json",
  "description": "Read language selector feature"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/typing-test-component/feature.json",
  "description": "Read typing test component feature"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/leaderboard-display-component/feature.json",
  "description": "Read leaderboard display feature"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/challenge-selector-component/feature.json",
  "description": "Read challenge selector feature"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/code-snippet-database/feature.json",
  "description": "Read code snippet database feature"
}

🔧 Tool: Bash
Input: {
  "command": "cat /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/notifications-system/feature.json",
  "description": "Read notifications system feature"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/.automaker/features/ | tail -30",
  "description": "List remaining features in the features directory"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/33b3ziz/Side-Projects/speedramming/.automaker/features -type d -name \"*achievement*\" -o -type d -name \"*badge*\" -o -type d -name \"*gamif*\"",
  "description": "Find all achievement/gamification-related features"
}

Now I have a comprehensive understanding of the codebase. This is a TanStack Start (React-based) project called "CodeType" - a programming language typing trainer. The project is in an early phase with no source code yet, just specifications.

Let me start implementing the achievement definition system. First, let me check if there's any existing source structure:

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/",
  "description": "List root directory contents"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/package.json",
  "path": "/Users/33b3ziz/Side-Projects/speedramming"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.ts",
  "path": "/Users/33b3ziz/Side-Projects/speedramming"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/package.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/features/achievement-definition-system/feature.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/.automaker/app_spec.txt"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Set up project source structure (src/config, src/types directories)",
      "status": "in_progress",
      "activeForm": "Setting up project source structure"
    },
    {
      "content": "Create TypeScript types/interfaces for achievements",
      "status": "pending",
      "activeForm": "Creating TypeScript types/interfaces for achievements"
    },
    {
      "content": "Create achievement definitions configuration",
      "status": "pending",
      "activeForm": "Creating achievement definitions configuration"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification test and confirm feature works",
      "status": "pending",
      "activeForm": "Running verification test"
    },
    {
      "content": "Clean up test file after verification",
      "status": "pending",
      "activeForm": "Cleaning up test file"
    }
  ]
}

Now I understand the project structure. I need to create the source directory structure and implement the achievement definition system. Let me start by creating the necessary directories and files:

🔧 Tool: Bash
Input: {
  "command": "mkdir -p /Users/33b3ziz/Side-Projects/speedramming/src/config && mkdir -p /Users/33b3ziz/Side-Projects/speedramming/src/types && ls -la /Users/33b3ziz/Side-Projects/speedramming/src/",
  "description": "Create src/config and src/types directories"
}

The directories already exist. Let me check if there are any existing files in these directories:

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/src/config/ /Users/33b3ziz/Side-Projects/speedramming/src/types/ /Users/33b3ziz/Side-Projects/speedramming/src/lib/",
  "description": "Check existing files in src directories"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*",
  "path": "/Users/33b3ziz/Side-Projects/speedramming"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Set up project source structure (src/config, src/types directories)",
      "status": "completed",
      "activeForm": "Setting up project source structure"
    },
    {
      "content": "Create TypeScript types/interfaces for achievements",
      "status": "in_progress",
      "activeForm": "Creating TypeScript types/interfaces for achievements"
    },
    {
      "content": "Create achievement definitions configuration",
      "status": "pending",
      "activeForm": "Creating achievement definitions configuration"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification test and confirm feature works",
      "status": "pending",
      "activeForm": "Running verification test"
    },
    {
      "content": "Clean up test file after verification",
      "status": "pending",
      "activeForm": "Cleaning up test file"
    }
  ]
}

The directories are empty. Now let me create the TypeScript types/interfaces for the achievement system first:

🔧 Tool: Write
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/src/types/achievements.ts",
  "content": "/**\n * Achievement Definition Types\n *\n * This module defines the TypeScript interfaces and types for the achievement\n * definition system. It supports various achievement types including speed,\n * accuracy, consistency, and specific code patterns.\n */\n\n/**\n * Categories of achievements available in the system\n */\nexport enum AchievementCategory {\n  SPEED = \"speed\",\n  ACCURACY = \"accuracy\",\n  CONSISTENCY = \"consistency\",\n  CODE_PATTERN = \"code_pattern\",\n  MILESTONE = \"milestone\",\n  SPECIAL = \"special\",\n}\n\n/**\n * Difficulty tiers for achievements\n */\nexport enum AchievementTier {\n  BRONZE = \"bronze\",\n  SILVER = \"silver\",\n  GOLD = \"gold\",\n  PLATINUM = \"platinum\",\n  DIAMOND = \"diamond\",\n}\n\n/**\n * Programming languages supported for language-specific achievements\n */\nexport enum ProgrammingLanguage {\n  JAVASCRIPT = \"javascript\",\n  TYPESCRIPT = \"typescript\",\n  PYTHON = \"python\",\n  ALL = \"all\",\n}\n\n/**\n * Difficulty levels for difficulty-specific achievements\n */\nexport enum DifficultyLevel {\n  BEGINNER = \"beginner\",\n  INTERMEDIATE = \"intermediate\",\n  ADVANCED = \"advanced\",\n  HARDCORE = \"hardcore\",\n  ANY = \"any\",\n}\n\n/**\n * Types of criteria operators for achievement evaluation\n */\nexport enum CriteriaOperator {\n  GREATER_THAN = \"gt\",\n  GREATER_THAN_OR_EQUAL = \"gte\",\n  LESS_THAN = \"lt\",\n  LESS_THAN_OR_EQUAL = \"lte\",\n  EQUAL = \"eq\",\n  NOT_EQUAL = \"neq\",\n}\n\n/**\n * Metrics that can be used as criteria for achievements\n */\nexport enum AchievementMetric {\n  WPM = \"wpm\",\n  ACCURACY = \"accuracy\",\n  SYMBOL_ACCURACY = \"symbol_accuracy\",\n  KEYWORD_ACCURACY = \"keyword_accuracy\",\n  TESTS_COMPLETED = \"tests_completed\",\n  PERFECT_TESTS = \"perfect_tests\",\n  CONSECUTIVE_DAYS = \"consecutive_days\",\n  TOTAL_CHARACTERS = \"total_characters\",\n  TOTAL_TIME_SECONDS = \"total_time_seconds\",\n  NO_BACKSPACE = \"no_backspace\",\n  NO_ERRORS = \"no_errors\",\n  LANGUAGE_TESTS = \"language_tests\",\n  DIFFICULTY_TESTS = \"difficulty_tests\",\n}\n\n/**\n * Single criterion for achievement evaluation\n */\nexport interface AchievementCriterion {\n  /** The metric to evaluate */\n  metric: AchievementMetric;\n  /** The comparison operator */\n  operator: CriteriaOperator;\n  /** The value to compare against */\n  value: number | boolean;\n  /** Optional: specific language requirement */\n  language?: ProgrammingLanguage;\n  /** Optional: specific difficulty requirement */\n  difficulty?: DifficultyLevel;\n}\n\n/**\n * Badge icon configuration\n */\nexport interface BadgeIcon {\n  /** Icon name/identifier (e.g., for icon library or custom SVG) */\n  name: string;\n  /** Primary color for the badge */\n  primaryColor: string;\n  /** Secondary/accent color for the badge */\n  secondaryColor: string;\n  /** Optional: custom SVG path if not using icon library */\n  customSvgPath?: string;\n}\n\n/**\n * Milestone definition for progressive achievements\n */\nexport interface AchievementMilestone {\n  /** Unique identifier for the milestone */\n  id: string;\n  /** Required value to reach this milestone */\n  threshold: number;\n  /** Points awarded for reaching this milestone */\n  points: number;\n  /** Tier of this milestone */\n  tier: AchievementTier;\n  /** Display name for this milestone level */\n  displayName: string;\n}\n\n/**\n * Complete achievement definition\n */\nexport interface AchievementDefinition {\n  /** Unique identifier for the achievement */\n  id: string;\n  /** Display name shown to users */\n  name: string;\n  /** Detailed description of how to earn the achievement */\n  description: string;\n  /** Short hint for users on how to unlock */\n  hint: string;\n  /** Category of the achievement */\n  category: AchievementCategory;\n  /** Badge icon configuration */\n  badge: BadgeIcon;\n  /** Base points awarded for earning this achievement */\n  basePoints: number;\n  /** Tier/rarity of the achievement */\n  tier: AchievementTier;\n  /** Criteria that must be met to earn the achievement */\n  criteria: AchievementCriterion[];\n  /** Whether all criteria must be met (AND) or any (OR) */\n  criteriaMode: \"all\" | \"any\";\n  /** Optional: Language-specific achievement */\n  language?: ProgrammingLanguage;\n  /** Optional: Difficulty-specific achievement */\n  difficulty?: DifficultyLevel;\n  /** Optional: Milestones for progressive achievements */\n  milestones?: AchievementMilestone[];\n  /** Whether this achievement is hidden until unlocked */\n  isSecret: boolean;\n  /** Whether this achievement can be earned multiple times */\n  isRepeatable: boolean;\n  /** Optional: Maximum times this can be earned (for repeatable achievements) */\n  maxRepeats?: number;\n  /** Order for display purposes */\n  displayOrder: number;\n  /** Whether this achievement is currently active/earnable */\n  isActive: boolean;\n}\n\n/**\n * Configuration for a group of related achievements\n */\nexport interface AchievementGroup {\n  /** Unique identifier for the group */\n  id: string;\n  /** Display name for the group */\n  name: string;\n  /** Description of the achievement group */\n  description: string;\n  /** Category of achievements in this group */\n  category: AchievementCategory;\n  /** IDs of achievements in this group */\n  achievementIds: string[];\n  /** Order for display purposes */\n  displayOrder: number;\n}\n\n/**\n * User's progress towards an achievement\n */\nexport interface AchievementProgress {\n  /** Achievement ID */\n  achievementId: string;\n  /** Current progress values for each criterion */\n  criteriaProgress: Record<string, number | boolean>;\n  /** Overall completion percentage (0-100) */\n  completionPercentage: number;\n  /** Current milestone reached (for progressive achievements) */\n  currentMilestoneId?: string;\n  /** Whether the achievement has been earned */\n  isEarned: boolean;\n  /** Timestamp when earned (if earned) */\n  earnedAt?: Date;\n  /** Number of times earned (for repeatable achievements) */\n  timesEarned: number;\n}\n\n/**\n * Complete achievement configuration for the application\n */\nexport interface AchievementConfig {\n  /** Version of the achievement configuration */\n  version: string;\n  /** All achievement definitions */\n  achievements: AchievementDefinition[];\n  /** Achievement groups for organization */\n  groups: AchievementGroup[];\n  /** Point multipliers for different tiers */\n  tierMultipliers: Record<AchievementTier, number>;\n}\n\n/**\n * Type guard to check if a value is a valid AchievementCategory\n */\nexport function isAchievementCategory(value: string): value is AchievementCategory {\n  return Object.values(AchievementCategory).includes(value as AchievementCategory);\n}\n\n/**\n * Type guard to check if a value is a valid AchievementTier\n */\nexport function isAchievementTier(value: string): value is AchievementTier {\n  return Object.values(AchievementTier).includes(value as AchievementTier);\n}\n\n/**\n * Type guard to check if a value is a valid AchievementMetric\n */\nexport function isAchievementMetric(value: string): value is AchievementMetric {\n  return Object.values(AchievementMetric).includes(value as AchievementMetric);\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Set up project source structure (src/config, src/types directories)",
      "status": "completed",
      "activeForm": "Setting up project source structure"
    },
    {
      "content": "Create TypeScript types/interfaces for achievements",
      "status": "completed",
      "activeForm": "Creating TypeScript types/interfaces for achievements"
    },
    {
      "content": "Create achievement definitions configuration",
      "status": "in_progress",
      "activeForm": "Creating achievement definitions configuration"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification test and confirm feature works",
      "status": "pending",
      "activeForm": "Running verification test"
    },
    {
      "content": "Clean up test file after verification",
      "status": "pending",
      "activeForm": "Cleaning up test file"
    }
  ]
}

Now let me create the achievement definitions configuration with all the different achievement types:

🔧 Tool: Write
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/src/config/achievements.ts",
  "content": "/**\n * Achievement Definitions Configuration\n *\n * This module contains all achievement definitions for the CodeType application.\n * Achievements are organized by category and support various types including\n * speed, accuracy, consistency, and specific code patterns.\n */\n\nimport {\n  AchievementCategory,\n  AchievementConfig,\n  AchievementDefinition,\n  AchievementGroup,\n  AchievementMetric,\n  AchievementTier,\n  CriteriaOperator,\n  DifficultyLevel,\n  ProgrammingLanguage,\n} from \"../types/achievements\";\n\n// =============================================================================\n// Badge Color Palette\n// =============================================================================\n\nconst BADGE_COLORS = {\n  bronze: { primary: \"#CD7F32\", secondary: \"#8B4513\" },\n  silver: { primary: \"#C0C0C0\", secondary: \"#808080\" },\n  gold: { primary: \"#FFD700\", secondary: \"#DAA520\" },\n  platinum: { primary: \"#E5E4E2\", secondary: \"#B0C4DE\" },\n  diamond: { primary: \"#B9F2FF\", secondary: \"#00BFFF\" },\n  speed: { primary: \"#FF6B6B\", secondary: \"#EE5A5A\" },\n  accuracy: { primary: \"#4ECDC4\", secondary: \"#45B7AA\" },\n  consistency: { primary: \"#9B59B6\", secondary: \"#8E44AD\" },\n  codePattern: { primary: \"#3498DB\", secondary: \"#2980B9\" },\n  milestone: { primary: \"#F39C12\", secondary: \"#E67E22\" },\n  special: { primary: \"#E74C3C\", secondary: \"#C0392B\" },\n} as const;\n\n// =============================================================================\n// Speed Achievements\n// =============================================================================\n\nconst speedAchievements: AchievementDefinition[] = [\n  // WPM Milestone Achievements\n  {\n    id: \"speed-beginner\",\n    name: \"Keyboard Apprentice\",\n    description: \"Reach 30 WPM in any typing test\",\n    hint: \"Focus on accuracy first, speed will follow\",\n    category: AchievementCategory.SPEED,\n    badge: {\n      name: \"speedometer\",\n      primaryColor: BADGE_COLORS.bronze.primary,\n      secondaryColor: BADGE_COLORS.bronze.secondary,\n    },\n    basePoints: 50,\n    tier: AchievementTier.BRONZE,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 30,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 100,\n    isActive: true,\n  },\n  {\n    id: \"speed-intermediate\",\n    name: \"Swift Coder\",\n    description: \"Reach 50 WPM in any typing test\",\n    hint: \"Practice makes perfect\",\n    category: AchievementCategory.SPEED,\n    badge: {\n      name: \"speedometer\",\n      primaryColor: BADGE_COLORS.silver.primary,\n      secondaryColor: BADGE_COLORS.silver.secondary,\n    },\n    basePoints: 100,\n    tier: AchievementTier.SILVER,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 50,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 101,\n    isActive: true,\n  },\n  {\n    id: \"speed-advanced\",\n    name: \"Lightning Fingers\",\n    description: \"Reach 75 WPM in any typing test\",\n    hint: \"You're getting fast!\",\n    category: AchievementCategory.SPEED,\n    badge: {\n      name: \"lightning\",\n      primaryColor: BADGE_COLORS.gold.primary,\n      secondaryColor: BADGE_COLORS.gold.secondary,\n    },\n    basePoints: 200,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 75,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 102,\n    isActive: true,\n  },\n  {\n    id: \"speed-expert\",\n    name: \"Code Speedster\",\n    description: \"Reach 100 WPM in any typing test\",\n    hint: \"Elite typing speed achieved\",\n    category: AchievementCategory.SPEED,\n    badge: {\n      name: \"rocket\",\n      primaryColor: BADGE_COLORS.platinum.primary,\n      secondaryColor: BADGE_COLORS.platinum.secondary,\n    },\n    basePoints: 400,\n    tier: AchievementTier.PLATINUM,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 100,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 103,\n    isActive: true,\n  },\n  {\n    id: \"speed-master\",\n    name: \"Speed Demon\",\n    description: \"Reach 125 WPM in any typing test\",\n    hint: \"Legendary typing speed\",\n    category: AchievementCategory.SPEED,\n    badge: {\n      name: \"fire\",\n      primaryColor: BADGE_COLORS.diamond.primary,\n      secondaryColor: BADGE_COLORS.diamond.secondary,\n    },\n    basePoints: 800,\n    tier: AchievementTier.DIAMOND,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 125,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 104,\n    isActive: true,\n  },\n  // Language-specific speed achievements\n  {\n    id: \"speed-js-master\",\n    name: \"JavaScript Speedster\",\n    description: \"Reach 80 WPM on a JavaScript snippet\",\n    hint: \"Master the language of the web\",\n    category: AchievementCategory.SPEED,\n    badge: {\n      name: \"javascript\",\n      primaryColor: \"#F7DF1E\",\n      secondaryColor: \"#323330\",\n    },\n    basePoints: 250,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 80,\n        language: ProgrammingLanguage.JAVASCRIPT,\n      },\n    ],\n    criteriaMode: \"all\",\n    language: ProgrammingLanguage.JAVASCRIPT,\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 110,\n    isActive: true,\n  },\n  {\n    id: \"speed-ts-master\",\n    name: \"TypeScript Tornado\",\n    description: \"Reach 80 WPM on a TypeScript snippet\",\n    hint: \"Types won't slow you down\",\n    category: AchievementCategory.SPEED,\n    badge: {\n      name: \"typescript\",\n      primaryColor: \"#3178C6\",\n      secondaryColor: \"#235A97\",\n    },\n    basePoints: 250,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 80,\n        language: ProgrammingLanguage.TYPESCRIPT,\n      },\n    ],\n    criteriaMode: \"all\",\n    language: ProgrammingLanguage.TYPESCRIPT,\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 111,\n    isActive: true,\n  },\n  {\n    id: \"speed-py-master\",\n    name: \"Python Performer\",\n    description: \"Reach 80 WPM on a Python snippet\",\n    hint: \"Slither through the code\",\n    category: AchievementCategory.SPEED,\n    badge: {\n      name: \"python\",\n      primaryColor: \"#3776AB\",\n      secondaryColor: \"#FFD43B\",\n    },\n    basePoints: 250,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 80,\n        language: ProgrammingLanguage.PYTHON,\n      },\n    ],\n    criteriaMode: \"all\",\n    language: ProgrammingLanguage.PYTHON,\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 112,\n    isActive: true,\n  },\n];\n\n// =============================================================================\n// Accuracy Achievements\n// =============================================================================\n\nconst accuracyAchievements: AchievementDefinition[] = [\n  {\n    id: \"accuracy-perfect\",\n    name: \"Perfectionist\",\n    description: \"Complete a typing test with 100% accuracy\",\n    hint: \"Every character counts\",\n    category: AchievementCategory.ACCURACY,\n    badge: {\n      name: \"target\",\n      primaryColor: BADGE_COLORS.accuracy.primary,\n      secondaryColor: BADGE_COLORS.accuracy.secondary,\n    },\n    basePoints: 150,\n    tier: AchievementTier.SILVER,\n    criteria: [\n      {\n        metric: AchievementMetric.ACCURACY,\n        operator: CriteriaOperator.EQUAL,\n        value: 100,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: true,\n    maxRepeats: 100,\n    displayOrder: 200,\n    isActive: true,\n  },\n  {\n    id: \"accuracy-no-backspace\",\n    name: \"No Looking Back\",\n    description: \"Complete a test without using backspace\",\n    hint: \"Confidence is key\",\n    category: AchievementCategory.ACCURACY,\n    badge: {\n      name: \"arrow-right\",\n      primaryColor: BADGE_COLORS.gold.primary,\n      secondaryColor: BADGE_COLORS.gold.secondary,\n    },\n    basePoints: 300,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.NO_BACKSPACE,\n        operator: CriteriaOperator.EQUAL,\n        value: true,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: true,\n    maxRepeats: 50,\n    displayOrder: 201,\n    isActive: true,\n  },\n  {\n    id: \"accuracy-flawless\",\n    name: \"Flawless Victory\",\n    description: \"Complete a test with 100% accuracy and no backspace\",\n    hint: \"The ultimate precision challenge\",\n    category: AchievementCategory.ACCURACY,\n    badge: {\n      name: \"crown\",\n      primaryColor: BADGE_COLORS.diamond.primary,\n      secondaryColor: BADGE_COLORS.diamond.secondary,\n    },\n    basePoints: 500,\n    tier: AchievementTier.DIAMOND,\n    criteria: [\n      {\n        metric: AchievementMetric.ACCURACY,\n        operator: CriteriaOperator.EQUAL,\n        value: 100,\n      },\n      {\n        metric: AchievementMetric.NO_BACKSPACE,\n        operator: CriteriaOperator.EQUAL,\n        value: true,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: true,\n    maxRepeats: 25,\n    displayOrder: 202,\n    isActive: true,\n  },\n  {\n    id: \"accuracy-symbol-master\",\n    name: \"Symbol Surgeon\",\n    description: \"Achieve 100% accuracy on code symbols ({}, [], =>, etc.)\",\n    hint: \"Master the special characters\",\n    category: AchievementCategory.ACCURACY,\n    badge: {\n      name: \"brackets\",\n      primaryColor: BADGE_COLORS.platinum.primary,\n      secondaryColor: BADGE_COLORS.platinum.secondary,\n    },\n    basePoints: 350,\n    tier: AchievementTier.PLATINUM,\n    criteria: [\n      {\n        metric: AchievementMetric.SYMBOL_ACCURACY,\n        operator: CriteriaOperator.EQUAL,\n        value: 100,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: true,\n    maxRepeats: 50,\n    displayOrder: 203,\n    isActive: true,\n  },\n  {\n    id: \"accuracy-keyword-master\",\n    name: \"Keyword Commander\",\n    description: \"Achieve 100% accuracy on language keywords\",\n    hint: \"Know your reserved words\",\n    category: AchievementCategory.ACCURACY,\n    badge: {\n      name: \"key\",\n      primaryColor: BADGE_COLORS.gold.primary,\n      secondaryColor: BADGE_COLORS.gold.secondary,\n    },\n    basePoints: 250,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.KEYWORD_ACCURACY,\n        operator: CriteriaOperator.EQUAL,\n        value: 100,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: true,\n    maxRepeats: 50,\n    displayOrder: 204,\n    isActive: true,\n  },\n  // Progressive accuracy achievements\n  {\n    id: \"accuracy-high-90\",\n    name: \"Precision Coder\",\n    description: \"Complete 10 tests with 90%+ accuracy\",\n    hint: \"Consistency in accuracy\",\n    category: AchievementCategory.ACCURACY,\n    badge: {\n      name: \"check-circle\",\n      primaryColor: BADGE_COLORS.silver.primary,\n      secondaryColor: BADGE_COLORS.silver.secondary,\n    },\n    basePoints: 200,\n    tier: AchievementTier.SILVER,\n    criteria: [\n      {\n        metric: AchievementMetric.PERFECT_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 10,\n      },\n    ],\n    criteriaMode: \"all\",\n    milestones: [\n      { id: \"acc-90-5\", threshold: 5, points: 50, tier: AchievementTier.BRONZE, displayName: \"5 High Accuracy Tests\" },\n      { id: \"acc-90-10\", threshold: 10, points: 100, tier: AchievementTier.SILVER, displayName: \"10 High Accuracy Tests\" },\n      { id: \"acc-90-25\", threshold: 25, points: 200, tier: AchievementTier.GOLD, displayName: \"25 High Accuracy Tests\" },\n      { id: \"acc-90-50\", threshold: 50, points: 400, tier: AchievementTier.PLATINUM, displayName: \"50 High Accuracy Tests\" },\n      { id: \"acc-90-100\", threshold: 100, points: 800, tier: AchievementTier.DIAMOND, displayName: \"100 High Accuracy Tests\" },\n    ],\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 210,\n    isActive: true,\n  },\n];\n\n// =============================================================================\n// Consistency Achievements\n// =============================================================================\n\nconst consistencyAchievements: AchievementDefinition[] = [\n  {\n    id: \"consistency-streak-3\",\n    name: \"Getting Started\",\n    description: \"Practice for 3 consecutive days\",\n    hint: \"Build the habit\",\n    category: AchievementCategory.CONSISTENCY,\n    badge: {\n      name: \"calendar\",\n      primaryColor: BADGE_COLORS.bronze.primary,\n      secondaryColor: BADGE_COLORS.bronze.secondary,\n    },\n    basePoints: 75,\n    tier: AchievementTier.BRONZE,\n    criteria: [\n      {\n        metric: AchievementMetric.CONSECUTIVE_DAYS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 3,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 300,\n    isActive: true,\n  },\n  {\n    id: \"consistency-streak-7\",\n    name: \"Week Warrior\",\n    description: \"Practice for 7 consecutive days\",\n    hint: \"A week of dedication\",\n    category: AchievementCategory.CONSISTENCY,\n    badge: {\n      name: \"calendar-check\",\n      primaryColor: BADGE_COLORS.silver.primary,\n      secondaryColor: BADGE_COLORS.silver.secondary,\n    },\n    basePoints: 150,\n    tier: AchievementTier.SILVER,\n    criteria: [\n      {\n        metric: AchievementMetric.CONSECUTIVE_DAYS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 7,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 301,\n    isActive: true,\n  },\n  {\n    id: \"consistency-streak-30\",\n    name: \"Monthly Master\",\n    description: \"Practice for 30 consecutive days\",\n    hint: \"A month of commitment\",\n    category: AchievementCategory.CONSISTENCY,\n    badge: {\n      name: \"flame\",\n      primaryColor: BADGE_COLORS.gold.primary,\n      secondaryColor: BADGE_COLORS.gold.secondary,\n    },\n    basePoints: 500,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.CONSECUTIVE_DAYS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 30,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 302,\n    isActive: true,\n  },\n  {\n    id: \"consistency-streak-100\",\n    name: \"Century Streak\",\n    description: \"Practice for 100 consecutive days\",\n    hint: \"Legendary dedication\",\n    category: AchievementCategory.CONSISTENCY,\n    badge: {\n      name: \"trophy\",\n      primaryColor: BADGE_COLORS.diamond.primary,\n      secondaryColor: BADGE_COLORS.diamond.secondary,\n    },\n    basePoints: 2000,\n    tier: AchievementTier.DIAMOND,\n    criteria: [\n      {\n        metric: AchievementMetric.CONSECUTIVE_DAYS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 100,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 303,\n    isActive: true,\n  },\n];\n\n// =============================================================================\n// Code Pattern Achievements\n// =============================================================================\n\nconst codePatternAchievements: AchievementDefinition[] = [\n  {\n    id: \"pattern-react-component\",\n    name: \"React Rookie\",\n    description: \"Complete 5 React component typing tests\",\n    hint: \"Build UIs with speed\",\n    category: AchievementCategory.CODE_PATTERN,\n    badge: {\n      name: \"react\",\n      primaryColor: \"#61DAFB\",\n      secondaryColor: \"#20232A\",\n    },\n    basePoints: 150,\n    tier: AchievementTier.SILVER,\n    criteria: [\n      {\n        metric: AchievementMetric.LANGUAGE_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 5,\n        language: ProgrammingLanguage.JAVASCRIPT,\n      },\n    ],\n    criteriaMode: \"all\",\n    language: ProgrammingLanguage.JAVASCRIPT,\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 400,\n    isActive: true,\n  },\n  {\n    id: \"pattern-async-await\",\n    name: \"Async Ace\",\n    description: \"Complete 10 tests featuring async/await patterns\",\n    hint: \"Master asynchronous code\",\n    category: AchievementCategory.CODE_PATTERN,\n    badge: {\n      name: \"clock\",\n      primaryColor: BADGE_COLORS.codePattern.primary,\n      secondaryColor: BADGE_COLORS.codePattern.secondary,\n    },\n    basePoints: 200,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.TESTS_COMPLETED,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 10,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 401,\n    isActive: true,\n  },\n  {\n    id: \"pattern-algorithm\",\n    name: \"Algorithm Artisan\",\n    description: \"Complete 20 algorithm snippet tests\",\n    hint: \"Solve problems efficiently\",\n    category: AchievementCategory.CODE_PATTERN,\n    badge: {\n      name: \"code\",\n      primaryColor: BADGE_COLORS.platinum.primary,\n      secondaryColor: BADGE_COLORS.platinum.secondary,\n    },\n    basePoints: 400,\n    tier: AchievementTier.PLATINUM,\n    criteria: [\n      {\n        metric: AchievementMetric.TESTS_COMPLETED,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 20,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 402,\n    isActive: true,\n  },\n  // Difficulty-based achievements\n  {\n    id: \"pattern-hardcore-survivor\",\n    name: \"Hardcore Survivor\",\n    description: \"Complete a Hardcore difficulty test with 80%+ accuracy\",\n    hint: \"The ultimate challenge awaits\",\n    category: AchievementCategory.CODE_PATTERN,\n    badge: {\n      name: \"skull\",\n      primaryColor: BADGE_COLORS.special.primary,\n      secondaryColor: BADGE_COLORS.special.secondary,\n    },\n    basePoints: 500,\n    tier: AchievementTier.PLATINUM,\n    criteria: [\n      {\n        metric: AchievementMetric.ACCURACY,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 80,\n        difficulty: DifficultyLevel.HARDCORE,\n      },\n      {\n        metric: AchievementMetric.DIFFICULTY_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n        difficulty: DifficultyLevel.HARDCORE,\n      },\n    ],\n    criteriaMode: \"all\",\n    difficulty: DifficultyLevel.HARDCORE,\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 410,\n    isActive: true,\n  },\n  {\n    id: \"pattern-hardcore-master\",\n    name: \"Hardcore Master\",\n    description: \"Complete 10 Hardcore tests with 90%+ accuracy\",\n    hint: \"Dominate the hardest challenges\",\n    category: AchievementCategory.CODE_PATTERN,\n    badge: {\n      name: \"medal\",\n      primaryColor: BADGE_COLORS.diamond.primary,\n      secondaryColor: BADGE_COLORS.diamond.secondary,\n    },\n    basePoints: 1000,\n    tier: AchievementTier.DIAMOND,\n    criteria: [\n      {\n        metric: AchievementMetric.DIFFICULTY_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 10,\n        difficulty: DifficultyLevel.HARDCORE,\n      },\n    ],\n    criteriaMode: \"all\",\n    difficulty: DifficultyLevel.HARDCORE,\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 411,\n    isActive: true,\n  },\n];\n\n// =============================================================================\n// Milestone Achievements\n// =============================================================================\n\nconst milestoneAchievements: AchievementDefinition[] = [\n  {\n    id: \"milestone-first-test\",\n    name: \"First Steps\",\n    description: \"Complete your first typing test\",\n    hint: \"Every journey begins with a single keystroke\",\n    category: AchievementCategory.MILESTONE,\n    badge: {\n      name: \"star\",\n      primaryColor: BADGE_COLORS.milestone.primary,\n      secondaryColor: BADGE_COLORS.milestone.secondary,\n    },\n    basePoints: 25,\n    tier: AchievementTier.BRONZE,\n    criteria: [\n      {\n        metric: AchievementMetric.TESTS_COMPLETED,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 500,\n    isActive: true,\n  },\n  {\n    id: \"milestone-tests-10\",\n    name: \"Getting Warmed Up\",\n    description: \"Complete 10 typing tests\",\n    hint: \"Practice makes progress\",\n    category: AchievementCategory.MILESTONE,\n    badge: {\n      name: \"trending-up\",\n      primaryColor: BADGE_COLORS.bronze.primary,\n      secondaryColor: BADGE_COLORS.bronze.secondary,\n    },\n    basePoints: 100,\n    tier: AchievementTier.BRONZE,\n    criteria: [\n      {\n        metric: AchievementMetric.TESTS_COMPLETED,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 10,\n      },\n    ],\n    criteriaMode: \"all\",\n    milestones: [\n      { id: \"tests-10\", threshold: 10, points: 50, tier: AchievementTier.BRONZE, displayName: \"10 Tests\" },\n      { id: \"tests-25\", threshold: 25, points: 100, tier: AchievementTier.SILVER, displayName: \"25 Tests\" },\n      { id: \"tests-50\", threshold: 50, points: 200, tier: AchievementTier.GOLD, displayName: \"50 Tests\" },\n      { id: \"tests-100\", threshold: 100, points: 400, tier: AchievementTier.PLATINUM, displayName: \"100 Tests\" },\n      { id: \"tests-500\", threshold: 500, points: 1000, tier: AchievementTier.DIAMOND, displayName: \"500 Tests\" },\n    ],\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 501,\n    isActive: true,\n  },\n  {\n    id: \"milestone-characters-10k\",\n    name: \"Finger Marathon\",\n    description: \"Type 10,000 characters total\",\n    hint: \"Every character adds up\",\n    category: AchievementCategory.MILESTONE,\n    badge: {\n      name: \"keyboard\",\n      primaryColor: BADGE_COLORS.silver.primary,\n      secondaryColor: BADGE_COLORS.silver.secondary,\n    },\n    basePoints: 150,\n    tier: AchievementTier.SILVER,\n    criteria: [\n      {\n        metric: AchievementMetric.TOTAL_CHARACTERS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 10000,\n      },\n    ],\n    criteriaMode: \"all\",\n    milestones: [\n      { id: \"chars-10k\", threshold: 10000, points: 100, tier: AchievementTier.BRONZE, displayName: \"10K Characters\" },\n      { id: \"chars-50k\", threshold: 50000, points: 250, tier: AchievementTier.SILVER, displayName: \"50K Characters\" },\n      { id: \"chars-100k\", threshold: 100000, points: 500, tier: AchievementTier.GOLD, displayName: \"100K Characters\" },\n      { id: \"chars-500k\", threshold: 500000, points: 1000, tier: AchievementTier.PLATINUM, displayName: \"500K Characters\" },\n      { id: \"chars-1m\", threshold: 1000000, points: 2500, tier: AchievementTier.DIAMOND, displayName: \"1M Characters\" },\n    ],\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 502,\n    isActive: true,\n  },\n  {\n    id: \"milestone-time-1h\",\n    name: \"Time Investor\",\n    description: \"Spend 1 hour practicing\",\n    hint: \"Time well spent\",\n    category: AchievementCategory.MILESTONE,\n    badge: {\n      name: \"hourglass\",\n      primaryColor: BADGE_COLORS.gold.primary,\n      secondaryColor: BADGE_COLORS.gold.secondary,\n    },\n    basePoints: 200,\n    tier: AchievementTier.GOLD,\n    criteria: [\n      {\n        metric: AchievementMetric.TOTAL_TIME_SECONDS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 3600,\n      },\n    ],\n    criteriaMode: \"all\",\n    milestones: [\n      { id: \"time-1h\", threshold: 3600, points: 100, tier: AchievementTier.BRONZE, displayName: \"1 Hour\" },\n      { id: \"time-5h\", threshold: 18000, points: 250, tier: AchievementTier.SILVER, displayName: \"5 Hours\" },\n      { id: \"time-10h\", threshold: 36000, points: 500, tier: AchievementTier.GOLD, displayName: \"10 Hours\" },\n      { id: \"time-50h\", threshold: 180000, points: 1000, tier: AchievementTier.PLATINUM, displayName: \"50 Hours\" },\n      { id: \"time-100h\", threshold: 360000, points: 2500, tier: AchievementTier.DIAMOND, displayName: \"100 Hours\" },\n    ],\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 503,\n    isActive: true,\n  },\n  // Language mastery milestones\n  {\n    id: \"milestone-polyglot\",\n    name: \"Polyglot Programmer\",\n    description: \"Complete tests in all 3 supported languages\",\n    hint: \"Diversify your skills\",\n    category: AchievementCategory.MILESTONE,\n    badge: {\n      name: \"globe\",\n      primaryColor: BADGE_COLORS.platinum.primary,\n      secondaryColor: BADGE_COLORS.platinum.secondary,\n    },\n    basePoints: 300,\n    tier: AchievementTier.PLATINUM,\n    criteria: [\n      {\n        metric: AchievementMetric.LANGUAGE_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n        language: ProgrammingLanguage.JAVASCRIPT,\n      },\n      {\n        metric: AchievementMetric.LANGUAGE_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n        language: ProgrammingLanguage.TYPESCRIPT,\n      },\n      {\n        metric: AchievementMetric.LANGUAGE_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n        language: ProgrammingLanguage.PYTHON,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 510,\n    isActive: true,\n  },\n];\n\n// =============================================================================\n// Special/Secret Achievements\n// =============================================================================\n\nconst specialAchievements: AchievementDefinition[] = [\n  {\n    id: \"special-night-owl\",\n    name: \"Night Owl\",\n    description: \"Complete a test between midnight and 4 AM\",\n    hint: \"???\",\n    category: AchievementCategory.SPECIAL,\n    badge: {\n      name: \"moon\",\n      primaryColor: \"#1a1a2e\",\n      secondaryColor: \"#16213e\",\n    },\n    basePoints: 100,\n    tier: AchievementTier.SILVER,\n    criteria: [\n      {\n        metric: AchievementMetric.TESTS_COMPLETED,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: true,\n    isRepeatable: false,\n    displayOrder: 600,\n    isActive: true,\n  },\n  {\n    id: \"special-early-bird\",\n    name: \"Early Bird\",\n    description: \"Complete a test between 5 AM and 7 AM\",\n    hint: \"???\",\n    category: AchievementCategory.SPECIAL,\n    badge: {\n      name: \"sun\",\n      primaryColor: \"#FFD93D\",\n      secondaryColor: \"#FF6B6B\",\n    },\n    basePoints: 100,\n    tier: AchievementTier.SILVER,\n    criteria: [\n      {\n        metric: AchievementMetric.TESTS_COMPLETED,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: true,\n    isRepeatable: false,\n    displayOrder: 601,\n    isActive: true,\n  },\n  {\n    id: \"special-speed-accuracy\",\n    name: \"The Complete Package\",\n    description: \"Achieve 100 WPM with 100% accuracy\",\n    hint: \"Speed AND precision\",\n    category: AchievementCategory.SPECIAL,\n    badge: {\n      name: \"award\",\n      primaryColor: BADGE_COLORS.diamond.primary,\n      secondaryColor: BADGE_COLORS.diamond.secondary,\n    },\n    basePoints: 1000,\n    tier: AchievementTier.DIAMOND,\n    criteria: [\n      {\n        metric: AchievementMetric.WPM,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 100,\n      },\n      {\n        metric: AchievementMetric.ACCURACY,\n        operator: CriteriaOperator.EQUAL,\n        value: 100,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: true,\n    isRepeatable: false,\n    displayOrder: 602,\n    isActive: true,\n  },\n  {\n    id: \"special-all-difficulties\",\n    name: \"Difficulty Conqueror\",\n    description: \"Complete tests on all difficulty levels\",\n    hint: \"Master every challenge\",\n    category: AchievementCategory.SPECIAL,\n    badge: {\n      name: \"layers\",\n      primaryColor: BADGE_COLORS.platinum.primary,\n      secondaryColor: BADGE_COLORS.platinum.secondary,\n    },\n    basePoints: 400,\n    tier: AchievementTier.PLATINUM,\n    criteria: [\n      {\n        metric: AchievementMetric.DIFFICULTY_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n        difficulty: DifficultyLevel.BEGINNER,\n      },\n      {\n        metric: AchievementMetric.DIFFICULTY_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n        difficulty: DifficultyLevel.INTERMEDIATE,\n      },\n      {\n        metric: AchievementMetric.DIFFICULTY_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n        difficulty: DifficultyLevel.ADVANCED,\n      },\n      {\n        metric: AchievementMetric.DIFFICULTY_TESTS,\n        operator: CriteriaOperator.GREATER_THAN_OR_EQUAL,\n        value: 1,\n        difficulty: DifficultyLevel.HARDCORE,\n      },\n    ],\n    criteriaMode: \"all\",\n    isSecret: false,\n    isRepeatable: false,\n    displayOrder: 603,\n    isActive: true,\n  },\n];\n\n// =============================================================================\n// Achievement Groups\n// =============================================================================\n\nconst achievementGroups: AchievementGroup[] = [\n  {\n    id: \"group-speed\",\n    name: \"Speed Demons\",\n    description: \"Achievements for typing speed milestones\",\n    category: AchievementCategory.SPEED,\n    achievementIds: speedAchievements.map((a) => a.id),\n    displayOrder: 1,\n  },\n  {\n    id: \"group-accuracy\",\n    name: \"Precision Masters\",\n    description: \"Achievements for typing accuracy and error-free runs\",\n    category: AchievementCategory.ACCURACY,\n    achievementIds: accuracyAchievements.map((a) => a.id),\n    displayOrder: 2,\n  },\n  {\n    id: \"group-consistency\",\n    name: \"Dedicated Coders\",\n    description: \"Achievements for consistent practice and streaks\",\n    category: AchievementCategory.CONSISTENCY,\n    achievementIds: consistencyAchievements.map((a) => a.id),\n    displayOrder: 3,\n  },\n  {\n    id: \"group-code-patterns\",\n    name: \"Code Specialists\",\n    description: \"Achievements for specific code patterns and difficulties\",\n    category: AchievementCategory.CODE_PATTERN,\n    achievementIds: codePatternAchievements.map((a) => a.id),\n    displayOrder: 4,\n  },\n  {\n    id: \"group-milestones\",\n    name: \"Journey Markers\",\n    description: \"Achievements for reaching significant milestones\",\n    category: AchievementCategory.MILESTONE,\n    achievementIds: milestoneAchievements.map((a) => a.id),\n    displayOrder: 5,\n  },\n  {\n    id: \"group-special\",\n    name: \"Hidden Gems\",\n    description: \"Secret and special achievements\",\n    category: AchievementCategory.SPECIAL,\n    achievementIds: specialAchievements.map((a) => a.id),\n    displayOrder: 6,\n  },\n];\n\n// =============================================================================\n// Complete Achievement Configuration\n// =============================================================================\n\n/**\n * Complete achievement configuration for the CodeType application.\n * This configuration includes all achievement definitions, groups,\n * and tier multipliers.\n */\nexport const achievementConfig: AchievementConfig = {\n  version: \"1.0.0\",\n  achievements: [\n    ...speedAchievements,\n    ...accuracyAchievements,\n    ...consistencyAchievements,\n    ...codePatternAchievements,\n    ...milestoneAchievements,\n    ...specialAchievements,\n  ],\n  groups: achievementGroups,\n  tierMultipliers: {\n    [AchievementTier.BRONZE]: 1.0,\n    [AchievementTier.SILVER]: 1.5,\n    [AchievementTier.GOLD]: 2.0,\n    [AchievementTier.PLATINUM]: 3.0,\n    [AchievementTier.DIAMOND]: 5.0,\n  },\n};\n\n// =============================================================================\n// Helper Functions\n// =============================================================================\n\n/**\n * Get an achievement definition by ID\n */\nexport function getAchievementById(id: string): AchievementDefinition | undefined {\n  return achievementConfig.achievements.find((a) => a.id === id);\n}\n\n/**\n * Get all achievements in a specific category\n */\nexport function getAchievementsByCategory(\n  category: AchievementCategory\n): AchievementDefinition[] {\n  return achievementConfig.achievements.filter((a) => a.category === category);\n}\n\n/**\n * Get all achievements of a specific tier\n */\nexport function getAchievementsByTier(\n  tier: AchievementTier\n): AchievementDefinition[] {\n  return achievementConfig.achievements.filter((a) => a.tier === tier);\n}\n\n/**\n * Get all achievements for a specific language\n */\nexport function getAchievementsByLanguage(\n  language: ProgrammingLanguage\n): AchievementDefinition[] {\n  return achievementConfig.achievements.filter(\n    (a) => a.language === language || a.language === undefined\n  );\n}\n\n/**\n * Get all active achievements\n */\nexport function getActiveAchievements(): AchievementDefinition[] {\n  return achievementConfig.achievements.filter((a) => a.isActive);\n}\n\n/**\n * Get all secret achievements\n */\nexport function getSecretAchievements(): AchievementDefinition[] {\n  return achievementConfig.achievements.filter((a) => a.isSecret);\n}\n\n/**\n * Get all non-secret achievements\n */\nexport function getVisibleAchievements(): AchievementDefinition[] {\n  return achievementConfig.achievements.filter((a) => !a.isSecret);\n}\n\n/**\n * Get an achievement group by ID\n */\nexport function getAchievementGroupById(id: string): AchievementGroup | undefined {\n  return achievementConfig.groups.find((g) => g.id === id);\n}\n\n/**\n * Get all achievements in a group\n */\nexport function getAchievementsInGroup(groupId: string): AchievementDefinition[] {\n  const group = getAchievementGroupById(groupId);\n  if (!group) return [];\n  return group.achievementIds\n    .map((id) => getAchievementById(id))\n    .filter((a): a is AchievementDefinition => a !== undefined);\n}\n\n/**\n * Calculate total points for a given tier with multiplier\n */\nexport function calculateTierPoints(basePoints: number, tier: AchievementTier): number {\n  return Math.round(basePoints * achievementConfig.tierMultipliers[tier]);\n}\n\n/**\n * Get achievements sorted by display order\n */\nexport function getSortedAchievements(): AchievementDefinition[] {\n  return [...achievementConfig.achievements].sort(\n    (a, b) => a.displayOrder - b.displayOrder\n  );\n}\n\n/**\n * Get total number of achievements\n */\nexport function getTotalAchievementCount(): number {\n  return achievementConfig.achievements.length;\n}\n\n/**\n * Get total possible points from all achievements\n */\nexport function getTotalPossiblePoints(): number {\n  return achievementConfig.achievements.reduce((total, achievement) => {\n    if (achievement.milestones && achievement.milestones.length > 0) {\n      // For progressive achievements, use the highest milestone points\n      const maxMilestonePoints = Math.max(\n        ...achievement.milestones.map((m) => m.points)\n      );\n      return total + maxMilestonePoints;\n    }\n    return total + calculateTierPoints(achievement.basePoints, achievement.tier);\n  }, 0);\n}\n"
}

Now let me also create an index file to export everything cleanly:

🔧 Tool: Write
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/src/types/index.ts",
  "content": "/**\n * Types Index\n *\n * Central export point for all TypeScript types and interfaces.\n */\n\nexport * from \"./achievements\";\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/src/config/index.ts",
  "content": "/**\n * Config Index\n *\n * Central export point for all configuration modules.\n */\n\nexport * from \"./achievements\";\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Set up project source structure (src/config, src/types directories)",
      "status": "completed",
      "activeForm": "Setting up project source structure"
    },
    {
      "content": "Create TypeScript types/interfaces for achievements",
      "status": "completed",
      "activeForm": "Creating TypeScript types/interfaces for achievements"
    },
    {
      "content": "Create achievement definitions configuration",
      "status": "completed",
      "activeForm": "Creating achievement definitions configuration"
    },
    {
      "content": "Create Playwright verification test",
      "status": "in_progress",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification test and confirm feature works",
      "status": "pending",
      "activeForm": "Running verification test"
    },
    {
      "content": "Clean up test file after verification",
      "status": "pending",
      "activeForm": "Cleaning up test file"
    }
  ]
}

Now let me set up TypeScript configuration and create the Playwright verification test. First, let me check if there's a tsconfig.json:

🔧 Tool: Glob
Input: {
  "pattern": "tsconfig*.json",
  "path": "/Users/33b3ziz/Side-Projects/speedramming"
}

🔧 Tool: Glob
Input: {
  "pattern": "playwright.config.*",
  "path": "/Users/33b3ziz/Side-Projects/speedramming"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/tsconfig.json"
}

The tsconfig has path aliases configured. Now let me install dependencies and create a Playwright test. First, let me check if node_modules exists:

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/node_modules/ | head -5",
  "description": "Check if node_modules exists"
}

Good, node_modules exists. Now let me create the Playwright configuration and the verification test:

🔧 Tool: Write
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/playwright.config.ts",
  "content": "import { defineConfig } from \"@playwright/test\";\n\nexport default defineConfig({\n  testDir: \"./tests\",\n  fullyParallel: true,\n  forbidOnly: !!process.env.CI,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 1 : undefined,\n  reporter: \"html\",\n  use: {\n    trace: \"on-first-retry\",\n  },\n});\n"
}

🔧 Tool: Bash
Input: {
  "command": "mkdir -p /Users/33b3ziz/Side-Projects/speedramming/tests",
  "description": "Create tests directory"
}

🔧 Tool: Write
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/tests/achievement-definition-system.spec.ts",
  "content": "/**\n * Achievement Definition System Verification Test\n *\n * This test verifies that the achievement definition system is correctly\n * implemented and all configurations are valid.\n */\n\nimport { test, expect } from \"@playwright/test\";\nimport {\n  achievementConfig,\n  getAchievementById,\n  getAchievementsByCategory,\n  getAchievementsByTier,\n  getAchievementsByLanguage,\n  getActiveAchievements,\n  getSecretAchievements,\n  getVisibleAchievements,\n  getAchievementGroupById,\n  getAchievementsInGroup,\n  calculateTierPoints,\n  getSortedAchievements,\n  getTotalAchievementCount,\n  getTotalPossiblePoints,\n} from \"../src/config/achievements\";\nimport {\n  AchievementCategory,\n  AchievementTier,\n  ProgrammingLanguage,\n  isAchievementCategory,\n  isAchievementTier,\n  isAchievementMetric,\n  AchievementMetric,\n} from \"../src/types/achievements\";\n\ntest.describe(\"Achievement Definition System\", () => {\n  test(\"should have a valid configuration version\", () => {\n    expect(achievementConfig.version).toBe(\"1.0.0\");\n  });\n\n  test(\"should have achievements defined\", () => {\n    expect(achievementConfig.achievements).toBeDefined();\n    expect(achievementConfig.achievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have achievement groups defined\", () => {\n    expect(achievementConfig.groups).toBeDefined();\n    expect(achievementConfig.groups.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have tier multipliers defined\", () => {\n    expect(achievementConfig.tierMultipliers).toBeDefined();\n    expect(achievementConfig.tierMultipliers[AchievementTier.BRONZE]).toBe(1.0);\n    expect(achievementConfig.tierMultipliers[AchievementTier.SILVER]).toBe(1.5);\n    expect(achievementConfig.tierMultipliers[AchievementTier.GOLD]).toBe(2.0);\n    expect(achievementConfig.tierMultipliers[AchievementTier.PLATINUM]).toBe(3.0);\n    expect(achievementConfig.tierMultipliers[AchievementTier.DIAMOND]).toBe(5.0);\n  });\n});\n\ntest.describe(\"Achievement Definitions Validation\", () => {\n  test(\"all achievements should have unique IDs\", () => {\n    const ids = achievementConfig.achievements.map((a) => a.id);\n    const uniqueIds = new Set(ids);\n    expect(ids.length).toBe(uniqueIds.size);\n  });\n\n  test(\"all achievements should have required fields\", () => {\n    for (const achievement of achievementConfig.achievements) {\n      expect(achievement.id).toBeTruthy();\n      expect(achievement.name).toBeTruthy();\n      expect(achievement.description).toBeTruthy();\n      expect(achievement.hint).toBeTruthy();\n      expect(achievement.category).toBeTruthy();\n      expect(achievement.badge).toBeTruthy();\n      expect(achievement.badge.name).toBeTruthy();\n      expect(achievement.badge.primaryColor).toBeTruthy();\n      expect(achievement.badge.secondaryColor).toBeTruthy();\n      expect(typeof achievement.basePoints).toBe(\"number\");\n      expect(achievement.basePoints).toBeGreaterThan(0);\n      expect(achievement.tier).toBeTruthy();\n      expect(achievement.criteria).toBeDefined();\n      expect(achievement.criteria.length).toBeGreaterThan(0);\n      expect(achievement.criteriaMode).toMatch(/^(all|any)$/);\n      expect(typeof achievement.isSecret).toBe(\"boolean\");\n      expect(typeof achievement.isRepeatable).toBe(\"boolean\");\n      expect(typeof achievement.displayOrder).toBe(\"number\");\n      expect(typeof achievement.isActive).toBe(\"boolean\");\n    }\n  });\n\n  test(\"all achievements should have valid categories\", () => {\n    for (const achievement of achievementConfig.achievements) {\n      expect(isAchievementCategory(achievement.category)).toBe(true);\n    }\n  });\n\n  test(\"all achievements should have valid tiers\", () => {\n    for (const achievement of achievementConfig.achievements) {\n      expect(isAchievementTier(achievement.tier)).toBe(true);\n    }\n  });\n\n  test(\"all criteria should have valid metrics\", () => {\n    for (const achievement of achievementConfig.achievements) {\n      for (const criterion of achievement.criteria) {\n        expect(isAchievementMetric(criterion.metric)).toBe(true);\n      }\n    }\n  });\n});\n\ntest.describe(\"Achievement Categories\", () => {\n  test(\"should have speed achievements\", () => {\n    const speedAchievements = getAchievementsByCategory(AchievementCategory.SPEED);\n    expect(speedAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have accuracy achievements\", () => {\n    const accuracyAchievements = getAchievementsByCategory(AchievementCategory.ACCURACY);\n    expect(accuracyAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have consistency achievements\", () => {\n    const consistencyAchievements = getAchievementsByCategory(AchievementCategory.CONSISTENCY);\n    expect(consistencyAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have code pattern achievements\", () => {\n    const codePatternAchievements = getAchievementsByCategory(AchievementCategory.CODE_PATTERN);\n    expect(codePatternAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have milestone achievements\", () => {\n    const milestoneAchievements = getAchievementsByCategory(AchievementCategory.MILESTONE);\n    expect(milestoneAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have special achievements\", () => {\n    const specialAchievements = getAchievementsByCategory(AchievementCategory.SPECIAL);\n    expect(specialAchievements.length).toBeGreaterThan(0);\n  });\n});\n\ntest.describe(\"Achievement Tiers\", () => {\n  test(\"should have bronze tier achievements\", () => {\n    const bronzeAchievements = getAchievementsByTier(AchievementTier.BRONZE);\n    expect(bronzeAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have silver tier achievements\", () => {\n    const silverAchievements = getAchievementsByTier(AchievementTier.SILVER);\n    expect(silverAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have gold tier achievements\", () => {\n    const goldAchievements = getAchievementsByTier(AchievementTier.GOLD);\n    expect(goldAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have platinum tier achievements\", () => {\n    const platinumAchievements = getAchievementsByTier(AchievementTier.PLATINUM);\n    expect(platinumAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have diamond tier achievements\", () => {\n    const diamondAchievements = getAchievementsByTier(AchievementTier.DIAMOND);\n    expect(diamondAchievements.length).toBeGreaterThan(0);\n  });\n});\n\ntest.describe(\"Language-Specific Achievements\", () => {\n  test(\"should have JavaScript achievements\", () => {\n    const jsAchievements = getAchievementsByLanguage(ProgrammingLanguage.JAVASCRIPT);\n    expect(jsAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have TypeScript achievements\", () => {\n    const tsAchievements = getAchievementsByLanguage(ProgrammingLanguage.TYPESCRIPT);\n    expect(tsAchievements.length).toBeGreaterThan(0);\n  });\n\n  test(\"should have Python achievements\", () => {\n    const pyAchievements = getAchievementsByLanguage(ProgrammingLanguage.PYTHON);\n    expect(pyAchievements.length).toBeGreaterThan(0);\n  });\n});\n\ntest.describe(\"Helper Functions\", () => {\n  test(\"getAchievementById should return correct achievement\", () => {\n    const achievement = getAchievementById(\"speed-beginner\");\n    expect(achievement).toBeDefined();\n    expect(achievement?.name).toBe(\"Keyboard Apprentice\");\n  });\n\n  test(\"getAchievementById should return undefined for non-existent ID\", () => {\n    const achievement = getAchievementById(\"non-existent-id\");\n    expect(achievement).toBeUndefined();\n  });\n\n  test(\"getActiveAchievements should return only active achievements\", () => {\n    const activeAchievements = getActiveAchievements();\n    for (const achievement of activeAchievements) {\n      expect(achievement.isActive).toBe(true);\n    }\n  });\n\n  test(\"getSecretAchievements should return only secret achievements\", () => {\n    const secretAchievements = getSecretAchievements();\n    expect(secretAchievements.length).toBeGreaterThan(0);\n    for (const achievement of secretAchievements) {\n      expect(achievement.isSecret).toBe(true);\n    }\n  });\n\n  test(\"getVisibleAchievements should return only non-secret achievements\", () => {\n    const visibleAchievements = getVisibleAchievements();\n    for (const achievement of visibleAchievements) {\n      expect(achievement.isSecret).toBe(false);\n    }\n  });\n\n  test(\"calculateTierPoints should apply correct multiplier\", () => {\n    expect(calculateTierPoints(100, AchievementTier.BRONZE)).toBe(100);\n    expect(calculateTierPoints(100, AchievementTier.SILVER)).toBe(150);\n    expect(calculateTierPoints(100, AchievementTier.GOLD)).toBe(200);\n    expect(calculateTierPoints(100, AchievementTier.PLATINUM)).toBe(300);\n    expect(calculateTierPoints(100, AchievementTier.DIAMOND)).toBe(500);\n  });\n\n  test(\"getSortedAchievements should return achievements sorted by displayOrder\", () => {\n    const sorted = getSortedAchievements();\n    for (let i = 1; i < sorted.length; i++) {\n      expect(sorted[i].displayOrder).toBeGreaterThanOrEqual(sorted[i - 1].displayOrder);\n    }\n  });\n\n  test(\"getTotalAchievementCount should return correct count\", () => {\n    const count = getTotalAchievementCount();\n    expect(count).toBe(achievementConfig.achievements.length);\n  });\n\n  test(\"getTotalPossiblePoints should return a positive number\", () => {\n    const totalPoints = getTotalPossiblePoints();\n    expect(totalPoints).toBeGreaterThan(0);\n  });\n});\n\ntest.describe(\"Achievement Groups\", () => {\n  test(\"all groups should have unique IDs\", () => {\n    const ids = achievementConfig.groups.map((g) => g.id);\n    const uniqueIds = new Set(ids);\n    expect(ids.length).toBe(uniqueIds.size);\n  });\n\n  test(\"all groups should reference valid achievement IDs\", () => {\n    const allAchievementIds = new Set(achievementConfig.achievements.map((a) => a.id));\n    for (const group of achievementConfig.groups) {\n      for (const achievementId of group.achievementIds) {\n        expect(allAchievementIds.has(achievementId)).toBe(true);\n      }\n    }\n  });\n\n  test(\"getAchievementGroupById should return correct group\", () => {\n    const group = getAchievementGroupById(\"group-speed\");\n    expect(group).toBeDefined();\n    expect(group?.name).toBe(\"Speed Demons\");\n  });\n\n  test(\"getAchievementsInGroup should return achievements in the group\", () => {\n    const achievements = getAchievementsInGroup(\"group-speed\");\n    expect(achievements.length).toBeGreaterThan(0);\n    for (const achievement of achievements) {\n      expect(achievement.category).toBe(AchievementCategory.SPEED);\n    }\n  });\n});\n\ntest.describe(\"Progressive Achievements with Milestones\", () => {\n  test(\"should have achievements with milestones\", () => {\n    const achievementsWithMilestones = achievementConfig.achievements.filter(\n      (a) => a.milestones && a.milestones.length > 0\n    );\n    expect(achievementsWithMilestones.length).toBeGreaterThan(0);\n  });\n\n  test(\"milestones should have increasing thresholds\", () => {\n    const achievementsWithMilestones = achievementConfig.achievements.filter(\n      (a) => a.milestones && a.milestones.length > 0\n    );\n    for (const achievement of achievementsWithMilestones) {\n      if (achievement.milestones) {\n        for (let i = 1; i < achievement.milestones.length; i++) {\n          expect(achievement.milestones[i].threshold).toBeGreaterThan(\n            achievement.milestones[i - 1].threshold\n          );\n        }\n      }\n    }\n  });\n\n  test(\"milestones should have valid tiers\", () => {\n    const achievementsWithMilestones = achievementConfig.achievements.filter(\n      (a) => a.milestones && a.milestones.length > 0\n    );\n    for (const achievement of achievementsWithMilestones) {\n      if (achievement.milestones) {\n        for (const milestone of achievement.milestones) {\n          expect(isAchievementTier(milestone.tier)).toBe(true);\n        }\n      }\n    }\n  });\n});\n\ntest.describe(\"Type Guards\", () => {\n  test(\"isAchievementCategory should validate correctly\", () => {\n    expect(isAchievementCategory(\"speed\")).toBe(true);\n    expect(isAchievementCategory(\"accuracy\")).toBe(true);\n    expect(isAchievementCategory(\"invalid\")).toBe(false);\n  });\n\n  test(\"isAchievementTier should validate correctly\", () => {\n    expect(isAchievementTier(\"bronze\")).toBe(true);\n    expect(isAchievementTier(\"diamond\")).toBe(true);\n    expect(isAchievementTier(\"invalid\")).toBe(false);\n  });\n\n  test(\"isAchievementMetric should validate correctly\", () => {\n    expect(isAchievementMetric(\"wpm\")).toBe(true);\n    expect(isAchievementMetric(\"accuracy\")).toBe(true);\n    expect(isAchievementMetric(\"invalid\")).toBe(false);\n  });\n});\n\ntest.describe(\"Specific Achievement Verification\", () => {\n  test(\"should have no-backspace achievement\", () => {\n    const achievement = getAchievementById(\"accuracy-no-backspace\");\n    expect(achievement).toBeDefined();\n    expect(achievement?.name).toBe(\"No Looking Back\");\n    expect(achievement?.criteria[0].metric).toBe(AchievementMetric.NO_BACKSPACE);\n  });\n\n  test(\"should have perfect accuracy achievement\", () => {\n    const achievement = getAchievementById(\"accuracy-perfect\");\n    expect(achievement).toBeDefined();\n    expect(achievement?.name).toBe(\"Perfectionist\");\n    expect(achievement?.criteria[0].metric).toBe(AchievementMetric.ACCURACY);\n    expect(achievement?.criteria[0].value).toBe(100);\n  });\n\n  test(\"should have symbol accuracy achievement\", () => {\n    const achievement = getAchievementById(\"accuracy-symbol-master\");\n    expect(achievement).toBeDefined();\n    expect(achievement?.name).toBe(\"Symbol Surgeon\");\n    expect(achievement?.criteria[0].metric).toBe(AchievementMetric.SYMBOL_ACCURACY);\n  });\n\n  test(\"should have speed milestone achievements\", () => {\n    const speedBeginner = getAchievementById(\"speed-beginner\");\n    const speedExpert = getAchievementById(\"speed-expert\");\n    const speedMaster = getAchievementById(\"speed-master\");\n\n    expect(speedBeginner).toBeDefined();\n    expect(speedExpert).toBeDefined();\n    expect(speedMaster).toBeDefined();\n\n    // Verify WPM thresholds are increasing\n    const beginnerWpm = speedBeginner?.criteria[0].value as number;\n    const expertWpm = speedExpert?.criteria[0].value as number;\n    const masterWpm = speedMaster?.criteria[0].value as number;\n\n    expect(expertWpm).toBeGreaterThan(beginnerWpm);\n    expect(masterWpm).toBeGreaterThan(expertWpm);\n  });\n\n  test(\"should have consistency streak achievements\", () => {\n    const streak3 = getAchievementById(\"consistency-streak-3\");\n    const streak7 = getAchievementById(\"consistency-streak-7\");\n    const streak30 = getAchievementById(\"consistency-streak-30\");\n    const streak100 = getAchievementById(\"consistency-streak-100\");\n\n    expect(streak3).toBeDefined();\n    expect(streak7).toBeDefined();\n    expect(streak30).toBeDefined();\n    expect(streak100).toBeDefined();\n  });\n\n  test(\"should have language-specific achievements\", () => {\n    const jsAchievement = getAchievementById(\"speed-js-master\");\n    const tsAchievement = getAchievementById(\"speed-ts-master\");\n    const pyAchievement = getAchievementById(\"speed-py-master\");\n\n    expect(jsAchievement).toBeDefined();\n    expect(jsAchievement?.language).toBe(ProgrammingLanguage.JAVASCRIPT);\n\n    expect(tsAchievement).toBeDefined();\n    expect(tsAchievement?.language).toBe(ProgrammingLanguage.TYPESCRIPT);\n\n    expect(pyAchievement).toBeDefined();\n    expect(pyAchievement?.language).toBe(ProgrammingLanguage.PYTHON);\n  });\n});\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Set up project source structure (src/config, src/types directories)",
      "status": "completed",
      "activeForm": "Setting up project source structure"
    },
    {
      "content": "Create TypeScript types/interfaces for achievements",
      "status": "completed",
      "activeForm": "Creating TypeScript types/interfaces for achievements"
    },
    {
      "content": "Create achievement definitions configuration",
      "status": "completed",
      "activeForm": "Creating achievement definitions configuration"
    },
    {
      "content": "Create Playwright verification test",
      "status": "completed",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification test and confirm feature works",
      "status": "in_progress",
      "activeForm": "Running verification test"
    },
    {
      "content": "Clean up test file after verification",
      "status": "pending",
      "activeForm": "Cleaning up test file"
    }
  ]
}

Now let me run the Playwright test to verify the implementation:

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/achievement-definition-system.spec.ts --reporter=list 2>&1",
  "description": "Run Playwright verification test",
  "timeout": 120000
}

There's a network issue. Let me check if Playwright is already installed locally and run it directly:

🔧 Tool: Bash
Input: {
  "command": "ls node_modules/.bin/ | grep playwright",
  "description": "Check if Playwright is installed"
}

🔧 Tool: Bash
Input: {
  "command": "ls /Users/33b3ziz/Side-Projects/speedramming/node_modules/.bin/ | grep -E \"playwright|test\"",
  "description": "Check installed binaries"
}

🔧 Tool: Bash
Input: {
  "command": "ls /Users/33b3ziz/Side-Projects/speedramming/node_modules/ | grep playwright",
  "description": "Check for Playwright module"
}

Playwright is not installed. Let me try running the TypeScript files directly with `tsx` or use `vitest` since it's available. First, let me verify TypeScript compiles correctly:

🔧 Tool: Bash
Input: {
  "command": "/Users/33b3ziz/Side-Projects/speedramming/node_modules/.bin/tsc --noEmit 2>&1",
  "description": "Check TypeScript compilation",
  "timeout": 60000
}

Node modules may be incomplete. Let me try a different approach - create a simple Node.js test that validates the TypeScript files:

🔧 Tool: Read
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/playwright.config.ts"
}

I see the playwright config was modified. Since Playwright isn't properly installed and we have network issues, let me convert the test to use vitest which is available:

🔧 Tool: Bash
Input: {
  "command": "ls /Users/33b3ziz/Side-Projects/speedramming/node_modules/@playwright",
  "description": "Check Playwright directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls /Users/33b3ziz/Side-Projects/speedramming/node_modules/@playwright/test",
  "description": "Check Playwright test directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls /Users/33b3ziz/Side-Projects/speedramming/node_modules/@playwright",
  "description": "Check Playwright directory contents"
}

Playwright is not installed. Let me convert the test to use vitest instead, which is already available:

🔧 Tool: Write
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/tests/achievement-definition-system.spec.ts",
  "content": "/**\n * Achievement Definition System Verification Test\n *\n * This test verifies that the achievement definition system is correctly\n * implemented and all configurations are valid.\n */\n\nimport { describe, it, expect } from \"vitest\";\nimport {\n  achievementConfig,\n  getAchievementById,\n  getAchievementsByCategory,\n  getAchievementsByTier,\n  getAchievementsByLanguage,\n  getActiveAchievements,\n  getSecretAchievements,\n  getVisibleAchievements,\n  getAchievementGroupById,\n  getAchievementsInGroup,\n  calculateTierPoints,\n  getSortedAchievements,\n  getTotalAchievementCount,\n  getTotalPossiblePoints,\n} from \"../src/config/achievements\";\nimport {\n  AchievementCategory,\n  AchievementTier,\n  ProgrammingLanguage,\n  isAchievementCategory,\n  isAchievementTier,\n  isAchievementMetric,\n  AchievementMetric,\n} from \"../src/types/achievements\";\n\ndescribe(\"Achievement Definition System\", () => {\n  it(\"should have a valid configuration version\", () => {\n    expect(achievementConfig.version).toBe(\"1.0.0\");\n  });\n\n  it(\"should have achievements defined\", () => {\n    expect(achievementConfig.achievements).toBeDefined();\n    expect(achievementConfig.achievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have achievement groups defined\", () => {\n    expect(achievementConfig.groups).toBeDefined();\n    expect(achievementConfig.groups.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have tier multipliers defined\", () => {\n    expect(achievementConfig.tierMultipliers).toBeDefined();\n    expect(achievementConfig.tierMultipliers[AchievementTier.BRONZE]).toBe(1.0);\n    expect(achievementConfig.tierMultipliers[AchievementTier.SILVER]).toBe(1.5);\n    expect(achievementConfig.tierMultipliers[AchievementTier.GOLD]).toBe(2.0);\n    expect(achievementConfig.tierMultipliers[AchievementTier.PLATINUM]).toBe(3.0);\n    expect(achievementConfig.tierMultipliers[AchievementTier.DIAMOND]).toBe(5.0);\n  });\n});\n\ndescribe(\"Achievement Definitions Validation\", () => {\n  it(\"all achievements should have unique IDs\", () => {\n    const ids = achievementConfig.achievements.map((a) => a.id);\n    const uniqueIds = new Set(ids);\n    expect(ids.length).toBe(uniqueIds.size);\n  });\n\n  it(\"all achievements should have required fields\", () => {\n    for (const achievement of achievementConfig.achievements) {\n      expect(achievement.id).toBeTruthy();\n      expect(achievement.name).toBeTruthy();\n      expect(achievement.description).toBeTruthy();\n      expect(achievement.hint).toBeTruthy();\n      expect(achievement.category).toBeTruthy();\n      expect(achievement.badge).toBeTruthy();\n      expect(achievement.badge.name).toBeTruthy();\n      expect(achievement.badge.primaryColor).toBeTruthy();\n      expect(achievement.badge.secondaryColor).toBeTruthy();\n      expect(typeof achievement.basePoints).toBe(\"number\");\n      expect(achievement.basePoints).toBeGreaterThan(0);\n      expect(achievement.tier).toBeTruthy();\n      expect(achievement.criteria).toBeDefined();\n      expect(achievement.criteria.length).toBeGreaterThan(0);\n      expect(achievement.criteriaMode).toMatch(/^(all|any)$/);\n      expect(typeof achievement.isSecret).toBe(\"boolean\");\n      expect(typeof achievement.isRepeatable).toBe(\"boolean\");\n      expect(typeof achievement.displayOrder).toBe(\"number\");\n      expect(typeof achievement.isActive).toBe(\"boolean\");\n    }\n  });\n\n  it(\"all achievements should have valid categories\", () => {\n    for (const achievement of achievementConfig.achievements) {\n      expect(isAchievementCategory(achievement.category)).toBe(true);\n    }\n  });\n\n  it(\"all achievements should have valid tiers\", () => {\n    for (const achievement of achievementConfig.achievements) {\n      expect(isAchievementTier(achievement.tier)).toBe(true);\n    }\n  });\n\n  it(\"all criteria should have valid metrics\", () => {\n    for (const achievement of achievementConfig.achievements) {\n      for (const criterion of achievement.criteria) {\n        expect(isAchievementMetric(criterion.metric)).toBe(true);\n      }\n    }\n  });\n});\n\ndescribe(\"Achievement Categories\", () => {\n  it(\"should have speed achievements\", () => {\n    const speedAchievements = getAchievementsByCategory(AchievementCategory.SPEED);\n    expect(speedAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have accuracy achievements\", () => {\n    const accuracyAchievements = getAchievementsByCategory(AchievementCategory.ACCURACY);\n    expect(accuracyAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have consistency achievements\", () => {\n    const consistencyAchievements = getAchievementsByCategory(AchievementCategory.CONSISTENCY);\n    expect(consistencyAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have code pattern achievements\", () => {\n    const codePatternAchievements = getAchievementsByCategory(AchievementCategory.CODE_PATTERN);\n    expect(codePatternAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have milestone achievements\", () => {\n    const milestoneAchievements = getAchievementsByCategory(AchievementCategory.MILESTONE);\n    expect(milestoneAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have special achievements\", () => {\n    const specialAchievements = getAchievementsByCategory(AchievementCategory.SPECIAL);\n    expect(specialAchievements.length).toBeGreaterThan(0);\n  });\n});\n\ndescribe(\"Achievement Tiers\", () => {\n  it(\"should have bronze tier achievements\", () => {\n    const bronzeAchievements = getAchievementsByTier(AchievementTier.BRONZE);\n    expect(bronzeAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have silver tier achievements\", () => {\n    const silverAchievements = getAchievementsByTier(AchievementTier.SILVER);\n    expect(silverAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have gold tier achievements\", () => {\n    const goldAchievements = getAchievementsByTier(AchievementTier.GOLD);\n    expect(goldAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have platinum tier achievements\", () => {\n    const platinumAchievements = getAchievementsByTier(AchievementTier.PLATINUM);\n    expect(platinumAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have diamond tier achievements\", () => {\n    const diamondAchievements = getAchievementsByTier(AchievementTier.DIAMOND);\n    expect(diamondAchievements.length).toBeGreaterThan(0);\n  });\n});\n\ndescribe(\"Language-Specific Achievements\", () => {\n  it(\"should have JavaScript achievements\", () => {\n    const jsAchievements = getAchievementsByLanguage(ProgrammingLanguage.JAVASCRIPT);\n    expect(jsAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have TypeScript achievements\", () => {\n    const tsAchievements = getAchievementsByLanguage(ProgrammingLanguage.TYPESCRIPT);\n    expect(tsAchievements.length).toBeGreaterThan(0);\n  });\n\n  it(\"should have Python achievements\", () => {\n    const pyAchievements = getAchievementsByLanguage(ProgrammingLanguage.PYTHON);\n    expect(pyAchievements.length).toBeGreaterThan(0);\n  });\n});\n\ndescribe(\"Helper Functions\", () => {\n  it(\"getAchievementById should return correct achievement\", () => {\n    const achievement = getAchievementById(\"speed-beginner\");\n    expect(achievement).toBeDefined();\n    expect(achievement?.name).toBe(\"Keyboard Apprentice\");\n  });\n\n  it(\"getAchievementById should return undefined for non-existent ID\", () => {\n    const achievement = getAchievementById(\"non-existent-id\");\n    expect(achievement).toBeUndefined();\n  });\n\n  it(\"getActiveAchievements should return only active achievements\", () => {\n    const activeAchievements = getActiveAchievements();\n    for (const achievement of activeAchievements) {\n      expect(achievement.isActive).toBe(true);\n    }\n  });\n\n  it(\"getSecretAchievements should return only secret achievements\", () => {\n    const secretAchievements = getSecretAchievements();\n    expect(secretAchievements.length).toBeGreaterThan(0);\n    for (const achievement of secretAchievements) {\n      expect(achievement.isSecret).toBe(true);\n    }\n  });\n\n  it(\"getVisibleAchievements should return only non-secret achievements\", () => {\n    const visibleAchievements = getVisibleAchievements();\n    for (const achievement of visibleAchievements) {\n      expect(achievement.isSecret).toBe(false);\n    }\n  });\n\n  it(\"calculateTierPoints should apply correct multiplier\", () => {\n    expect(calculateTierPoints(100, AchievementTier.BRONZE)).toBe(100);\n    expect(calculateTierPoints(100, AchievementTier.SILVER)).toBe(150);\n    expect(calculateTierPoints(100, AchievementTier.GOLD)).toBe(200);\n    expect(calculateTierPoints(100, AchievementTier.PLATINUM)).toBe(300);\n    expect(calculateTierPoints(100, AchievementTier.DIAMOND)).toBe(500);\n  });\n\n  it(\"getSortedAchievements should return achievements sorted by displayOrder\", () => {\n    const sorted = getSortedAchievements();\n    for (let i = 1; i < sorted.length; i++) {\n      expect(sorted[i].displayOrder).toBeGreaterThanOrEqual(sorted[i - 1].displayOrder);\n    }\n  });\n\n  it(\"getTotalAchievementCount should return correct count\", () => {\n    const count = getTotalAchievementCount();\n    expect(count).toBe(achievementConfig.achievements.length);\n  });\n\n  it(\"getTotalPossiblePoints should return a positive number\", () => {\n    const totalPoints = getTotalPossiblePoints();\n    expect(totalPoints).toBeGreaterThan(0);\n  });\n});\n\ndescribe(\"Achievement Groups\", () => {\n  it(\"all groups should have unique IDs\", () => {\n    const ids = achievementConfig.groups.map((g) => g.id);\n    const uniqueIds = new Set(ids);\n    expect(ids.length).toBe(uniqueIds.size);\n  });\n\n  it(\"all groups should reference valid achievement IDs\", () => {\n    const allAchievementIds = new Set(achievementConfig.achievements.map((a) => a.id));\n    for (const group of achievementConfig.groups) {\n      for (const achievementId of group.achievementIds) {\n        expect(allAchievementIds.has(achievementId)).toBe(true);\n      }\n    }\n  });\n\n  it(\"getAchievementGroupById should return correct group\", () => {\n    const group = getAchievementGroupById(\"group-speed\");\n    expect(group).toBeDefined();\n    expect(group?.name).toBe(\"Speed Demons\");\n  });\n\n  it(\"getAchievementsInGroup should return achievements in the group\", () => {\n    const achievements = getAchievementsInGroup(\"group-speed\");\n    expect(achievements.length).toBeGreaterThan(0);\n    for (const achievement of achievements) {\n      expect(achievement.category).toBe(AchievementCategory.SPEED);\n    }\n  });\n});\n\ndescribe(\"Progressive Achievements with Milestones\", () => {\n  it(\"should have achievements with milestones\", () => {\n    const achievementsWithMilestones = achievementConfig.achievements.filter(\n      (a) => a.milestones && a.milestones.length > 0\n    );\n    expect(achievementsWithMilestones.length).toBeGreaterThan(0);\n  });\n\n  it(\"milestones should have increasing thresholds\", () => {\n    const achievementsWithMilestones = achievementConfig.achievements.filter(\n      (a) => a.milestones && a.milestones.length > 0\n    );\n    for (const achievement of achievementsWithMilestones) {\n      if (achievement.milestones) {\n        for (let i = 1; i < achievement.milestones.length; i++) {\n          expect(achievement.milestones[i].threshold).toBeGreaterThan(\n            achievement.milestones[i - 1].threshold\n          );\n        }\n      }\n    }\n  });\n\n  it(\"milestones should have valid tiers\", () => {\n    const achievementsWithMilestones = achievementConfig.achievements.filter(\n      (a) => a.milestones && a.milestones.length > 0\n    );\n    for (const achievement of achievementsWithMilestones) {\n      if (achievement.milestones) {\n        for (const milestone of achievement.milestones) {\n          expect(isAchievementTier(milestone.tier)).toBe(true);\n        }\n      }\n    }\n  });\n});\n\ndescribe(\"Type Guards\", () => {\n  it(\"isAchievementCategory should validate correctly\", () => {\n    expect(isAchievementCategory(\"speed\")).toBe(true);\n    expect(isAchievementCategory(\"accuracy\")).toBe(true);\n    expect(isAchievementCategory(\"invalid\")).toBe(false);\n  });\n\n  it(\"isAchievementTier should validate correctly\", () => {\n    expect(isAchievementTier(\"bronze\")).toBe(true);\n    expect(isAchievementTier(\"diamond\")).toBe(true);\n    expect(isAchievementTier(\"invalid\")).toBe(false);\n  });\n\n  it(\"isAchievementMetric should validate correctly\", () => {\n    expect(isAchievementMetric(\"wpm\")).toBe(true);\n    expect(isAchievementMetric(\"accuracy\")).toBe(true);\n    expect(isAchievementMetric(\"invalid\")).toBe(false);\n  });\n});\n\ndescribe(\"Specific Achievement Verification\", () => {\n  it(\"should have no-backspace achievement\", () => {\n    const achievement = getAchievementById(\"accuracy-no-backspace\");\n    expect(achievement).toBeDefined();\n    expect(achievement?.name).toBe(\"No Looking Back\");\n    expect(achievement?.criteria[0].metric).toBe(AchievementMetric.NO_BACKSPACE);\n  });\n\n  it(\"should have perfect accuracy achievement\", () => {\n    const achievement = getAchievementById(\"accuracy-perfect\");\n    expect(achievement).toBeDefined();\n    expect(achievement?.name).toBe(\"Perfectionist\");\n    expect(achievement?.criteria[0].metric).toBe(AchievementMetric.ACCURACY);\n    expect(achievement?.criteria[0].value).toBe(100);\n  });\n\n  it(\"should have symbol accuracy achievement\", () => {\n    const achievement = getAchievementById(\"accuracy-symbol-master\");\n    expect(achievement).toBeDefined();\n    expect(achievement?.name).toBe(\"Symbol Surgeon\");\n    expect(achievement?.criteria[0].metric).toBe(AchievementMetric.SYMBOL_ACCURACY);\n  });\n\n  it(\"should have speed milestone achievements\", () => {\n    const speedBeginner = getAchievementById(\"speed-beginner\");\n    const speedExpert = getAchievementById(\"speed-expert\");\n    const speedMaster = getAchievementById(\"speed-master\");\n\n    expect(speedBeginner).toBeDefined();\n    expect(speedExpert).toBeDefined();\n    expect(speedMaster).toBeDefined();\n\n    // Verify WPM thresholds are increasing\n    const beginnerWpm = speedBeginner?.criteria[0].value as number;\n    const expertWpm = speedExpert?.criteria[0].value as number;\n    const masterWpm = speedMaster?.criteria[0].value as number;\n\n    expect(expertWpm).toBeGreaterThan(beginnerWpm);\n    expect(masterWpm).toBeGreaterThan(expertWpm);\n  });\n\n  it(\"should have consistency streak achievements\", () => {\n    const streak3 = getAchievementById(\"consistency-streak-3\");\n    const streak7 = getAchievementById(\"consistency-streak-7\");\n    const streak30 = getAchievementById(\"consistency-streak-30\");\n    const streak100 = getAchievementById(\"consistency-streak-100\");\n\n    expect(streak3).toBeDefined();\n    expect(streak7).toBeDefined();\n    expect(streak30).toBeDefined();\n    expect(streak100).toBeDefined();\n  });\n\n  it(\"should have language-specific achievements\", () => {\n    const jsAchievement = getAchievementById(\"speed-js-master\");\n    const tsAchievement = getAchievementById(\"speed-ts-master\");\n    const pyAchievement = getAchievementById(\"speed-py-master\");\n\n    expect(jsAchievement).toBeDefined();\n    expect(jsAchievement?.language).toBe(ProgrammingLanguage.JAVASCRIPT);\n\n    expect(tsAchievement).toBeDefined();\n    expect(tsAchievement?.language).toBe(ProgrammingLanguage.TYPESCRIPT);\n\n    expect(pyAchievement).toBeDefined();\n    expect(pyAchievement?.language).toBe(ProgrammingLanguage.PYTHON);\n  });\n});\n"
}

Now let me create a vitest config and run the tests:

🔧 Tool: Write
Input: {
  "file_path": "/Users/33b3ziz/Side-Projects/speedramming/vitest.config.ts",
  "content": "import { defineConfig } from \"vitest/config\";\nimport path from \"path\";\n\nexport default defineConfig({\n  test: {\n    include: [\"tests/**/*.spec.ts\"],\n    environment: \"node\",\n  },\n  resolve: {\n    alias: {\n      \"@\": path.resolve(__dirname, \"./src\"),\n    },\n  },\n});\n"
}

🔧 Tool: Bash
Input: {
  "command": "./node_modules/.bin/vitest run tests/achievement-definition-system.spec.ts 2>&1",
  "description": "Run vitest verification test",
  "timeout": 120000
}

All 48 tests passed! Now let me clean up the test file as per the requirements:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Set up project source structure (src/config, src/types directories)",
      "status": "completed",
      "activeForm": "Setting up project source structure"
    },
    {
      "content": "Create TypeScript types/interfaces for achievements",
      "status": "completed",
      "activeForm": "Creating TypeScript types/interfaces for achievements"
    },
    {
      "content": "Create achievement definitions configuration",
      "status": "completed",
      "activeForm": "Creating achievement definitions configuration"
    },
    {
      "content": "Create Playwright verification test",
      "status": "completed",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification test and confirm feature works",
      "status": "completed",
      "activeForm": "Running verification test"
    },
    {
      "content": "Clean up test file after verification",
      "status": "in_progress",
      "activeForm": "Cleaning up test file"
    }
  ]
}

🔧 Tool: Bash
Input: {
  "command": "rm /Users/33b3ziz/Side-Projects/speedramming/tests/achievement-definition-system.spec.ts && rm /Users/33b3ziz/Side-Projects/speedramming/vitest.config.ts && rmdir /Users/33b3ziz/Side-Projects/speedramming/tests 2>/dev/null; ls /Users/33b3ziz/Side-Projects/speedramming/",
  "description": "Clean up test files"
}

🔧 Tool: Bash
Input: {
  "command": "ls /Users/33b3ziz/Side-Projects/speedramming/tests/",
  "description": "Check if tests directory is empty"
}

Good, there are other tests in the directory so I shouldn't remove it. The test file I created has been removed. Let me update the todo list:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Set up project source structure (src/config, src/types directories)",
      "status": "completed",
      "activeForm": "Setting up project source structure"
    },
    {
      "content": "Create TypeScript types/interfaces for achievements",
      "status": "completed",
      "activeForm": "Creating TypeScript types/interfaces for achievements"
    },
    {
      "content": "Create achievement definitions configuration",
      "status": "completed",
      "activeForm": "Creating achievement definitions configuration"
    },
    {
      "content": "Create Playwright verification test",
      "status": "completed",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run verification test and confirm feature works",
      "status": "completed",
      "activeForm": "Running verification test"
    },
    {
      "content": "Clean up test file after verification",
      "status": "completed",
      "activeForm": "Cleaning up test file"
    }
  ]
}

Let me verify the final state of the implementation:

🔧 Tool: Bash
Input: {
  "command": "ls -la /Users/33b3ziz/Side-Projects/speedramming/src/types/ /Users/33b3ziz/Side-Projects/speedramming/src/config/",
  "description": "Verify implementation files exist"
}

All files are in place. Let me provide a summary:

<summary>
## Summary: Achievement Definition System

### Changes Implemented
- Created a comprehensive TypeScript type system for achievements with enums for categories (speed, accuracy, consistency, code patterns, milestones, special), tiers (bronze to diamond), programming languages, difficulty levels, and metrics
- Implemented 30+ achievement definitions organized across 6 categories:
  - **Speed Achievements**: WPM milestones (30-125 WPM) and language-specific speed achievements (JavaScript, TypeScript, Python)
  - **Accuracy Achievements**: Perfect accuracy, no-backspace runs, flawless victories, symbol/keyword accuracy mastery
  - **Consistency Achievements**: Streak-based (3, 7, 30, 100 consecutive days)
  - **Code Pattern Achievements**: React components, async/await, algorithms, hardcore difficulty challenges
  - **Milestone Achievements**: First test, test counts, character counts, time investment, polyglot programmer
  - **Special/Secret Achievements**: Night owl, early bird, complete package, difficulty conqueror
- Created badge configuration system with customizable colors for each achievement
- Implemented progressive achievements with milestone thresholds
- Added tier-based point multipliers (1.0x bronze to 5.0x diamond)
- Created extensive helper functions for querying and filtering achievements
- Added type guards for runtime validation

### Files Modified
- `src/types/achievements.ts` - TypeScript interfaces, enums, and type guards
- `src/types/index.ts` - Central export for types
- `src/config/achievements.ts` - Complete achievement configuration with 30+ definitions
- `src/config/index.ts` - Central export for config

### Verification Status
- Created comprehensive test suite with 48 test cases using Vitest
- All 48 tests passed successfully, verifying:
  - Configuration structure and version
  - All achievements have unique IDs and required fields
  - Valid categories, tiers, and metrics
  - Helper functions work correctly
  - Achievement groups reference valid IDs
  - Progressive milestones have increasing thresholds
  - Type guards validate correctly
  - Specific achievements (no-backspace, perfect accuracy, symbol accuracy) exist with correct criteria
- Test file cleaned up after verification as requested

### Notes for Developer
- The achievement system uses TypeScript enums for type safety - extend enums when adding new categories/tiers/metrics
- Achievement criteria support multiple conditions with "all" (AND) or "any" (OR) logic
- Language and difficulty-specific achievements use optional filters on criteria
- Progressive achievements use the `milestones` array for tracking incremental progress
- Secret achievements have `isSecret: true` and hidden hints ("???")
- Repeatable achievements have `maxRepeats` to limit how many times they can be earned
- Use helper functions like `getAchievementById`, `getAchievementsByCategory`, etc. for querying
- Point calculation uses tier multipliers via `calculateTierPoints(basePoints, tier)`
</summary>
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code-type is a typing test application for code snippets, built with TanStack Start (full-stack React framework) and a PostgreSQL backend via Drizzle ORM.

## Commands

```bash
# Development
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build
pnpm preview      # Preview production build

# Testing
pnpm test         # Run Vitest tests

# Code Quality
pnpm lint         # Run ESLint
pnpm format       # Run Prettier
pnpm check        # Run Prettier and ESLint with auto-fix

# Database (Drizzle)
pnpm db:generate  # Generate migrations from schema changes
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema directly to database (dev)
pnpm db:pull      # Pull schema from database
pnpm db:studio    # Open Drizzle Studio GUI
```

## Architecture

### Tech Stack

- **Framework**: TanStack Start (SSR-capable React with file-based routing)
- **Routing**: TanStack Router with file-based routes in `src/routes/`
- **Data Fetching**: TanStack Query with SSR integration
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS v4 with shadcn/ui components (new-york style)
- **Forms**: TanStack Form
- **Tables**: TanStack Table
- **Compiler**: React Compiler (babel-plugin-react-compiler)

### Directory Structure

- `src/routes/` - File-based routes; `__root.tsx` is the app shell
- `src/components/ui/` - shadcn/ui components
- `src/components/` - App-level components
- `src/db/` - Drizzle schema and database connection
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities (includes shadcn `cn()` helper)
- `src/integrations/` - Framework integrations (TanStack Query provider)
- `features/` - Feature specifications with `feature.json` files defining status, dependencies, and priorities

### Routing Conventions

- Routes are auto-generated from files in `src/routes/`
- API routes use `.ts` extension (e.g., `api.names.ts` creates `/api/names`)
- Page routes use `.tsx` extension
- The route tree is generated at `src/routeTree.gen.ts`

### Path Aliases

Use `@/*` to import from `src/*` (configured in tsconfig.json).

### Adding shadcn Components

```bash
pnpm dlx shadcn@latest add <component-name>
```

## Key Patterns

- Router is created in `src/router.tsx` and wraps the app with TanStack Query provider
- Database schema is defined in `src/db/schema.ts`
- Environment variables: `DATABASE_URL` is required for PostgreSQL connection
- Demo files (prefixed with `demo`) are example code that can be safely removed

# Clean Code Guidelines

## Overview

This document serves as a comprehensive guide for writing clean, maintainable, and extensible code. It outlines principles and practices that ensure code quality, reusability, and long-term maintainability. When writing or reviewing code, follow these guidelines to create software that is easy to understand, modify, and extend. This file is used by LLMs to understand and enforce coding standards throughout the codebase.

---

## Core Principles

### 1. DRY (Don't Repeat Yourself)

**Principle**: Every piece of knowledge should have a single, unambiguous representation within a system.

**Practices**:

- Extract repeated logic into reusable functions, classes, or modules
- Use constants for repeated values
- Create shared utilities for common operations
- Avoid copy-pasting code blocks
- When you find yourself writing similar code more than twice, refactor it

**Example - Bad**:

```typescript
// Repeated validation logic
if (email.includes('@') && email.length > 5) {
  // ...
}
if (email.includes('@') && email.length > 5) {
  // ...
}
```

**Example - Good**:

```typescript
function isValidEmail(email: string): boolean {
  return email.includes('@') && email.length > 5
}

if (isValidEmail(email)) {
  // ...
}
```

---

### 2. Code Reusability

**Principle**: Write code that can be used in multiple contexts without modification or with minimal adaptation.

**Practices**:

- Create generic, parameterized functions instead of specific ones
- Use composition over inheritance where appropriate
- Design functions to be pure (no side effects) when possible
- Create utility libraries for common operations
- Use dependency injection to make components reusable
- Design APIs that are flexible and configurable

**Example - Bad**:

```typescript
function calculateUserTotal(userId: string) {
  const user = getUser(userId)
  return user.items.reduce((sum, item) => sum + item.price, 0)
}
```

**Example - Good**:

```typescript
function calculateTotal<T extends { price: number }>(items: T[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

function calculateUserTotal(userId: string) {
  const user = getUser(userId)
  return calculateTotal(user.items)
}
```

---

### 3. Abstract Functions and Abstractions

**Principle**: Create abstractions that hide implementation details and provide clear, simple interfaces.

**Practices**:

- Use interfaces and abstract classes to define contracts
- Create abstraction layers between different concerns
- Hide complex implementation behind simple function signatures
- Use dependency inversion - depend on abstractions, not concretions
- Create factory functions/classes for object creation
- Use strategy pattern for interchangeable algorithms

**Example - Bad**:

```typescript
function processPayment(amount: number, cardNumber: string, cvv: string) {
  // Direct implementation tied to specific payment processor
  fetch('https://stripe.com/api/charge', {
    method: 'POST',
    body: JSON.stringify({ amount, cardNumber, cvv }),
  })
}
```

**Example - Good**:

```typescript
interface PaymentProcessor {
  processPayment(
    amount: number,
    details: PaymentDetails,
  ): Promise<PaymentResult>
}

class StripeProcessor implements PaymentProcessor {
  async processPayment(
    amount: number,
    details: PaymentDetails,
  ): Promise<PaymentResult> {
    // Implementation
  }
}

function processPayment(
  processor: PaymentProcessor,
  amount: number,
  details: PaymentDetails,
) {
  return processor.processPayment(amount, details)
}
```

---

### 4. Extensibility

**Principle**: Design code that can be easily extended with new features without modifying existing code.

**Practices**:

- Follow the Open/Closed Principle: open for extension, closed for modification
- Use plugin architectures and hooks for extensibility
- Design with future requirements in mind (but don't over-engineer)
- Use configuration over hardcoding
- Create extension points through interfaces and callbacks
- Use composition and dependency injection
- Design APIs that can accommodate new parameters/options

**Example - Bad**:

```typescript
function sendNotification(user: User, type: string) {
  if (type === 'email') {
    sendEmail(user.email)
  } else if (type === 'sms') {
    sendSMS(user.phone)
  }
  // Adding new notification types requires modifying this function
}
```

**Example - Good**:

```typescript
interface NotificationChannel {
  send(user: User): Promise<void>
}

class EmailChannel implements NotificationChannel {
  async send(user: User): Promise<void> {
    // Implementation
  }
}

class SMSChannel implements NotificationChannel {
  async send(user: User): Promise<void> {
    // Implementation
  }
}

class NotificationService {
  constructor(private channels: NotificationChannel[]) {}

  async send(user: User): Promise<void> {
    await Promise.all(this.channels.map((channel) => channel.send(user)))
  }
}
// New notification types can be added without modifying existing code
```

---

### 5. Avoid Magic Numbers and Strings

**Principle**: Use named constants instead of hardcoded values to improve readability and maintainability.

**Practices**:

- Extract all magic numbers into named constants
- Use enums for related constants
- Create configuration objects for settings
- Use constants for API endpoints, timeouts, limits, etc.
- Document why specific values are used

**Example - Bad**:

```typescript
if (user.age >= 18) {
  // What does 18 mean?
}

setTimeout(() => {
  // What does 3000 mean?
}, 3000)

if (status === 'active') {
  // What are the valid statuses?
}
```

**Example - Good**:

```typescript
const MINIMUM_AGE_FOR_ADULTS = 18
const SESSION_TIMEOUT_MS = 3000

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

if (user.age >= MINIMUM_AGE_FOR_ADULTS) {
  // Clear intent
}

setTimeout(() => {
  // Clear intent
}, SESSION_TIMEOUT_MS)

if (status === UserStatus.ACTIVE) {
  // Type-safe and clear
}
```

---

## Additional Best Practices

### 6. Single Responsibility Principle

Each function, class, or module should have one reason to change.

**Example**:

```typescript
// Bad: Multiple responsibilities
class User {
  save() {
    /* database logic */
  }
  sendEmail() {
    /* email logic */
  }
  validate() {
    /* validation logic */
  }
}

// Good: Single responsibility
class User {
  validate() {
    /* validation only */
  }
}

class UserRepository {
  save(user: User) {
    /* database logic */
  }
}

class EmailService {
  sendToUser(user: User) {
    /* email logic */
  }
}
```

### 7. Meaningful Names

- Use descriptive names that reveal intent
- Avoid abbreviations unless they're widely understood
- Use verbs for functions, nouns for classes
- Be consistent with naming conventions

**Example**:

```typescript
// Bad
const d = new Date()
const u = getUser()
function calc(x, y) {}

// Good
const currentDate = new Date()
const currentUser = getUser()
function calculateTotal(price: number, quantity: number): number {}
```

### 8. Small Functions

- Functions should do one thing and do it well
- Keep functions short (ideally under 20 lines)
- Extract complex logic into separate functions
- Use descriptive function names instead of comments

### 9. Error Handling

- Handle errors explicitly
- Use appropriate error types
- Provide meaningful error messages
- Don't swallow errors silently
- Use try-catch appropriately

**Example**:

```typescript
// Bad
function divide(a: number, b: number) {
  return a / b // Can throw division by zero
}

// Good
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero is not allowed')
  }
  return a / b
}
```

### 10. Comments and Documentation

- Write self-documenting code (code should explain itself)
- Use comments to explain "why", not "what"
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes
- Use JSDoc/TSDoc for public APIs

### 11. Type Safety

- Use TypeScript types/interfaces effectively
- Avoid `any` type unless absolutely necessary
- Use union types and discriminated unions
- Leverage type inference where appropriate
- Create custom types for domain concepts

**Example**:

```typescript
// Bad
function processUser(data: any) {
  return data.name
}

// Good
interface User {
  id: string
  name: string
  email: string
}

function processUser(user: User): string {
  return user.name
}
```

### 12. Testing Considerations

- Write testable code (pure functions, dependency injection)
- Keep functions small and focused
- Avoid hidden dependencies
- Use mocks and stubs appropriately
- Design for testability from the start

### 13. Performance vs. Readability

- Prefer readability over premature optimization
- Profile before optimizing
- Use clear algorithms first, optimize if needed
- Document performance-critical sections
- Balance between clean code and performance requirements

### 14. Code Organization

- Group related functionality together
- Use modules/packages to organize code
- Follow consistent file and folder structures
- Separate concerns (UI, business logic, data access)
- Use barrel exports (index files) appropriately

### 15. Configuration Management

- Externalize configuration values
- Use environment variables for environment-specific settings
- Create configuration objects/interfaces
- Validate configuration at startup
- Provide sensible defaults

**Example**:

```typescript
// Bad
const apiUrl = 'https://api.example.com'
const timeout = 5000

// Good
interface Config {
  apiUrl: string
  timeout: number
  maxRetries: number
}

const config: Config = {
  apiUrl: process.env.API_URL || 'https://api.example.com',
  timeout: parseInt(process.env.TIMEOUT || '5000'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
}
```

---

## Code Review Checklist

When reviewing code, check for:

- [ ] No code duplication (DRY principle)
- [ ] Meaningful variable and function names
- [ ] No magic numbers or strings
- [ ] Functions are small and focused
- [ ] Proper error handling
- [ ] Type safety maintained
- [ ] Code is testable
- [ ] Documentation where needed
- [ ] Consistent code style
- [ ] Proper abstraction levels
- [ ] Extensibility considered
- [ ] Single responsibility principle followed

---

## Summary

Clean code is:

- **Readable**: Easy to understand at a glance
- **Maintainable**: Easy to modify and update
- **Testable**: Easy to write tests for
- **Extensible**: Easy to add new features
- **Reusable**: Can be used in multiple contexts
- **Well-documented**: Clear intent and purpose
- **Type-safe**: Leverages type system effectively
- **DRY**: No unnecessary repetition
- **Abstracted**: Proper separation of concerns
- **Configurable**: Uses constants and configuration over hardcoding

Remember: Code is read far more often than it is written. Write code for your future self and your teammates.

# Git Workflow: Branch, Commit, Push, and Pull Request

This document outlines the standard workflow for creating a branch, committing changes, pushing to remote, and creating a pull request.

## Prerequisites

- Git installed and configured
- GitHub CLI (`gh`) installed (optional, but recommended for PR creation)
- Access to the repository
- Authentication configured (SSH keys or GitHub CLI authentication)

## Step-by-Step Workflow

### 1. Check Current Status

First, check what changes exist in your working directory:

```bash
git status
```

This shows:

- Modified files
- Deleted files
- Untracked files
- Current branch

### 2. Create a New Branch

Create and switch to a new branch for your changes:

```bash
git checkout -b <branch-name>
```

**Branch naming conventions:**

- `feature/` - for new features
- `fix/` or `bugfix/` - for bug fixes
- `refactor/` - for code refactoring
- `docs/` - for documentation changes
- `chore/` - for maintenance tasks

**Example:**

```bash
git checkout -b refactor/monorepo-restructure
```

### 3. Stage Changes

Stage all changes (including deletions and new files):

```bash
git add -A
```

Or stage specific files:

```bash
git add <file1> <file2>
```

### 4. Commit Changes

Create a commit with a descriptive message:

```bash
git commit -m "type: descriptive commit message"
```

**Commit message conventions:**

- Use conventional commits format: `type: description`
- Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`
- Keep messages concise but descriptive

**Example:**

```bash
git commit -m "refactor: restructure project to monorepo with apps directory"
```

### 5. Push Branch to Remote

Push your branch to the remote repository:

```bash
git push -u origin <branch-name>
```

The `-u` flag sets up tracking so future pushes can use `git push` without specifying the branch.

**Example:**

```bash
git push -u origin refactor/monorepo-restructure
```

### 6. Create Pull Request

#### Option A: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
gh pr create --title "Your PR Title" --body "Description of changes"
```

To open in browser for review before creating:

```bash
gh pr create --title "Your PR Title" --body "Description" --web
```

#### Option B: Using GitHub Web Interface

After pushing, GitHub will provide a URL in the terminal output:

```
remote: Create a pull request for '<branch-name>' on GitHub by visiting:
remote:      https://github.com/<org>/<repo>/pull/new/<branch-name>
```

Visit that URL to create the PR through the web interface.

#### Option C: Manual PR Creation

1. Go to your repository on GitHub
2. Click "Pull requests" tab
3. Click "New pull request"
4. Select your branch as the source
5. Select the target branch (usually `main` or `master`)
6. Fill in title and description
7. Click "Create pull request"

## Complete Example Workflow

```bash
# 1. Check status
git status

# 2. Create branch
git checkout -b feature/add-new-component

# 3. Make your changes (edit files, etc.)

# 4. Stage changes
git add -A

# 5. Commit
git commit -m "feat: add new user dashboard component"

# 6. Push
git push -u origin feature/add-new-component

# 7. Create PR
gh pr create --title "feat: add new user dashboard component" --body "Implements new dashboard component with user statistics and activity feed."
```

## Handling Additional Changes

If you need to make more changes after pushing:

```bash
# Make your changes
git add -A
git commit -m "fix: address review feedback"
git push
```

The PR will automatically update with the new commits.

## Troubleshooting

### Branch already exists

```bash
git checkout <existing-branch-name>
```

### Need to update from main before creating PR

```bash
git checkout main
git pull origin main
git checkout <your-branch>
git merge main
# Resolve conflicts if any
git push
```

### PR creation fails

- Ensure branch is pushed: `git push -u origin <branch-name>`
- Check GitHub CLI authentication: `gh auth status`
- Verify repository access permissions
- Try creating PR via web interface instead

## Best Practices

1. **Keep branches focused**: One branch = one feature/fix
2. **Write clear commit messages**: Help reviewers understand changes
3. **Keep PRs small**: Easier to review and merge
4. **Update before creating PR**: Merge latest `main` into your branch
5. **Add tests**: Include tests for new features
6. **Update documentation**: Keep docs in sync with code changes
7. **Request reviews**: Tag relevant team members for review

## Quick Reference Commands

```bash
# Status check
git status

# Create branch
git checkout -b <branch-name>

# Stage all changes
git add -A

# Commit
git commit -m "type: message"

# Push
git push -u origin <branch-name>

# Create PR (GitHub CLI)
gh pr create --title "Title" --body "Description"

# View PR
gh pr view

# List PRs
gh pr list
```

# PR Comment Fix Agent Prompt

Use this prompt directly with an AI agent (like Claude Code) to automatically fix PR review comments.

## Direct Prompt

```
You are an AI agent tasked with reviewing and fixing GitHub Pull Request review comments.

Your task:
1. Fetch PR information: Run `gh pr view <pr-number> --comments --json number,title,body,comments,headRefName,baseRefName`
2. Parse all comments from the JSON output
3. Checkout the PR branch: `git checkout <headRefName>` and `git pull origin <headRefName>`
4. For each comment:
   - Identify the file and line number (if applicable)
   - Understand what change is being requested
   - Read the relevant file(s)
   - Make the necessary code changes to address the comment
   - Verify the fix doesn't break existing functionality
5. Commit all changes with a descriptive message referencing the PR comments
6. Push changes back to the PR branch

Guidelines:
- Address comments one at a time, but group related fixes
- Preserve existing code style and patterns
- Don't change more than necessary to address each comment
- Run tests if available after making changes
- If a comment is unclear, make your best interpretation and note it
- Create a summary of all comments addressed

Start by asking for the PR number, then proceed with the workflow above.
```

## Usage Example

```
I need you to fix all review comments on PR #123.

[Paste the prompt above]

PR number: 123
```

## Alternative: One-Liner Version

```
Review PR #<number> comments using `gh pr view <number> --comments`, checkout the PR branch,
read each comment, understand what needs to be fixed, make the code changes to address each
comment, commit with descriptive messages, and push back to the branch. Provide a summary of
all comments addressed.
```

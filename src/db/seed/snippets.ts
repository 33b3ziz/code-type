import type { Language, Difficulty, SnippetCategory } from '../schema'

export interface SnippetSeed {
  title: string
  code: string
  language: Language
  difficulty: Difficulty
  category: SnippetCategory
}

export const snippets: SnippetSeed[] = [
  // ============================================
  // JAVASCRIPT - BEGINNER
  // ============================================
  {
    title: 'Hello World Function',
    code: `function sayHello(name) {
  return "Hello, " + name + "!";
}`,
    language: 'javascript',
    difficulty: 'beginner',
    category: 'functions',
  },
  {
    title: 'Simple For Loop',
    code: `for (let i = 0; i < 5; i++) {
  console.log(i);
}`,
    language: 'javascript',
    difficulty: 'beginner',
    category: 'loops',
  },
  {
    title: 'Basic If Statement',
    code: `if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}`,
    language: 'javascript',
    difficulty: 'beginner',
    category: 'conditionals',
  },
  {
    title: 'Array Sum',
    code: `function sum(numbers) {
  let total = 0;
  for (let num of numbers) {
    total += num;
  }
  return total;
}`,
    language: 'javascript',
    difficulty: 'beginner',
    category: 'functions',
  },

  // ============================================
  // JAVASCRIPT - INTERMEDIATE
  // ============================================
  {
    title: 'Array Map Filter',
    code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2);`,
    language: 'javascript',
    difficulty: 'intermediate',
    category: 'functions',
  },
  {
    title: 'Object Destructuring',
    code: `const user = { name: "John", age: 30, city: "NYC" };
const { name, age, city = "Unknown" } = user;
console.log(\`\${name} is \${age} from \${city}\`);`,
    language: 'javascript',
    difficulty: 'intermediate',
    category: 'functions',
  },
  {
    title: 'Promise Chain',
    code: `fetch("/api/users")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));`,
    language: 'javascript',
    difficulty: 'intermediate',
    category: 'functions',
  },
  {
    title: 'While Loop with Break',
    code: `let count = 0;
while (true) {
  count++;
  if (count > 10) {
    break;
  }
  console.log(count);
}`,
    language: 'javascript',
    difficulty: 'intermediate',
    category: 'loops',
  },

  // ============================================
  // JAVASCRIPT - ADVANCED
  // ============================================
  {
    title: 'Async Await Pattern',
    code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error("User not found");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
}`,
    language: 'javascript',
    difficulty: 'advanced',
    category: 'functions',
  },
  {
    title: 'Reduce with Object',
    code: `const items = [
  { name: "apple", category: "fruit" },
  { name: "carrot", category: "vegetable" },
  { name: "banana", category: "fruit" },
];

const grouped = items.reduce((acc, item) => {
  const key = item.category;
  acc[key] = acc[key] || [];
  acc[key].push(item.name);
  return acc;
}, {});`,
    language: 'javascript',
    difficulty: 'advanced',
    category: 'functions',
  },
  {
    title: 'Closure Counter',
    code: `function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
    reset: () => (count = 0),
  };
}

const counter = createCounter();`,
    language: 'javascript',
    difficulty: 'advanced',
    category: 'functions',
  },

  // ============================================
  // JAVASCRIPT - HARDCORE
  // ============================================
  {
    title: 'Debounce Function',
    code: `function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}`,
    language: 'javascript',
    difficulty: 'hardcore',
    category: 'functions',
  },
  {
    title: 'Event Emitter Class',
    code: `class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener.apply(this, args));
  }
}`,
    language: 'javascript',
    difficulty: 'hardcore',
    category: 'functions',
  },

  // ============================================
  // TYPESCRIPT - BEGINNER
  // ============================================
  {
    title: 'Typed Function',
    code: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}`,
    language: 'typescript',
    difficulty: 'beginner',
    category: 'functions',
  },
  {
    title: 'Interface Definition',
    code: `interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}`,
    language: 'typescript',
    difficulty: 'beginner',
    category: 'functions',
  },
  {
    title: 'Array Type',
    code: `const numbers: number[] = [1, 2, 3, 4, 5];
const names: Array<string> = ["Alice", "Bob"];

for (const num of numbers) {
  console.log(num * 2);
}`,
    language: 'typescript',
    difficulty: 'beginner',
    category: 'loops',
  },

  // ============================================
  // TYPESCRIPT - INTERMEDIATE
  // ============================================
  {
    title: 'Generic Function',
    code: `function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity("hello");`,
    language: 'typescript',
    difficulty: 'intermediate',
    category: 'functions',
  },
  {
    title: 'Union Types',
    code: `type Status = "pending" | "approved" | "rejected";

function handleStatus(status: Status): string {
  switch (status) {
    case "pending":
      return "Waiting for review";
    case "approved":
      return "Request approved";
    case "rejected":
      return "Request denied";
  }
}`,
    language: 'typescript',
    difficulty: 'intermediate',
    category: 'conditionals',
  },
  {
    title: 'Optional Properties',
    code: `interface Config {
  host: string;
  port: number;
  ssl?: boolean;
  timeout?: number;
}

function connect(config: Config): void {
  const { host, port, ssl = false, timeout = 5000 } = config;
  console.log(\`Connecting to \${host}:\${port}\`);
}`,
    language: 'typescript',
    difficulty: 'intermediate',
    category: 'functions',
  },

  // ============================================
  // TYPESCRIPT - ADVANCED
  // ============================================
  {
    title: 'Mapped Types',
    code: `type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;`,
    language: 'typescript',
    difficulty: 'advanced',
    category: 'functions',
  },
  {
    title: 'Conditional Types',
    code: `type NonNullable<T> = T extends null | undefined ? never : T;

type ExtractArrayType<T> = T extends Array<infer U> ? U : never;

type StringOrNumber = string | number | null;
type Cleaned = NonNullable<StringOrNumber>;

type NumArray = number[];
type Extracted = ExtractArrayType<NumArray>;`,
    language: 'typescript',
    difficulty: 'advanced',
    category: 'functions',
  },
  {
    title: 'Type Guards',
    code: `interface Dog {
  kind: "dog";
  bark(): void;
}

interface Cat {
  kind: "cat";
  meow(): void;
}

type Pet = Dog | Cat;

function isDog(pet: Pet): pet is Dog {
  return pet.kind === "dog";
}

function handlePet(pet: Pet): void {
  if (isDog(pet)) {
    pet.bark();
  } else {
    pet.meow();
  }
}`,
    language: 'typescript',
    difficulty: 'advanced',
    category: 'conditionals',
  },

  // ============================================
  // TYPESCRIPT - HARDCORE
  // ============================================
  {
    title: 'Builder Pattern',
    code: `class QueryBuilder<T> {
  private query: Partial<T> = {};
  private conditions: string[] = [];

  where<K extends keyof T>(key: K, value: T[K]): this {
    this.query[key] = value;
    this.conditions.push(\`\${String(key)} = ?\`);
    return this;
  }

  build(): { query: Partial<T>; sql: string } {
    return {
      query: this.query,
      sql: \`WHERE \${this.conditions.join(" AND ")}\`,
    };
  }
}`,
    language: 'typescript',
    difficulty: 'hardcore',
    category: 'functions',
  },
  {
    title: 'Recursive Types',
    code: `type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

function traverseTree<T>(
  node: TreeNode<T>,
  callback: (value: T) => void
): void {
  callback(node.value);
  for (const child of node.children) {
    traverseTree(child, callback);
  }
}`,
    language: 'typescript',
    difficulty: 'hardcore',
    category: 'functions',
  },

  // ============================================
  // REACT - BEGINNER
  // ============================================
  {
    title: 'Simple Component',
    code: `function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}`,
    language: 'typescript',
    difficulty: 'beginner',
    category: 'react-components',
  },
  {
    title: 'useState Hook',
    code: `function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
    language: 'typescript',
    difficulty: 'beginner',
    category: 'react-components',
  },

  // ============================================
  // REACT - INTERMEDIATE
  // ============================================
  {
    title: 'useEffect Hook',
    code: `function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const data = await fetch(\`/api/users/\${userId}\`);
      setUser(await data.json());
      setLoading(false);
    }
    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}`,
    language: 'typescript',
    difficulty: 'intermediate',
    category: 'react-components',
  },
  {
    title: 'Form Handling',
    code: `function LoginForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}`,
    language: 'typescript',
    difficulty: 'intermediate',
    category: 'react-components',
  },

  // ============================================
  // REACT - ADVANCED
  // ============================================
  {
    title: 'Custom Hook',
    code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}`,
    language: 'typescript',
    difficulty: 'advanced',
    category: 'react-components',
  },
  {
    title: 'Context Provider',
    code: `interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}`,
    language: 'typescript',
    difficulty: 'advanced',
    category: 'react-components',
  },

  // ============================================
  // PYTHON - BEGINNER
  // ============================================
  {
    title: 'Hello Function',
    code: `def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`,
    language: 'python',
    difficulty: 'beginner',
    category: 'functions',
  },
  {
    title: 'For Loop Range',
    code: `for i in range(5):
    print(i)

numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(num * 2)`,
    language: 'python',
    difficulty: 'beginner',
    category: 'loops',
  },
  {
    title: 'If Elif Else',
    code: `score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Grade: {grade}")`,
    language: 'python',
    difficulty: 'beginner',
    category: 'conditionals',
  },
  {
    title: 'List Comprehension Basic',
    code: `numbers = [1, 2, 3, 4, 5]
squares = [x ** 2 for x in numbers]
evens = [x for x in numbers if x % 2 == 0]`,
    language: 'python',
    difficulty: 'beginner',
    category: 'loops',
  },

  // ============================================
  // PYTHON - INTERMEDIATE
  // ============================================
  {
    title: 'Dictionary Operations',
    code: `users = {
    "alice": {"age": 30, "city": "NYC"},
    "bob": {"age": 25, "city": "LA"},
}

for name, info in users.items():
    print(f"{name}: {info['age']} years old")

ages = {name: info["age"] for name, info in users.items()}`,
    language: 'python',
    difficulty: 'intermediate',
    category: 'loops',
  },
  {
    title: 'Lambda Functions',
    code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

evens = list(filter(lambda x: x % 2 == 0, numbers))
doubled = list(map(lambda x: x * 2, numbers))

from functools import reduce
total = reduce(lambda acc, x: acc + x, numbers, 0)`,
    language: 'python',
    difficulty: 'intermediate',
    category: 'functions',
  },
  {
    title: 'Class Definition',
    code: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def __str__(self):
        return f"Rectangle({self.width}x{self.height})"`,
    language: 'python',
    difficulty: 'intermediate',
    category: 'functions',
  },

  // ============================================
  // PYTHON - ADVANCED
  // ============================================
  {
    title: 'Decorator Function',
    code: `import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "done"`,
    language: 'python',
    difficulty: 'advanced',
    category: 'functions',
  },
  {
    title: 'Context Manager',
    code: `class DatabaseConnection:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.connection = None

    def __enter__(self):
        self.connection = self._connect()
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.connection:
            self.connection.close()
        return False

    def _connect(self):
        print(f"Connecting to {self.host}:{self.port}")
        return self`,
    language: 'python',
    difficulty: 'advanced',
    category: 'functions',
  },
  {
    title: 'Generator Function',
    code: `def fibonacci(n):
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1

def infinite_counter(start=0):
    num = start
    while True:
        yield num
        num += 1

fib_10 = list(fibonacci(10))`,
    language: 'python',
    difficulty: 'advanced',
    category: 'functions',
  },

  // ============================================
  // PYTHON - HARDCORE
  // ============================================
  {
    title: 'Metaclass',
    code: `class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        self.connection = None

    def connect(self, url):
        self.connection = url
        print(f"Connected to {url}")`,
    language: 'python',
    difficulty: 'hardcore',
    category: 'functions',
  },
  {
    title: 'Async Pattern',
    code: `import asyncio
from typing import List

async def fetch_data(url: str) -> dict:
    await asyncio.sleep(1)  # Simulate network delay
    return {"url": url, "data": "content"}

async def fetch_all(urls: List[str]) -> List[dict]:
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return results

async def main():
    urls = ["http://api1.com", "http://api2.com"]
    data = await fetch_all(urls)
    for item in data:
        print(item)`,
    language: 'python',
    difficulty: 'hardcore',
    category: 'functions',
  },
  {
    title: 'Dataclass with Validation',
    code: `from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime

@dataclass
class User:
    id: int
    username: str
    email: str
    created_at: datetime = field(default_factory=datetime.now)
    tags: List[str] = field(default_factory=list)
    bio: Optional[str] = None

    def __post_init__(self):
        if not self.email or "@" not in self.email:
            raise ValueError("Invalid email address")
        self.username = self.username.lower()`,
    language: 'python',
    difficulty: 'hardcore',
    category: 'functions',
  },
]

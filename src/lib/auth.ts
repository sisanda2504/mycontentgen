export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const USERS_KEY = "genmix_users";
const SESSION_KEY = "genmix_session";

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signUp(email: string, password: string, name: string): User {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error("Email already registered");
  }
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
  };
  // Store password hash alongside (simple demo – not secure for production)
  const stored = [...users, user];
  saveUsers(stored);
  localStorage.setItem(`genmix_pw_${user.id}`, password);
  setSession(user);
  return user;
}

export function signIn(email: string, password: string): User {
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("Invalid email or password");
  const storedPw = localStorage.getItem(`genmix_pw_${user.id}`);
  if (storedPw !== password) throw new Error("Invalid email or password");
  setSession(user);
  return user;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Saved prompts per user
const PROMPTS_KEY = "genmix_prompts";

export interface SavedPrompt {
  id: string;
  userId: string;
  text: string;
  category: "text" | "image" | "code";
  createdAt: string;
}

export function getSavedPrompts(userId: string): SavedPrompt[] {
  try {
    const all: SavedPrompt[] = JSON.parse(localStorage.getItem(PROMPTS_KEY) || "[]");
    return all.filter((p) => p.userId === userId);
  } catch {
    return [];
  }
}

export function savePrompt(prompt: Omit<SavedPrompt, "id" | "createdAt">): SavedPrompt {
  const all: SavedPrompt[] = JSON.parse(localStorage.getItem(PROMPTS_KEY) || "[]");
  const newPrompt: SavedPrompt = {
    ...prompt,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(newPrompt);
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(all));
  return newPrompt;
}

export function deletePrompt(id: string) {
  const all: SavedPrompt[] = JSON.parse(localStorage.getItem(PROMPTS_KEY) || "[]");
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(all.filter((p) => p.id !== id)));
}

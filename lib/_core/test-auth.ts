/**
 * Test Authentication Service
 * Simple email/password authentication for development and testing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TestUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'dietitian' | 'client';
}

export interface TestSession {
  userId: number;
  email: string;
  name: string;
  role: 'dietitian' | 'client';
  token: string;
  createdAt: number;
}

// Test users database
const TEST_USERS: TestUser[] = [
  {
    id: 1,
    email: 'dietitian@test.com',
    password: 'password123',
    name: 'Dr. Ayşe Diyetisyen',
    role: 'dietitian',
  },
  {
    id: 2,
    email: 'client@test.com',
    password: 'password123',
    name: 'Mehmet Danışan',
    role: 'client',
  },
  {
    id: 3,
    email: 'demo@test.com',
    password: 'demo123',
    name: 'Demo Kullanıcı',
    role: 'client',
  },
];

const SESSION_KEY = 'test_session';

/**
 * Login with email and password
 */
export async function testLogin(email: string, password: string): Promise<TestSession> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = TEST_USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Generate a simple token
  const token = `test_token_${user.id}_${Date.now()}`;

  const session: TestSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
    createdAt: Date.now(),
  };

  // Store session
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

/**
 * Get current session
 */
export async function getTestSession(): Promise<TestSession | null> {
  try {
    const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
    if (!sessionJson) return null;
    return JSON.parse(sessionJson) as TestSession;
  } catch (error) {
    console.error('[TestAuth] Failed to get session:', error);
    return null;
  }
}

/**
 * Logout
 */
export async function testLogout(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/**
 * Get test users for demo purposes
 */
export function getTestUsers(): TestUser[] {
  return TEST_USERS.map(u => ({
    ...u,
    password: '', // Don't expose passwords
  }));
}

/**
 * Check if user is authenticated
 */
export async function isTestAuthenticated(): Promise<boolean> {
  const session = await getTestSession();
  return !!session;
}

/**
 * Register new test user (for demo)
 */
export async function testRegister(
  email: string,
  password: string,
  name: string,
  role: 'dietitian' | 'client'
): Promise<TestSession> {
  // Check if user exists
  if (TEST_USERS.some(u => u.email === email)) {
    throw new Error('User already exists');
  }

  // Create new user
  const newUser: TestUser = {
    id: Math.max(...TEST_USERS.map(u => u.id)) + 1,
    email,
    password,
    name,
    role,
  };

  TEST_USERS.push(newUser);

  // Auto-login
  return testLogin(email, password);
}

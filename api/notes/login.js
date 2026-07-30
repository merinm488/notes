/**
 * Login Route for Vercel
 * POST /api/notes/login
 * Authenticates user and returns their data
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_DIR = path.join(process.cwd(), 'db');
const USERS_DIR = path.join(DB_DIR, 'users');

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
  }
}

// Generate SHA-256 hash
function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Get user file path
function getUserFilePath(hash) {
  return path.join(USERS_DIR, `${hash}.json`);
}

// Read user data
function getUserData(hash) {
  ensureDirectories();
  const filePath = getUserFilePath(hash);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
}

// Check if user exists
function userExists(hash) {
  const filePath = getUserFilePath(hash);
  return fs.existsSync(filePath);
}

/**
 * POST /api/notes/login
 * Login with key (server-side hashing for consistency)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return Response.json({ error: 'Key is required' }, { status: 400 });
    }

    // Normalize key
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '-');
    const parts = normalizedKey.split('-');

    // Validate key format
    if (parts.length !== 3 || !parts.every(p => p.length >= 2 && /^[a-z]+$/.test(p))) {
      return Response.json({ error: 'Invalid key format' }, { status: 400 });
    }

    // Generate hash on server
    const hash = generateHash(normalizedKey);

    // Check if user exists
    if (!userExists(hash)) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = getUserData(hash);

    if (!userData) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Return hash and user data
    return Response.json({
      success: true,
      hash,
      data: userData
    });

  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * Login Route for Vercel
 * POST /api/login
 * Authenticates user and returns their data using textdb.dev
 */

import crypto from 'crypto';

const TEXTDB_API_BASE = 'https://textdb.dev/api/data';

// Generate SHA-256 hash
function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Get user data from textdb.dev
 * @param {string} hash - User's hash (used as textdb.dev identifier)
 * @returns {Promise<Object|null>} - User data or null if not found
 */
async function getUserData(hash) {
  try {
    const response = await fetch(`${TEXTDB_API_BASE}/${hash}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const text = await response.text();

    // textdb.dev returns default content for non-existent keys
    if (!text || text.trim() === '' || text.includes('hello world from textdb')) {
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error reading user data from textdb.dev:', error);
    return null;
  }
}

/**
 * Check if user exists
 * @param {string} hash - User's hash
 * @returns {Promise<boolean>} - Whether user exists
 */
async function userExists(hash) {
  const userData = await getUserData(hash);
  return userData !== null;
}

/**
 * POST /api/login
 * Login with key (server-side hashing for consistency)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return Response.json({ error: 'Key is required' }, { status: 400 });
    }

    // Normalize key (same as frontend)
    const normalizedKey = key
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z-]/g, '')
      .replace(/-+/g, '-');
    const parts = normalizedKey.split('-');

    // Validate key format
    if (parts.length !== 3 || !parts.every(p => p.length >= 2 && /^[a-z]+$/.test(p))) {
      return Response.json({ error: 'Invalid key format' }, { status: 400 });
    }

    // Generate hash on server
    const hash = generateHash(normalizedKey);

    // Check if user exists
    const exists = await userExists(hash);
    if (!exists) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = await getUserData(hash);

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

/**
 * TextDB Backend API Routes for Vercel
 *
 * This implements a REST API that stores data using textdb.dev external service
 */

import crypto from 'crypto';

const TEXTDB_API_BASE = 'https://textdb.dev/api/data';

// Generate SHA-256 hash
function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Get user data from textdb.dev
 * @param {string} hash - User's hash (used as textdb.dev identifier)
 * @returns {Promise<Object|null>} - User data or null if not found
 */
async function getUserData(hash) {
  try {
    console.log(`[TEXTDB GET] Fetching hash: ${hash}`);
    const response = await fetch(`${TEXTDB_API_BASE}/${hash}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log(`[TEXTDB GET] Response status: ${response.status}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[TEXTDB GET] User not found (404)`);
        return null;
      }
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const text = await response.text();
    console.log(`[TEXTDB GET] Response text length: ${text?.length}, raw content: "${text}"`);

    // textdb.dev returns default content for non-existent keys
    // Check for empty, whitespace, or default textdb responses
    if (!text || text.trim() === '' || text.includes('hello world from textdb') || text.length < 10) {
      console.log(`[TEXTDB GET] Default/empty/invalid content, returning null`);
      return null;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
      // textdb.dev sometimes returns JSON-encoded strings (double-encoded)
      // If we got a string, parse it again
      if (typeof parsed === 'string') {
        console.log(`[TEXTDB GET] Got string, parsing again...`);
        parsed = JSON.parse(parsed);
      }
    } catch (parseError) {
      console.error(`[TEXTDB GET] JSON parse error: ${parseError.message}`);
      return null;
    }

    // Validate that we have actual user data structure
    if (!parsed || typeof parsed !== 'object' || !parsed.hasOwnProperty('notes') || !parsed.hasOwnProperty('folders')) {
      console.log(`[TEXTDB GET] Invalid user data structure, returning null`);
      return null;
    }

    console.log(`[TEXTDB GET] Valid user data with ${parsed.notes?.length || 0} notes, ${parsed.folders?.length || 0} folders`);
    return parsed;
  } catch (error) {
    console.error('[TEXTDB GET] Error reading user data:', error);
    return null;
  }
}

/**
 * Save user data to textdb.dev
 * @param {string} hash - User's hash (used as textdb.dev identifier)
 * @param {Object} userData - User data to save
 * @returns {Promise<boolean>} - Success status
 */
async function saveUserData(hash, userData) {
  try {
    console.log(`[TEXTDB POST] Saving hash: ${hash} with ${JSON.stringify(userData).length} bytes`);
    const response = await fetch(`${TEXTDB_API_BASE}/${hash}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    console.log(`[TEXTDB POST] Response status: ${response.status}, ok: ${response.ok}`);
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`[TEXTDB POST] Error response: ${responseText}`);
      throw new Error(`Failed to save data: ${response.status}`);
    }

    let responseText = await response.text();
    console.log(`[TEXTDB POST] Response text: "${responseText?.substring(0, 200)}"`);

    // Verify the save worked by checking the response
    if (responseText && responseText.trim() !== '' && !responseText.includes('hello world from textdb')) {
      console.log(`[TEXTDB POST] Save appears successful`);
      return true;
    } else {
      console.warn(`[TEXTDB POST] Response looks suspicious: "${responseText}"`);
      // Still return true since response.ok was true
      return true;
    }
  } catch (error) {
    console.error('[TEXTDB POST] Error saving user data:', error);
    return false;
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

// ==================== HANDLERS ====================

/**
 * GET /api/notes?hash={hash}
 * Get user data (notes and folders)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return Response.json({ error: 'Hash is required' }, { status: 400 });
    }

    const userData = await getUserData(hash);

    if (!userData) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: userData });
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/notes
 * Handle login and account creation
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { key, action } = body;

    console.log(`[API POST] Action: ${action}, Key: ${key}`);

    if (!key) {
      return Response.json({ error: 'Key is required' }, { status: 400 });
    }

    // Normalize key (same as frontend)
    const normalizedKey = key
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z-]/g, '')
      .replace(/-+/g, '-');
    const parts = normalizedKey.split('-');

    console.log(`[API POST] Normalized key: ${normalizedKey}, Parts: ${parts.join(', ')}`);

    if (parts.length !== 3 || !parts.every(p => p.length >= 2 && /^[a-zA-Z]+$/.test(p))) {
      return Response.json({ error: 'Invalid key format' }, { status: 400 });
    }

    const hash = generateHash(normalizedKey);
    console.log(`[API POST] Generated hash: ${hash}`);

    // Handle login action
    if (action === 'login') {
      console.log(`[API POST] Handling login for hash: ${hash}`);
      const userData = await getUserData(hash);

      if (!userData) {
        console.log(`[API POST] Login failed - user not found`);
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      console.log(`[API POST] Login successful`);
      return Response.json({
        success: true,
        hash,
        data: userData
      });
    }

    // Handle account creation (default or explicit create action)
    console.log(`[API POST] Handling account creation for hash: ${hash}`);
    // Check if user already exists
    const exists = await userExists(hash);
    console.log(`[API POST] User exists check: ${exists}`);
    if (exists) {
      return Response.json({ error: 'User already exists', code: 'USER_EXISTS' }, { status: 409 });
    }

    // Create new user
    const newUserData = {
      folders: [
        {
          id: generateId(),
          name: 'All Notes',
          color: '#FACC15',
          isDefault: true
        }
      ],
      notes: [],
      settings: {
        theme: 'dark',
        createdAt: new Date().toISOString()
      }
    };

    console.log(`[API POST] Creating new user with hash: ${hash}`);
    const saved = await saveUserData(hash, newUserData);
    console.log(`[API POST] Save result: ${saved}`);
    if (saved) {
      // Verify the save by immediately reading back
      console.log(`[API POST] Verifying save by reading back...`);
      const verifyData = await getUserData(hash);
      console.log(`[API POST] Verification result: ${verifyData ? 'SUCCESS' : 'FAILED'}`);

      return Response.json({
        success: true,
        hash,
        message: 'Account created successfully'
      });
    } else {
      return Response.json({ error: 'Failed to create account' }, { status: 500 });
    }
  } catch (error) {
    console.error('[API POST] Error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/notes
 * Update user data (notes, folders)
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { hash, action, data } = body;

    if (!hash || !action) {
      return Response.json({ error: 'Hash and action are required' }, { status: 400 });
    }

    const userData = await getUserData(hash);

    if (!userData) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'createNote':
        const newNote = {
          id: generateId(),
          title: data.title || 'Untitled',
          content: data.content || '',
          folderId: data.folderId || userData.folders[0].id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pinned: false
        };
        userData.notes.unshift(newNote);
        break;

      case 'updateNote':
        const noteIndex = userData.notes.findIndex(n => n.id === data.noteId);
        if (noteIndex === -1) {
          return Response.json({ error: 'Note not found' }, { status: 404 });
        }
        userData.notes[noteIndex] = {
          ...userData.notes[noteIndex],
          ...data.updates,
          id: data.noteId,
          createdAt: userData.notes[noteIndex].createdAt,
          updatedAt: new Date().toISOString()
        };
        break;

      case 'deleteNote':
        userData.notes = userData.notes.filter(n => n.id !== data.noteId);
        break;

      case 'togglePin':
        const note = userData.notes.find(n => n.id === data.noteId);
        if (note) {
          note.pinned = !note.pinned;
          note.updatedAt = new Date().toISOString();
        }
        break;

      case 'toggleArchive':
        const noteToArchive = userData.notes.find(n => n.id === data.noteId);
        if (noteToArchive) {
          noteToArchive.archived = !noteToArchive.archived;
          // Also unpin if archiving
          if (noteToArchive.archived) {
            noteToArchive.pinned = false;
          }
          noteToArchive.updatedAt = new Date().toISOString();
        }
        break;

      case 'createFolder':
        const newFolder = {
          id: generateId(),
          name: data.name || 'New Folder',
          color: data.color || '#FACC15',
          isDefault: false
        };
        userData.folders.push(newFolder);
        break;

      case 'updateFolder':
        const folderIndex = userData.folders.findIndex(f => f.id === data.folderId);
        if (folderIndex === -1) {
          return Response.json({ error: 'Folder not found' }, { status: 404 });
        }
        userData.folders[folderIndex] = {
          ...userData.folders[folderIndex],
          ...data.updates,
          id: data.folderId,
          isDefault: userData.folders[folderIndex].isDefault
        };
        break;

      case 'deleteFolder':
        const folder = userData.folders.find(f => f.id === data.folderId);
        if (folder && folder.isDefault) {
          return Response.json({ error: 'Cannot delete default folder' }, { status: 400 });
        }
        const defaultFolder = userData.folders.find(f => f.isDefault);
        userData.notes.forEach(n => {
          if (n.folderId === data.folderId) {
            n.folderId = defaultFolder.id;
          }
        });
        userData.folders = userData.folders.filter(f => f.id !== data.folderId);
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const saved = await saveUserData(hash, userData);
    if (saved) {
      return Response.json({ success: true, data: userData });
    } else {
      return Response.json({ error: 'Failed to save data' }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/notes
 * Delete user account
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return Response.json({ error: 'Hash is required' }, { status: 400 });
    }

    // Check if user exists
    const userData = await getUserData(hash);
    if (!userData) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete from textdb.dev by sending empty content
    try {
      await fetch(`${TEXTDB_API_BASE}/${hash}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(null)
      });
    } catch (error) {
      // textdb.dev might not support proper deletion, but we'll try
    }

    return Response.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

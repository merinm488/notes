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
 * Save user data to textdb.dev
 * @param {string} hash - User's hash (used as textdb.dev identifier)
 * @param {Object} userData - User data to save
 * @returns {Promise<boolean>} - Success status
 */
async function saveUserData(hash, userData) {
  try {
    const response = await fetch(`${TEXTDB_API_BASE}/${hash}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Failed to save data: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving user data to textdb.dev:', error);
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
 * Create new user account
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { key, action } = body;

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

    if (parts.length !== 3 || !parts.every(p => p.length >= 2 && /^[a-z]+$/.test(p))) {
      return Response.json({ error: 'Invalid key format' }, { status: 400 });
    }

    const hash = generateHash(normalizedKey);

    // Check if user already exists
    const exists = await userExists(hash);
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

    const saved = await saveUserData(hash, newUserData);
    if (saved) {
      return Response.json({
        success: true,
        hash,
        message: 'Account created successfully'
      });
    } else {
      return Response.json({ error: 'Failed to create account' }, { status: 500 });
    }
  } catch (error) {
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

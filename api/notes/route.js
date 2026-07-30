/**
 * TextDB Backend API Routes for Vercel
 *
 * This implements a REST API that stores data as JSON files (TextDB)
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

// Write user data
function saveUserData(hash, userData) {
  ensureDirectories();
  const filePath = getUserFilePath(hash);

  try {
    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

// Check if user exists
function userExists(hash) {
  const filePath = getUserFilePath(hash);
  return fs.existsSync(filePath);
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
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

    const userData = getUserData(hash);

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

    // Normalize key
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '-');
    const parts = normalizedKey.split('-');

    if (parts.length !== 3 || !parts.every(p => p.length >= 2 && /^[a-z]+$/.test(p))) {
      return Response.json({ error: 'Invalid key format' }, { status: 400 });
    }

    const hash = generateHash(normalizedKey);

    // Check if user already exists
    if (userExists(hash)) {
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

    if (saveUserData(hash, newUserData)) {
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

    const userData = getUserData(hash);

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

    if (saveUserData(hash, userData)) {
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

    const filePath = getUserFilePath(hash);

    if (!fs.existsSync(filePath)) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return Response.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

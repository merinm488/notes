/**
 * Development Server
 *
 * This runs both the Express API server and Vite dev server concurrently
 * for local development with full TextDB functionality
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DB_DIR = path.join(ROOT_DIR, 'db');
const USERS_DIR = path.join(DB_DIR, 'users');

// ==================== EXPRESS API SERVER ====================

const app = express();
const API_PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

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

// ==================== API ROUTES ====================

/**
 * GET /api/notes?hash={hash}
 * Get user data
 */
app.get('/api/notes', (req, res) => {
  try {
    const { hash } = req.query;

    if (!hash) {
      return res.status(400).json({ error: 'Hash is required' });
    }

    const userData = getUserData(hash);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/notes
 * Handle login and account creation
 */
app.post('/api/notes', (req, res) => {
  try {
    const { key, name, action } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Normalize key
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '-');
    const parts = normalizedKey.split('-');

    // Validate key format
    if (parts.length !== 3 || !parts.every(p => p.length >= 2 && /^[a-z]+$/.test(p))) {
      return res.status(400).json({ error: 'Invalid key format' });
    }

    // Generate hash on server
    const hash = generateHash(normalizedKey);

    // Handle login action
    if (action === 'login') {
      const userData = getUserData(hash);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Validate name matches
      const storedName = userData.settings?.name?.toLowerCase();
      const providedName = name.trim().toLowerCase();
      if (storedName && storedName !== providedName) {
        return res.status(401).json({ error: 'Name does not match our records' });
      }

      // Return hash and user data
      return res.json({
        success: true,
        hash,
        data: userData
      });
    }

    // Check if user already exists
    if (userExists(hash)) {
      return res.status(409).json({ error: 'User already exists', code: 'USER_EXISTS' });
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
        name: name.trim(),
        theme: 'dark',
        createdAt: new Date().toISOString()
      }
    };

    if (saveUserData(hash, newUserData)) {
      res.json({
        success: true,
        hash,
        message: 'Account created successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to create account' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/notes
 * Update user data
 */
app.put('/api/notes', (req, res) => {
  try {
    const { hash, action, data } = req.body;

    if (!hash || !action) {
      return res.status(400).json({ error: 'Hash and action are required' });
    }

    const userData = getUserData(hash);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
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
          pinned: false,
          archived: false
        };
        userData.notes.unshift(newNote);
        break;

      case 'updateNote':
        const noteIndex = userData.notes.findIndex(n => n.id === data.noteId);
        if (noteIndex === -1) {
          return res.status(404).json({ error: 'Note not found' });
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
          return res.status(404).json({ error: 'Folder not found' });
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
          return res.status(400).json({ error: 'Cannot delete default folder' });
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
        return res.status(400).json({ error: 'Invalid action' });
    }

    if (saveUserData(hash, userData)) {
      res.json({ success: true, data: userData });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/notes
 * Delete user account
 */
app.delete('/api/notes', (req, res) => {
  try {
    const { hash } = req.query;

    if (!hash) {
      return res.status(400).json({ error: 'Hash is required' });
    }

    const filePath = getUserFilePath(hash);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'User not found' });
    }

    fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== START SERVERS ====================

console.log('🚀 Starting development server...\n');

// Start Express API server on all interfaces
const apiServer = app.listen(API_PORT, '0.0.0.0', () => {
  console.log(`✅ API Server running on http://localhost:${API_PORT}`);
  console.log(`📁 TextDB data directory: ${DB_DIR}\n`);
});

// Start Vite dev server
const viteProcess = spawn('npm', ['exec', 'vite'], {
  cwd: ROOT_DIR,
  stdio: 'inherit'
});

viteProcess.on('error', (error) => {
  console.error('Failed to start Vite:', error);
  process.exit(1);
});

// Handle shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down servers...');
  apiServer.close();
  viteProcess.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('✅ Vite dev server starting...');
console.log('📱 App will be available at http://localhost:3002\n');
console.log('Press Ctrl+C to stop both servers\n');

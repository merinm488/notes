/**
 * TextDB Client
 *
 * This module communicates with the TextDB backend via REST API
 * All data is stored as JSON files on the server
 */

const API_BASE = '/api/notes';

// ===== API HELPERS =====

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// ===== USER OPERATIONS =====

/**
 * Get user data by hash
 * @param {string} hash - The hashed key
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function getUserData(hash) {
  try {
    const response = await apiRequest(`?hash=${encodeURIComponent(hash)}`);
    return response.data;
  } catch (error) {
    if (error.message === 'User not found') {
      return null;
    }
    throw error;
  }
}

/**
 * Create a new user account
 * @param {string} key - The user's custom key (plain text)
 * @returns {Promise<Object>} - Creation result
 */
export async function createUserData(key) {
  return apiRequest('', {
    method: 'POST',
    body: JSON.stringify({ key, action: 'createUser' })
  });
}

/**
 * Save user data (via PUT)
 * @param {string} hash - User's hash
 * @param {Object} userData - User data to save
 */
export async function saveUserData(hash, userData) {
  // Individual actions handle saving, this is just for compatibility
  return { success: true };
}

// ===== NOTE OPERATIONS =====

/**
 * Create a new note
 * @param {string} hash - User's hash
 * @param {Object} noteData - Note content { title, content, folderId }
 * @returns {Promise<Object>} - The created note
 */
export async function createNote(hash, noteData) {
  const response = await apiRequest('', {
    method: 'PUT',
    body: JSON.stringify({
      hash,
      action: 'createNote',
      data: noteData
    })
  });

  return response.data.notes[0]; // First note is the newly created one
}

/**
 * Get all notes for a user
 * @param {string} hash - User's hash
 * @returns {Promise<Array>} - Array of notes
 */
export async function getNotes(hash) {
  const userData = await getUserData(hash);
  return userData ? userData.notes : [];
}

/**
 * Get a single note by ID
 * @param {string} hash - User's hash
 * @param {string} noteId - Note ID
 * @returns {Promise<Object|null>} - Note object or null
 */
export async function getNoteById(hash, noteId) {
  const notes = await getNotes(hash);
  return notes.find(note => note.id === noteId) || null;
}

/**
 * Update an existing note
 * @param {string} hash - User's hash
 * @param {string} noteId - Note ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} - Updated note or null
 */
export async function updateNote(hash, noteId, updates) {
  const response = await apiRequest('', {
    method: 'PUT',
    body: JSON.stringify({
      hash,
      action: 'updateNote',
      data: { noteId, updates }
    })
  });

  return response.data.notes.find(n => n.id === noteId) || null;
}

/**
 * Delete a note
 * @param {string} hash - User's hash
 * @param {string} noteId - Note ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteNote(hash, noteId) {
  await apiRequest('', {
    method: 'PUT',
    body: JSON.stringify({
      hash,
      action: 'deleteNote',
      data: { noteId }
    })
  });

  return true;
}

/**
 * Toggle note pin status
 * @param {string} hash - User's hash
 * @param {string} noteId - Note ID
 * @returns {Promise<Object|null>} - Updated note or null
 */
export async function toggleNotePin(hash, noteId) {
  const response = await apiRequest('', {
    method: 'PUT',
    body: JSON.stringify({
      hash,
      action: 'togglePin',
      data: { noteId }
    })
  });

  return response.data.notes.find(n => n.id === noteId) || null;
}

/**
 * Toggle note archive status
 * @param {string} hash - User's hash
 * @param {string} noteId - Note ID
 * @returns {Promise<Object|null>} - Updated note or null
 */
export async function toggleNoteArchive(hash, noteId) {
  const response = await apiRequest('', {
    method: 'PUT',
    body: JSON.stringify({
      hash,
      action: 'toggleArchive',
      data: { noteId }
    })
  });

  return response.data.notes.find(n => n.id === noteId) || null;
}

// ===== FOLDER OPERATIONS =====

/**
 * Get all folders for a user
 * @param {string} hash - User's hash
 * @returns {Promise<Array>} - Array of folders
 */
export async function getFolders(hash) {
  const userData = await getUserData(hash);
  return userData ? userData.folders : [];
}

/**
 * Create a new folder
 * @param {string} hash - User's hash
 * @param {Object} folderData - { name, color }
 * @returns {Promise<Object>} - Created folder
 */
export async function createFolder(hash, folderData) {
  const response = await apiRequest('', {
    method: 'PUT',
    body: JSON.stringify({
      hash,
      action: 'createFolder',
      data: folderData
    })
  });

  return response.data.folders[response.data.folders.length - 1]; // Last folder is the new one
}

/**
 * Update a folder
 * @param {string} hash - User's hash
 * @param {string} folderId - Folder ID
 * @param {Object} updates - { name, color }
 * @returns {Promise<Object|null>} - Updated folder or null
 */
export async function updateFolder(hash, folderId, updates) {
  const response = await apiRequest('', {
    method: 'PUT',
    body: JSON.stringify({
      hash,
      action: 'updateFolder',
      data: { folderId, updates }
    })
  });

  return response.data.folders.find(f => f.id === folderId) || null;
}

/**
 * Delete a folder
 * @param {string} hash - User's hash
 * @param {string} folderId - Folder ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteFolder(hash, folderId) {
  try {
    await apiRequest('', {
      method: 'PUT',
      body: JSON.stringify({
        hash,
        action: 'deleteFolder',
        data: { folderId }
      })
    });
    return true;
  } catch (error) {
    if (error.message === 'Cannot delete default folder') {
      return false;
    }
    throw error;
  }
}

// ===== SEARCH OPERATIONS =====

/**
 * Search notes by query
 * @param {string} hash - User's hash
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Matching notes
 */
export async function searchNotes(hash, query) {
  const notes = await getNotes(hash);
  const lowerQuery = query.toLowerCase();

  return notes.filter(note =>
    note.title.toLowerCase().includes(lowerQuery) ||
    note.content.toLowerCase().includes(lowerQuery)
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Check if a user exists
 * @param {string} hash - User's hash
 * @returns {Promise<boolean>} - Whether user exists
 */
export async function userExists(hash) {
  try {
    await getUserData(hash);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get user statistics
 * @param {string} hash - User's hash
 * @returns {Promise<Object|null>} - Statistics object
 */
export async function getUserStats(hash) {
  const userData = await getUserData(hash);
  if (!userData) return null;

  return {
    noteCount: userData.notes.length,
    folderCount: userData.folders.length,
    totalWords: userData.notes.reduce((acc, note) =>
      acc + note.content.split(/\s+/).filter(w => w).length, 0
    ),
    accountAge: new Date(userData.settings.createdAt).getTime()
  };
}

/**
 * Clear all user data
 * @param {string} hash - User's hash
 */
export async function clearUserData(hash) {
  await apiRequest(`?hash=${encodeURIComponent(hash)}`, {
    method: 'DELETE'
  });
}

import { useState, useEffect, useCallback } from 'react';
import * as db from '../lib/db';

/**
 * Notes Data Hook
 *
 * Manages all notes and folder operations:
 * - Fetch notes and folders
 * - Create, update, delete notes
 * - Create, update, delete folders
 * - Search functionality
 */
export function useNotes(userHash) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all data for the user
   */
  const fetchData = useCallback(async () => {
    if (!userHash) return;

    setIsLoading(true);
    try {
      const userNotes = await db.getNotes(userHash);
      const userFolders = await db.getFolders(userHash);

      setNotes(userNotes || []);
      setFolders(userFolders || []);

      // Set default folder as active if none selected
      if (!activeFolder && userFolders && userFolders.length > 0) {
        setActiveFolder(userFolders[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setNotes([]);
      setFolders([]);
    }

    setIsLoading(false);
  }, [userHash, activeFolder]);

  /**
   * Create a new note
   */
  const createNote = useCallback(async (noteData) => {
    if (!userHash) return null;

    const newNote = await db.createNote(userHash, noteData);
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, [userHash]);

  /**
   * Update an existing note
   */
  const updateNote = useCallback(async (noteId, updates) => {
    if (!userHash) return null;

    const updatedNote = await db.updateNote(userHash, noteId, updates);
    if (updatedNote) {
      setNotes(prev =>
        prev.map(note =>
          note.id === noteId ? updatedNote : note
        )
      );
    }
    return updatedNote;
  }, [userHash]);

  /**
   * Delete a note
   */
  const deleteNote = useCallback(async (noteId) => {
    if (!userHash) return false;

    const success = await db.deleteNote(userHash, noteId);
    if (success) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }
    return success;
  }, [userHash]);

  /**
   * Toggle note pin status
   */
  const togglePin = useCallback(async (noteId) => {
    if (!userHash) return null;

    const updatedNote = await db.toggleNotePin(userHash, noteId);
    if (updatedNote) {
      setNotes(prev =>
        prev.map(note =>
          note.id === noteId ? updatedNote : note
        )
      );
    }
    return updatedNote;
  }, [userHash]);

  /**
   * Toggle note archive status
   */
  const toggleArchive = useCallback(async (noteId) => {
    if (!userHash) return null;

    const updatedNote = await db.toggleNoteArchive(userHash, noteId);
    if (updatedNote) {
      setNotes(prev =>
        prev.map(note =>
          note.id === noteId ? updatedNote : note
        )
      );
    }
    return updatedNote;
  }, [userHash]);

  /**
   * Create a new folder
   */
  const createFolder = useCallback(async (folderData) => {
    if (!userHash) return null;

    const newFolder = await db.createFolder(userHash, folderData);
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, [userHash]);

  /**
   * Update a folder
   */
  const updateFolder = useCallback(async (folderId, updates) => {
    if (!userHash) return null;

    const updatedFolder = await db.updateFolder(userHash, folderId, updates);
    if (updatedFolder) {
      setFolders(prev =>
        prev.map(folder =>
          folder.id === folderId ? updatedFolder : folder
        )
      );
    }
    return updatedFolder;
  }, [userHash]);

  /**
   * Delete a folder
   */
  const deleteFolder = useCallback(async (folderId) => {
    if (!userHash) return false;

    const success = await db.deleteFolder(userHash, folderId);
    if (success) {
      setFolders(prev => prev.filter(folder => folder.id !== folderId));

      // Move to default folder
      const defaultFolder = folders.find(f => f.isDefault);
      if (defaultFolder) {
        setActiveFolder(defaultFolder.id);
      }
    }
    return success;
  }, [userHash, folders]);

  /**
   * Get filtered notes based on active folder and search
   */
  const getFilteredNotes = useCallback(() => {
    // Make sure notes is an array
    if (!Array.isArray(notes)) {
      return [];
    }

    let filtered = notes;

    // Filter by archived status
    if (showArchived) {
      filtered = filtered.filter(note => note.archived === true);
    } else {
      filtered = filtered.filter(note => note.archived === false || note.archived === undefined);
    }

    // Apply search filter - searches across all folders when there's a search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    } else if (activeFolder && !showArchived) {
      // Only filter by folder when not searching and not in archived view
      filtered = filtered.filter(note => note.folderId === activeFolder);
    }

    // Sort: pinned first, then by date
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [notes, activeFolder, searchQuery, showArchived]);

  // Fetch data when user hash changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    notes,
    folders,
    activeFolder,
    searchQuery,
    showArchived,
    isLoading,
    filteredNotes: getFilteredNotes(),
    setActiveFolder,
    setSearchQuery,
    setShowArchived,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshData: fetchData
  };
}

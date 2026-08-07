import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import { Login } from './components/Login';
import { ThemeToggle } from './components/ThemeToggle';
import { UserDisplay } from './components/UserDisplay';
import { FolderList } from './components/FolderList';
import { SearchBar } from './components/SearchBar';
import NoteCard from './components/NoteCard';
import { NoteListView } from './components/NoteListView';
import { NoteActions } from './components/NoteActions';
import { NoteEditor } from './components/NoteEditor';
import { NotePreview } from './components/NotePreview';
import { Tooltip } from './components/Tooltip';
import * as db from './lib/db';

/**
 * Main Application Component
 *
 * This is the heart of the application that:
 * 1. Manages authentication state
 * 2. Handles all note operations
 * 3. Coordinates between all components
 * 4. Manages theme switching
 */
function App() {
  // Auth state
  const {
    userHash,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    errorCode,
    login,
    createAccount,
    logout,
    deleteAccount,
    getUserKey,
    checkSession
  } = useAuth();

  // Theme state
  const { theme, systemTheme, setTheme, getEffectiveTheme } = useTheme();

  // Notes state
  const {
    notes,
    folders,
    activeFolder,
    searchQuery,
    showArchived,
    filteredNotes,
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
    deleteFolder
  } = useNotes(userHash);

  // Editor state
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Mobile sidebar state - show by default on desktop, hidden on mobile/tablet
  const [showSidebar, setShowSidebar] = useState(() => {
    const width = window.innerWidth;
    // Show sidebar on large screens (lg: 1024px+), hide on smaller
    return width >= 1024;
  });

  // Mobile search expanded state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // View mode state with persistence
  const [viewMode, setViewMode] = useState(() => {
    // Load from localStorage on initial render
    return localStorage.getItem('secure_notes_view_mode') || 'card';
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('secure_notes_view_mode', viewMode);
  }, [viewMode]);

  // Handle window resize - only auto-show sidebar on large screens
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Only auto-show sidebar on large screens (don't auto-hide)
      if (width >= 1024 && !showSidebar) {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSidebar]);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Handle note card click - open preview
   */
  const handleNoteClick = useCallback((note) => {
    setViewingNote(note);
    // Close sidebar on mobile after selecting a note
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, []);

  /**
   * Handle creating a new note
   */
  const handleCreateNote = useCallback(() => {
    setIsCreatingNote(true);
  }, []);

  /**
   * Handle folder selection - switch to active view if in archived mode
   */
  const handleFolderSelect = useCallback((folderId) => {
    setActiveFolder(folderId);
    if (showArchived) {
      setShowArchived(false);
    }
    // Close sidebar on mobile after selecting a folder
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, [showArchived, setActiveFolder, setShowArchived]);

  /**
   * Generate unique ID for new notes
   */
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  /**
   * Handle saving note (create or update)
   */
  const handleSaveNote = useCallback((noteData) => {
    if (editingNote) {
      // Update existing note - construct the updated note object
      const updatedNote = {
        ...editingNote,
        ...noteData,
        id: editingNote.id, // Ensure ID is preserved
        updatedAt: new Date().toISOString()
      };
      updateNote(editingNote.id, noteData);

      // Close editor and show preview
      setEditingNote(null);
      setViewingNote(updatedNote);
    } else {
      // Create new note - construct the new note object
      const newNote = {
        id: generateId(),
        title: noteData.title || 'Untitled',
        content: noteData.content || '',
        contentType: noteData.contentType || 'plain-text',
        folderId: noteData.folderId || activeFolder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        archived: false
      };
      createNote(noteData);

      // Close editor and show preview
      setIsCreatingNote(false);
      setViewingNote(newNote);
    }
  }, [editingNote, updateNote, createNote, activeFolder]);

  /**
   * Handle deleting a note
   */
  const handleDeleteNote = useCallback(() => {
    if (editingNote) {
      deleteNote(editingNote.id);
      setEditingNote(null);
    }
  }, [editingNote, deleteNote]);

  // ===== LOGIN SCREEN =====
  if (!isAuthenticated) {
    const loginEffectiveTheme = getEffectiveTheme();

    return (
      <div className={`min-h-screen ${loginEffectiveTheme === 'dark' ? 'dark' : ''}`}>
        <Login
          onLogin={login}
          isLoading={authLoading}
          error={authError}
        />
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle theme={theme} systemTheme={systemTheme} onSetTheme={setTheme} />
        </div>
      </div>
    );
  }

  // ===== MAIN APPLICATION =====
  const effectiveTheme = getEffectiveTheme();

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'dark' : ''}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex">
        {/* ===== SIDEBAR ===== */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/10 dark:bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-lg">Notes</span>
              </div>
              {/* Close sidebar - mobile and desktop */}
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded hover:bg-gray-100 dark:bg-gray-700 transition-colors"
                aria-label="Close sidebar"
                title="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Folders */}
              <FolderList
                folders={folders}
                activeFolder={activeFolder}
                onFolderSelect={handleFolderSelect}
                onCreateFolder={createFolder}
                onDeleteFolder={deleteFolder}
              />

              {/* Notes in Sidebar */}
              {activeFolder && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Notes
                  </h3>
                  <div className="space-y-1">
                    {notes
                      .filter(n => showArchived ? n.archived === true : n.folderId === activeFolder && n.archived !== true)
                      .sort((a, b) => {
                        // Pinned notes first
                        if (a.pinned && !b.pinned) return -1;
                        if (!a.pinned && b.pinned) return 1;
                        // Then by date
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                      })
                      .map(note => (
                      <div
                        key={note.id}
                        onClick={() => handleNoteClick(note)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                          viewingNote?.id === note.id || editingNote?.id === note.id
                            ? 'bg-yellow-100 dark:bg-yellow-900/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {/* Note icon */}
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>

                        {/* Note title */}
                        <span className="flex-1 truncate text-sm text-gray-900 dark:text-gray-100">
                          {note.title || 'Untitled'}
                        </span>

                        {/* Note Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(note.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              note.pinned
                                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title={note.pinned ? 'Unpin note' : 'Pin note'}
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                            </svg>
                          </button>

                          <NoteActions
                            note={note}
                            onPin={togglePin}
                            onDelete={deleteNote}
                            onRename={(note, newTitle) => {
                              updateNote(note.id, { title: newTitle });
                            }}
                            onArchive={(n) => {
                              toggleArchive(n.id);
                            }}
                            isArchivedView={showArchived}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User info */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <UserDisplay
                userHash={userHash}
                onLogout={logout}
                onDeleteAccount={() => deleteAccount(userHash)}
                onShowKey={getUserKey}
              />
            </div>
          </div>
        </aside>

        {/* ===== OVERLAY for mobile ===== */}
        {showSidebar && (
          <div
            className="fixed inset-y-0 right-0 left-0 bg-black/50 z-20 lg:hidden"
            style={{ left: '18rem' }} // w-72 = 18rem, start overlay after sidebar
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* ===== MAIN CONTENT ===== */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${showSidebar ? 'lg:ml-72' : 'lg:ml-0'}`}>
          {/* Header */}
          <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-3 gap-2 sm:gap-4">
              {/* Mobile search expanded mode */}
              {isSearchExpanded ? (
                <>
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700"
                    aria-label="Close search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Expanded search input */}
                  <div className="flex-1 mx-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notes..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      autoFocus
                    />
                  </div>

                  {/* Clear button */}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700"
                      aria-label="Clear search"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* Desktop/tablet sidebar toggle button */}
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 items-center justify-center transition-all duration-200"
                    aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
                  >
                    <div className={`transition-transform duration-200 ${showSidebar ? '' : 'rotate-180'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Search - desktop/tablet */}
                  <div className="hidden lg:block flex-1 max-w-md mx-4 min-w-0">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      resultCount={filteredNotes.length}
                    />
                  </div>

                  {/* Mobile search icon */}
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700"
                    aria-label="Search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>

                  {/* Actions - hidden only when search is expanded on mobile */}
                  <div className={`${isSearchExpanded ? 'hidden' : ''} flex items-center gap-2 sm:gap-2`}>
                    <ThemeToggle theme={theme} systemTheme={systemTheme} onSetTheme={setTheme} />
                    <Tooltip text={viewMode === 'card' ? 'Switch to list view' : 'Switch to card view'}>
                      <button
                        onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {viewMode === 'card' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        )}
                      </button>
                    </Tooltip>
                    <Tooltip text={showArchived ? 'Show active notes' : 'Show archived notes'}>
                      <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`p-2 rounded-lg transition-colors ${
                          showArchived
                            ? 'bg-yellow-500 text-black'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                    </Tooltip>
                    {!showArchived && (
                      <Tooltip text="Create new note">
                        <button
                          onClick={handleCreateNote}
                          className="btn-primary flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="hidden sm:inline">New Note</span>
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Folder/View indicator */}
          <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {showArchived ? 'Archived Notes' : (folders.find(f => f.id === activeFolder)?.name || 'All Notes')}
            </h2>
          </div>

          {/* Notes Grid */}
          <div className="p-4 sm:p-6">
            {filteredNotes.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {searchQuery ? 'No notes found' : showArchived ? '' : 'No notes yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery
                    ? 'Try a different search term'
                    : showArchived
                      ? 'No notes in archive'
                      : 'Welcome! Create your first note to get started'}
                </p>
                {!searchQuery && !showArchived && (
                  <button onClick={handleCreateNote} className="btn-primary">
                    Create First Note
                  </button>
                )}
              </div>
            ) : (
              // Notes view - card or list
              viewMode === 'card' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={handleNoteClick}
                      onPin={togglePin}
                      isPinned={note.pinned}
                      onDelete={deleteNote}
                      onRename={(note, newTitle) => {
                        updateNote(note.id, { title: newTitle });
                      }}
                      onArchive={(n) => {
                        toggleArchive(n.id);
                      }}
                      isArchivedView={showArchived}
                      folders={folders}
                      currentFolderId={activeFolder}
                      isSearchResult={searchQuery.length > 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="max-w-5xl mx-auto">
                  <NoteListView
                    notes={filteredNotes}
                    onClick={handleNoteClick}
                    onPin={togglePin}
                    onDelete={deleteNote}
                    onRename={(note, newTitle) => {
                      updateNote(note.id, { title: newTitle });
                    }}
                    onArchive={(n) => {
                      toggleArchive(n.id);
                    }}
                    isArchivedView={showArchived}
                    folders={folders}
                    currentFolderId={activeFolder}
                    isSearchResult={searchQuery.length > 0}
                  />
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* ===== NOTE PREVIEW MODAL ===== */}
      {viewingNote && (
        <NotePreview
          note={viewingNote}
          folders={folders}
          onEdit={() => {
            setEditingNote(viewingNote);
            setViewingNote(null);
          }}
          onDelete={() => {
            deleteNote(viewingNote.id);
            setViewingNote(null);
          }}
          onClose={() => setViewingNote(null)}
          onContentUpdate={(noteId, updates) => {
            updateNote(noteId, updates);
            // Update the viewingNote to reflect changes
            setViewingNote(prev => prev ? { ...prev, ...updates } : null);
          }}
        />
      )}

      {/* ===== NOTE EDITOR MODAL ===== */}
      {(editingNote || isCreatingNote) && (
        <NoteEditor
          note={editingNote}
          folders={folders}
          activeFolder={activeFolder}
          onSave={handleSaveNote}
          onCancel={() => {
            setEditingNote(null);
            setIsCreatingNote(false);
          }}
          onDelete={handleDeleteNote}
        />
      )}
    </div>
  );
}

export default App;

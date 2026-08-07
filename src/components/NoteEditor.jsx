import { useState, useEffect, useCallback } from 'react';
import { MarkdownEditor } from './MarkdownEditor';

/**
 * NoteEditor Component
 *
 * Full-featured note editor with:
 * - Title editing
 * - Content editing (plain text or markdown)
 * - Folder selection
 * - Content type selection (plain-text / markdown)
 * - Save and cancel actions
 * - Delete option
 * - Auto-save for checkbox changes
 */
export function NoteEditor({
  note,
  folders,
  activeFolder,
  onSave,
  onCancel,
  onDelete
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [contentType, setContentType] = useState(note?.contentType || 'plain-text');
  const [folderId, setFolderId] = useState(note?.folderId || activeFolder);
  const [isDirty, setIsDirty] = useState(false);

  // Track changes
  useEffect(() => {
    setIsDirty(
      title !== (note?.title || '') ||
      content !== (note?.content || '') ||
      contentType !== (note?.contentType || 'plain-text') ||
      folderId !== (note?.folderId || activeFolder)
    );
  }, [title, content, contentType, folderId, note, activeFolder]);

  /**
   * Handle save
   */
  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onCancel();
      return;
    }

    onSave({
      title: title.trim() || 'Untitled',
      content: content.trim(),
      contentType,
      folderId
    });
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = () => {
    if (confirm('Delete this note? This cannot be undone.')) {
      onDelete();
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      }
      // Escape to cancel (only if not dirty)
      if (e.key === 'Escape' && !isDirty) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, handleSave]);

  /**
   * Handle content changes from regular editing (typing)
   * Only updates local state, does NOT auto-save
   */
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-2xl font-bold bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
            autoFocus
          />

          {/* Folder Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">in</span>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-gray-100"
            >
              {folders.map(folder => (
                <option key={folder.id} value={folder.id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">as</span>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-gray-100"
            >
              <option value="plain-text" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Plain Text
              </option>
              <option value="markdown" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Markdown
              </option>
            </select>
          </div>

          {/* Content Editor - Plain Text or Markdown */}
          {contentType === 'markdown' ? (
            <MarkdownEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing your note... (supports **bold**, *italic*, `code`, > quotes, lists, tables, etc.)"
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="w-full min-h-[300px] bg-transparent border-0 focus:ring-0 p-0 resize-none placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed text-gray-900 dark:text-gray-100"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Delete button (only for existing notes) */}
          {note && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
            >
              Delete
            </button>
          )}

          {!note && <div />}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              {note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NoteCard Component
 *
 * Displays a single note in the notes list with:
 * - Title and preview
 * - Date info
 * - Pin indicator
 * - Click to edit
 * - Actions menu
 */
import { NoteActions } from './NoteActions';
import { memo } from 'react';

function NoteCard({ note, onClick, onPin, isPinned, onDelete, onRename, onArchive, isArchivedView = false, folders = [], currentFolderId = null, isSearchResult = false }) {
  // Format date for display
  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Get preview of content (first 100 chars)
  const getPreview = (content, contentType = 'plain-text') => {
    if (!content) return 'No content';

    if (contentType === 'markdown') {
      // Strip markdown syntax for preview
      let stripped = content
        .replace(/^#{1,6}\s+/gm, '') // Headers: # ## ### etc.
        .replace(/\*\*\*([^*]+)\*\*\*/g, '$1') // Bold + Italic
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
        .replace(/\*([^*]+)\*/g, '$1') // Italic
        .replace(/~~([^~]+)~~/g, '$1') // Strikethrough
        .replace(/`([^`]+)`/g, '$1') // Inline code
        .replace(/```[\s\S]*?```/g, '[code block]') // Code blocks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links: [text](url) -> text
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
        .replace(/^>\s+/gm, '') // Blockquotes
        .replace(/^\s*[-*+]\s+/gm, '') // Bulleted lists
        .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
        .replace(/^\s*-\s*\[\s*\]\s+/gm, '') // Task lists
        .replace(/^---$/gm, '') // Horizontal rules
        .replace(/\|.*\|/g, '') // Tables (basic)
        .replace(/\n/g, ' ') // Newlines to spaces
        .trim();

      return stripped.length > 100
        ? stripped.substring(0, 100) + '...'
        : stripped;
    }

    // Original plain text handling
    const stripped = content.replace(/[#*`\-\[\]]/g, '').trim();
    return stripped.length > 100
      ? stripped.substring(0, 100) + '...'
      : stripped;
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md relative flex flex-col min-h-[160px]"
      onClick={() => onClick(note)}
    >
      {/* Header with title and action buttons */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-lg line-clamp-1 flex-1 text-gray-900 dark:text-gray-100 pr-2">
          {note.title || 'Untitled'}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Pin Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(note.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isPinned
                ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
            </svg>
          </button>

          {/* Actions Menu */}
          <NoteActions
            note={note}
            onPin={onPin}
            onDelete={onDelete}
            onRename={onRename}
            onArchive={onArchive}
            isArchivedView={isArchivedView}
          />
        </div>
      </div>

      {/* Content preview - takes available space */}
      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3 flex-grow">
        {getPreview(note.content, note.contentType)}
      </p>

      {/* Footer - fixed at bottom */}
      <div className="mt-auto">
        {/* Folder badge - show when in archived view, search, or when note is from different folder */}
        {(isArchivedView || isSearchResult || (currentFolderId && note.folderId !== currentFolderId)) && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {folders.find(f => f.id === note.folderId)?.name || 'Unknown Folder'}
            </span>
          </div>
        )}

        {/* Date - always at bottom */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatDate(note.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(NoteCard);

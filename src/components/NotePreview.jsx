import MarkdownPreview from './MarkdownPreview';

/**
 * NotePreview Component
 *
 * Shows a note in read-only mode with:
 * - Full title and content
 * - Markdown rendering if applicable
 * - Edit button to open editor
 * - Delete option
 */
export function NotePreview({
  note,
  folders,
  onEdit,
  onDelete,
  onClose
}) {
  const folderName = folders.find(f => f.id === note.folderId)?.name || 'Unknown Folder';

  const handleDelete = () => {
    if (confirm('Delete this note? This cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 dark:bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {note.contentType === 'markdown' ? 'Markdown' : 'Plain Text'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Edit button */}
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              title="Edit note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {note.title || 'Untitled'}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-3 mb-6 text-sm text-gray-500 dark:text-gray-400">
            {/* Folder badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {folderName}
            </span>

            {/* Pin indicator */}
            {note.pinned && (
              <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                </svg>
                Pinned
              </span>
            )}

            {/* Date */}
            <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Content */}
          <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
            {note.contentType === 'markdown' ? (
              <MarkdownPreview
                content={note.content}
                readOnly={true}
              />
            ) : (
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {note.content || 'No content'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-start p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleDelete}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

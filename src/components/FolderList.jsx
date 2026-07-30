import { useState } from 'react';

/**
 * FolderList Component
 *
 * Displays and manages folders:
 * - List all folders
 * - Active folder indicator
 * - Create new folder
 * - Delete folder (with confirmation)
 */
export function FolderList({
  folders,
  activeFolder,
  onFolderSelect,
  onCreateFolder,
  onDeleteFolder
}) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#FACC15');

  /**
   * Handle creating a new folder
   */
  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder({
        name: newFolderName.trim(),
        color: newFolderColor
      });
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  /**
   * Handle deleting a folder
   */
  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation();
    const folder = folders.find(f => f.id === folderId);
    if (folder && !folder.isDefault) {
      if (confirm(`Delete "${folder.name}"? Notes will move to All Notes.`)) {
        onDeleteFolder(folderId);
      }
    }
  };

  // Predefined colors for folder creation
  const folderColors = [
    '#FACC15', // Yellow
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ];

  // Count notes per folder
  const getFolderNoteCount = (folderId) => {
    // This would need to be passed from parent, for now just return placeholder
    return 0;
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Folders
        </h2>
        <button
          onClick={() => setShowNewFolder(!showNewFolder)}
          className="p-1 rounded hover:bg-bg-tertiary transition-colors"
          title="New folder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* New Folder Form */}
      {showNewFolder && (
        <form onSubmit={handleCreateFolder} className="p-3 space-y-2 bg-bg-tertiary/50 rounded-lg mb-2 animate-fade-in">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="input-base text-sm py-1.5"
            autoFocus
          />

          {/* Color picker */}
          <div className="flex gap-1 flex-wrap">
            {folderColors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setNewFolderColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  newFolderColor === color ? 'ring-2 ring-offset-1 ring-offset-bg-secondary' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-1.5 flex-1">
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewFolder(false);
                setNewFolderName('');
              }}
              className="btn-ghost text-xs py-1.5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Folder List */}
      <div className="space-y-0.5">
        {folders.map(folder => (
          <div
            key={folder.id}
            onClick={() => onFolderSelect(folder.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
              activeFolder === folder.id
                ? 'bg-accent/10 text-accent'
                : 'hover:bg-bg-tertiary/50 text-text-primary'
            }`}
          >
            {/* Folder icon with color */}
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: folder.color }}
            />

            {/* Folder name */}
            <span className="flex-1 truncate text-sm font-medium">
              {folder.name}
            </span>

            {/* Delete button (non-default folders only) */}
            {!folder.isDefault && (
              <button
                onClick={(e) => handleDeleteFolder(folder.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-bg-tertiary transition-all"
                title="Delete folder"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

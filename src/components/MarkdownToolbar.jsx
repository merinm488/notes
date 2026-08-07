import { useState } from 'react';
import { Tooltip } from './Tooltip';

/**
 * MarkdownToolbar Component
 *
 * Provides markdown formatting buttons:
 * - Bold, Italic, Strikethrough, Code, Code Block
 * - Link, Quote, Lists, Task List, Table, Horizontal Rule
 * - Inserts syntax at cursor position
 * - Responsive: collapses to menu on mobile
 */
export function MarkdownToolbar({ onInsert, onPreviewToggle, isPreviewMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Insert markdown syntax at cursor position
   */
  const insertFormatting = (syntax, placeholder = 'text') => {
    onInsert(syntax, placeholder);
  };

  // Toolbar button groups
  const textFormatting = [
    { name: 'Bold', icon: 'B', shortcut: 'Ctrl+B', syntax: '**', placeholder: 'bold text' },
    { name: 'Italic', icon: 'I', shortcut: 'Ctrl+I', syntax: '*', placeholder: 'italic text' },
    { name: 'Strikethrough', icon: 'S', shortcut: '', syntax: '~~', placeholder: 'strikethrough' },
  ];

  const codeFormatting = [
    { name: 'Code', icon: '<>', shortcut: 'Ctrl+`', syntax: '`', placeholder: 'code' },
    { name: 'Code Block', icon: '{}', shortcut: 'Ctrl+Shift+`', syntax: '```\n', placeholder: 'code block' },
  ];

  const insertItems = [
    { name: 'Link', icon: '🔗', shortcut: 'Ctrl+K', syntax: '[', placeholder: 'link text](url)' },
    { name: 'Quote', icon: '"', shortcut: 'Ctrl+Q', syntax: '> ', placeholder: 'quote' },
    { name: 'Bulleted List', icon: '•', shortcut: 'Ctrl+L', syntax: '- ', placeholder: 'list item' },
    { name: 'Numbered List', icon: '1.', shortcut: '', syntax: '1. ', placeholder: 'list item' },
    { name: 'Table', icon: '📊', shortcut: '', syntax: '| Header | Header |\n| --- | --- |\n| Cell | Cell |', placeholder: '' },
    { name: 'Horizontal Rule', icon: '—', shortcut: '', syntax: '\n---\n', placeholder: '' },
  ];

  // Desktop toolbar
  const ToolbarButton = ({ item, onClick }) => (
    <Tooltip text={item.name + (item.shortcut ? ` (${item.shortcut})` : '')}>
      <button
        type="button"
        onClick={() => onClick(item.syntax, item.placeholder)}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
        disabled={isPreviewMode}
        aria-label={item.name}
      >
        <span className="font-mono text-sm font-bold">{item.icon}</span>
      </button>
    </Tooltip>
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Mobile menu button */}
      <div className="sm:hidden flex w-full">
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 w-full justify-between"
        >
          <span className="font-medium">Formatting</span>
          <svg
            className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Desktop toolbar */}
      <div className="hidden sm:flex flex-wrap items-center gap-1">
        {/* Text Formatting Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
          {textFormatting.map((item) => (
            <ToolbarButton
              key={item.name}
              item={item}
              onClick={insertFormatting}
            />
          ))}
        </div>

        {/* Code Formatting Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
          {codeFormatting.map((item) => (
            <ToolbarButton
              key={item.name}
              item={item}
              onClick={insertFormatting}
            />
          ))}
        </div>

        {/* Insert Items Group */}
        <div className="flex items-center gap-1 flex-wrap">
          {insertItems.map((item) => (
            <ToolbarButton
              key={item.name}
              item={item}
              onClick={insertFormatting}
            />
          ))}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="sm:hidden w-full grid grid-cols-4 gap-1 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {textFormatting.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                insertFormatting(item.syntax, item.placeholder);
                setIsMenuOpen(false);
              }}
              className="p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 flex flex-col items-center gap-1 disabled:opacity-50"
              disabled={isPreviewMode}
            >
              <span className="font-mono text-lg font-bold">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
          {codeFormatting.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                insertFormatting(item.syntax, item.placeholder);
                setIsMenuOpen(false);
              }}
              className="p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 flex flex-col items-center gap-1 disabled:opacity-50"
              disabled={isPreviewMode}
            >
              <span className="font-mono text-lg font-bold">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
          {insertItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                insertFormatting(item.syntax, item.placeholder);
                setIsMenuOpen(false);
              }}
              className="p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 flex flex-col items-center gap-1 disabled:opacity-50"
              disabled={isPreviewMode}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Preview Toggle Button */}
      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <Tooltip text={isPreviewMode ? 'Edit mode' : 'Preview mode'}>
          <button
            type="button"
            onClick={onPreviewToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isPreviewMode
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isPreviewMode ? (
              <>
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </>
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

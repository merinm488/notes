import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MarkdownToolbar } from './MarkdownToolbar';
import MarkdownPreview from './MarkdownPreview';

/**
 * MarkdownEditor Component
 *
 * Combines toolbar with editor/preview:
 * - Edit mode: textarea with markdown syntax
 * - Preview mode: rendered markdown output
 * - Toolbar for formatting insertion
 * - Handles cursor position for text insertion
 * - Separates regular edits from checkbox toggles
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing your note...',
  disabled = false
}) {
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
  const textareaRef = useRef(null);

  /**
   * Handle keyboard shortcuts for enhanced editing (numbered lists, tab, etc.)
   */
  const handleKeyDown = useCallback((e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const newText = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Handle Enter key - auto-continue numbered and bullet lists
    if (e.key === 'Enter') {
      // Check for numbered list first
      const numberedListInfo = getNumberedListInfo(value, start);

      if (numberedListInfo) {
        e.preventDefault();

        // Get text before and after cursor
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);

        // If the current line is empty (just the number), remove it and exit list
        if (numberedListInfo.isEmpty) {
          const newText = beforeCursor.replace(/\d+\.\s*$/, '') + afterCursor;
          onChange(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - numberedListInfo.afterNumber.length - numberedListInfo.number.toString().length - numberedListInfo.indent.length;
          }, 0);
          return;
        }

        // Continue the numbered list with the next number
        const nextNumber = numberedListInfo.number + 1;
        const continuation = '\n' + numberedListInfo.indent + nextNumber + '. ';
        const newText = beforeCursor + continuation + afterCursor;

        onChange(newText);

        // Position cursor after the new number
        const newCursorPos = start + continuation.length;
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
        return;
      }

      // Check for bullet list
      const bulletListInfo = getBulletListInfo(value, start);

      if (bulletListInfo) {
        e.preventDefault();

        // Get text before and after cursor
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);

        // If the current line is empty (just the bullet), remove it and exit list
        if (bulletListInfo.isEmpty) {
          const newText = beforeCursor.replace(/[-*]\s*$/, '') + afterCursor;
          onChange(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - bulletListInfo.afterBullet.length - bulletListInfo.bullet.length - bulletListInfo.indent.length;
          }, 0);
          return;
        }

        // Continue the bullet list with the same bullet
        const continuation = '\n' + bulletListInfo.indent + bulletListInfo.bullet + bulletListInfo.afterBullet;
        const newText = beforeCursor + continuation + afterCursor;

        onChange(newText);

        // Position cursor after the new bullet
        const newCursorPos = start + continuation.length;
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
        return;
      }
    }

    // Handle Backspace - exit numbered list if at the end of the number marker
    if (e.key === 'Backspace') {
      // Check for numbered list
      const numberedListInfo = getNumberedListInfo(value, start);

      if (numberedListInfo && numberedListInfo.isEmpty && start > numberedListInfo.indent.length + numberedListInfo.number.toString().length + numberedListInfo.afterNumber.length) {
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);

        // Check if cursor is right after the number marker
        const lineUpToCursor = beforeCursor.split('\n').pop();
        if (lineUpToCursor === numberedListInfo.indent + numberedListInfo.number + numberedListInfo.afterNumber) {
          e.preventDefault();
          const newText = beforeCursor.substring(0, start - numberedListInfo.afterNumber.length - numberedListInfo.number.toString().length - numberedListInfo.indent.length) + afterCursor;
          onChange(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - numberedListInfo.afterNumber.length - numberedListInfo.number.toString().length - numberedListInfo.indent.length;
          }, 0);
          return;
        }
      }

      // Check for bullet list
      const bulletListInfo = getBulletListInfo(value, start);

      if (bulletListInfo && bulletListInfo.isEmpty && start > bulletListInfo.indent.length + bulletListInfo.bullet.length + bulletListInfo.afterBullet.length) {
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);

        // Check if cursor is right after the bullet marker
        const lineUpToCursor = beforeCursor.split('\n').pop();
        if (lineUpToCursor === bulletListInfo.indent + bulletListInfo.bullet + bulletListInfo.afterBullet) {
          e.preventDefault();
          const newText = beforeCursor.substring(0, start - bulletListInfo.afterBullet.length - bulletListInfo.bullet.length - bulletListInfo.indent.length) + afterCursor;
          onChange(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - bulletListInfo.afterBullet.length - bulletListInfo.bullet.length - bulletListInfo.indent.length;
          }, 0);
          return;
        }
      }
    }
  }, [value, onChange]);

  /**
   * Detect numbered list pattern and extract current number
   */
  const getNumberedListInfo = (text, cursorPosition) => {
    const lines = text.substring(0, cursorPosition).split('\n');
    const currentLine = lines[lines.length - 1];
    const match = currentLine.match(/^(\s*)(\d+)(\.\s+)(.*)$/);
    if (match) {
      return {
        indent: match[1],
        number: parseInt(match[2], 10),
        afterNumber: match[3],
        content: match[4],
        isEmpty: match[4].trim() === ''
      };
    }
    return null;
  };

  /**
   * Detect bullet list pattern and extract bullet info
   */
  const getBulletListInfo = (text, cursorPosition) => {
    const lines = text.substring(0, cursorPosition).split('\n');
    const currentLine = lines[lines.length - 1];
    const match = currentLine.match(/^(\s*)([-*])(\s+)(.*)$/);
    if (match) {
      return {
        indent: match[1],
        bullet: match[2],
        afterBullet: match[3],
        content: match[4],
        isEmpty: match[4].trim() === ''
      };
    }
    return null;
  };

  /**
   * Insert markdown syntax at cursor position
   */
  const handleInsert = useCallback((syntax, placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value;

    // Calculate new text with syntax inserted
    let newText;
    let newCursorPos;

    // Special handling for links: [text](url)
    if (syntax === '[' && placeholder.includes('](url)')) {
      if (start === end) {
        // No text selected, insert full link template
        newText = text.substring(0, start) + '[text](url)' + text.substring(end);
        newCursorPos = start + 1; // Cursor after '['
      } else {
        // Text selected, wrap as link
        const selectedText = text.substring(start, end);
        newText = text.substring(0, start) + '[' + selectedText + '](url)' + text.substring(end);
        newCursorPos = start + selectedText.length + 4; // Cursor after '](ur' - before 'l)'
      }
    } else if (syntax === '```\n' || syntax.startsWith('\n')) {
      // Special handling for code blocks and other block-level syntax
      // These use opening and closing markers on separate lines
      const closingSyntax = syntax.includes('\n') ? syntax.trim() : syntax;
      const openingSyntax = syntax;

      if (start === end) {
        // No text selected, insert code block with placeholder
        const before = text.substring(0, start);
        const after = text.substring(end);

        // Ensure we're on a new line for code block start
        const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
        const needsTrailingNewline = after.length > 0 && !after.startsWith('\n');

        newText = before +
                  (needsLeadingNewline ? '\n' : '') +
                  openingSyntax +
                  placeholder +
                  '\n' +
                  closingSyntax +
                  (needsTrailingNewline ? '\n' : '') +
                  after;
        newCursorPos = start + (needsLeadingNewline ? 1 : 0) + openingSyntax.length;
      } else {
        // Text selected, wrap selection with code block markers
        const selectedText = text.substring(start, end);
        const before = text.substring(0, start);
        const after = text.substring(end);

        const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
        const needsTrailingNewline = after.length > 0 && !after.startsWith('\n');

        newText = before +
                  (needsLeadingNewline ? '\n' : '') +
                  openingSyntax +
                  selectedText +
                  '\n' +
                  closingSyntax +
                  (needsTrailingNewline ? '\n' : '') +
                  after;
        newCursorPos = end + (needsLeadingNewline ? 1 : 0) + openingSyntax.length + 1;
      }
    } else if (syntax.endsWith(' ') && (syntax.startsWith('> ') || syntax.startsWith('- ') || syntax.startsWith('* ') || syntax.match(/^\d+\.\s$/))) {
      // Special handling for block-level line prefixes (quotes, lists, etc.)
      // These prefixes should only appear at the start, not wrap the content
      if (start === end) {
        // No text selected, insert line with placeholder
        const before = text.substring(0, start);
        const after = text.substring(end);

        // Ensure we're on a new line
        const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');

        newText = before +
                  (needsLeadingNewline ? '\n' : '') +
                  syntax +
                  placeholder +
                  after;
        newCursorPos = start + (needsLeadingNewline ? 1 : 0) + syntax.length;
      } else {
        // Text selected, apply prefix to each line of selection
        const selectedText = text.substring(start, end);
        const before = text.substring(0, start);
        const after = text.substring(end);

        const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');

        // Apply prefix to each line
        const lines = selectedText.split('\n');
        const prefixedLines = lines.map(line => syntax + line);
        const prefixedText = prefixedLines.join('\n');

        newText = before +
                  (needsLeadingNewline ? '\n' : '') +
                  prefixedText +
                  after;
        newCursorPos = end + (needsLeadingNewline ? 1 : 0) + (lines.length * syntax.length);
      }
    } else if (start === end) {
      // No text selected, insert wrapping syntax with placeholder
      if (placeholder) {
        newText = text.substring(0, start) + syntax + placeholder + syntax + text.substring(end);
        newCursorPos = start + syntax.length;
      } else {
        newText = text.substring(0, start) + syntax + text.substring(end);
        newCursorPos = start + syntax.length;
      }
    } else {
      // Text selected, wrap selection with syntax
      const selectedText = text.substring(start, end);
      newText = text.substring(0, start) + syntax + selectedText + syntax + text.substring(end);
      newCursorPos = start + syntax.length + selectedText.length + syntax.length;
    }

    onChange(newText);

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e) => {
      // Ctrl/Cmd + B: Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleInsert('**', 'bold text');
      }
      // Ctrl/Cmd + I: Italic
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        handleInsert('*', 'italic text');
      }
      // Ctrl/Cmd + K: Link
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleInsert('[', 'link text');
      }
      // Ctrl/Cmd + `: Code
      else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        handleInsert('`', 'code');
      }
      // Ctrl/Cmd + Shift + `: Code Block
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '`') {
        e.preventDefault();
        handleInsert('```\n', 'code');
      }
      // Ctrl/Cmd + Q: Quote
      else if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        handleInsert('> ', 'quote');
      }
      // Ctrl/Cmd + L: List
      else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        handleInsert('- ', 'list item');
      }
      // Ctrl/Cmd + E: Toggle Edit/Preview
      else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setMode(mode === 'edit' ? 'preview' : 'edit');
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => textarea.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleInsert]);

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <MarkdownToolbar
        onInsert={handleInsert}
        onPreviewToggle={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
        isPreviewMode={mode === 'preview'}
      />

      {/* Editor/Preview Panel */}
      <div className="flex-1 min-h-[300px] bg-white dark:bg-gray-800">
        {mode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full min-h-[300px] bg-transparent border-0 focus:ring-0 p-4 resize-none placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed text-gray-900 dark:text-gray-100 font-mono text-sm"
            // Handle keyboard shortcuts for enhanced editing
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="p-4 overflow-y-auto min-h-[300px] max-h-[500px]">
            <MarkdownPreview
              content={value}
              onContentChange={onChange}
              readOnly={false}
            />
          </div>
        )}
      </div>

      {/* Mode indicator */}
      <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}

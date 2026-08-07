import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import { memo } from 'react';
import React from 'react';
import 'highlight.js/styles/github-dark.css';

/**
 * MarkdownPreview Component
 *
 * Renders markdown content with:
 * - GitHub Flavored Markdown (tables, task lists, strikethrough)
 * - Syntax highlighting for code blocks
 * - Dark/light theme support
 * - Responsive typography
 */
function MarkdownPreview({ content, onContentChange, readOnly = false }) {
  return (
    <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom component styling for better dark mode support
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed [&_a]:!text-blue-600 [&_a]:dark:!text-blue-400">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={className}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
              {children}
            </blockquote>
          ),
          ul: ({ children, ...props }) => (
            <ul {...props} className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-1 [&_a]:!text-blue-600 [&_a]:dark:!text-blue-400">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-1 [&_a]:!text-blue-600 [&_a]:dark:!text-blue-400">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="[&_a]:!text-blue-600 [&_a]:dark:!text-blue-400 mb-1">
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="!text-blue-600 dark:!text-blue-400 !underline hover:!text-blue-800 dark:hover:!text-blue-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table {...props} className="min-w-full border border-gray-200 dark:border-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead {...props} className="bg-gray-50 dark:bg-gray-800">
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody {...props} className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr {...props} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th {...props} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(MarkdownPreview);

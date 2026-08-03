import { useState, useEffect, useCallback } from 'react';
import { generateRandomKey } from '../lib/wordlist';
import { normalizeKey } from '../lib/cryptoUtils';

/**
 * Login Component
 *
 * This is the entry point for the application.
 * Users enter their three-word key - if it doesn't exist, they can create a new account.
 */
export function Login({ onLogin, onCreateAccount, isLoading, error, errorCode }) {
  const [keyInput, setKeyInput] = useState('');
  const [wasLoading, setWasLoading] = useState(false);
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);
  const [pendingKey, setPendingKey] = useState(null);
  const [userDismissedPrompt, setUserDismissedPrompt] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [isGeneratedKey, setIsGeneratedKey] = useState(false);

  // Clear key input after successful login/account creation
  useEffect(() => {
    if (wasLoading && !isLoading) {
      // Operation completed - clear the key for security and reset state
      // Only clear if it was successful (no error)
      if (!error) {
        setKeyInput('');
      }
      setShowCreatePrompt(false);
      setPendingKey(null);
      setUserDismissedPrompt(false);
    }
    setWasLoading(isLoading);
  }, [isLoading, error]);

  // Show create prompt when USER_NOT_FOUND error occurs (only if user hasn't dismissed)
  useEffect(() => {
    if (errorCode === 'USER_NOT_FOUND' && keyInput && !isLoading && !userDismissedPrompt) {
      setShowCreatePrompt(true);
      setPendingKey(normalizeKey(keyInput.trim()));
      setIsGeneratedKey(false); // Manual entry, not generated
    } else if (!error || errorCode !== 'USER_NOT_FOUND') {
      // Only clear prompt if error is completely gone or is a different error
      if (!error) {
        setShowCreatePrompt(false);
        setPendingKey(null);
        setUserDismissedPrompt(false);
        setIsGeneratedKey(false);
      }
    }
  }, [errorCode, error, keyInput, isLoading, userDismissedPrompt]);

  /**
   * Handle login form submission
   */
  const handleLogin = (e) => {
    e.preventDefault();
    if (keyInput.trim()) {
      // Reset dismissed flag when user explicitly submits
      setUserDismissedPrompt(false);
      // Normalize the key before sending to server
      onLogin(normalizeKey(keyInput.trim()));
    }
  };

  /**
   * Handle "Yes" - Create account with the entered key
   */
  const handleCreateAccount = useCallback(() => {
    if (pendingKey) {
      onCreateAccount(pendingKey);
    }
  }, [pendingKey, onCreateAccount]);

  /**
   * Handle "No" - Allow user to edit the key
   */
  const handleEditKey = useCallback(() => {
    setShowCreatePrompt(false);
    setPendingKey(null);
    setUserDismissedPrompt(true);
  }, []);

  /**
   * Generate a random key
   */
  const handleGenerateKey = () => {
    const randomKey = generateRandomKey();
    setKeyInput(randomKey);
    setPendingKey(randomKey);
    setIsGeneratedKey(true);
    setShowCreatePrompt(true);
    setUserDismissedPrompt(false);
  };

  /**
   * Format key for display (with word-spacing)
   */
  const formatKeyDisplay = (key) => {
    return key.split('-').join(' — ');
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-auto">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400/10 mb-4 dark:bg-white/10">
            <svg
              className="w-8 h-8 text-yellow-500 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-slide-up">
          {/* Create Account Prompt */}
          {showCreatePrompt ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-yellow-400/20 bg-yellow-400/10">
                {!isGeneratedKey && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                    No account found with this key.
                  </p>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Create a new account with this key?
                </p>
                {pendingKey && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {formatKeyDisplay(pendingKey)}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEditKey}
                  disabled={isLoading}
                  className="flex-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-medium border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  No
                </button>
                <button
                  onClick={handleCreateAccount}
                  disabled={isLoading}
                  className="flex-1 bg-yellow-500 text-black dark:bg-white dark:text-black px-4 py-2 rounded-lg font-medium disabled:opacity-50 hover:bg-yellow-600 dark:hover:bg-gray-200"
                >
                  {isLoading ? 'Creating...' : 'Yes'}
                </button>
              </div>
            </div>
          ) : (
            /* Normal Login Form */
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              {/* Error Message (non-user-not-found errors) */}
              {error && errorCode !== 'USER_NOT_FOUND' && (
                <div className="mb-4 p-3 rounded-lg border bg-red-500/10 border-red-500/20">
                  <p className="text-sm text-red-500">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="key" className="block text-sm font-medium mb-2">
                  Enter your Key
                </label>
                <div className="relative">
                  <input
                    id="key"
                    type="text"
                    name="login-key"
                    value={keyInput}
                    onChange={(e) => {
                      setKeyInput(e.target.value);
                    }}
                    placeholder="Ex: Sky-Fill-Cycle"
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-500 [&::placeholder]:italic"
                    disabled={isLoading}
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHelpTooltip(!showHelpTooltip)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Help Tooltip */}
                  {showHelpTooltip && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg z-10 p-3">
                      <p className="font-medium mb-2">Key Format:</p>
                      <ul className="space-y-1 text-gray-300 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>Three words separated by hyphens</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>Each word must be at least 2 letters</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>Letters only (case-sensitive)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>Example: <code className="bg-gray-800 dark:bg-gray-800 px-1.5 py-0.5 rounded text-yellow-400">Sky-Fill-Cycle</code></span>
                        </li>
                      </ul>
                      {/* Arrow */}
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !keyInput}
                className="bg-yellow-500 text-black dark:bg-white dark:text-black px-4 py-2 rounded-lg font-medium w-full disabled:opacity-50 hover:bg-yellow-600 dark:hover:bg-gray-200"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    or
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateKey}
                disabled={isLoading}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                Generate Random Key
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

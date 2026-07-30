import { useState, useEffect } from 'react';
import { generateRandomKey } from '../lib/wordlist';
import { normalizeKey } from '../lib/cryptoUtils';

/**
 * Login Component
 *
 * This is the entry point for the application.
 * Users can either:
 * 1. Enter an existing three-word key to login
 * 2. Generate a random key for a new account
 * 3. Manually create their own key
 */
export function Login({ onLogin, onCreateAccount, isLoading, error, errorCode }) {
  const [keyInput, setKeyInput] = useState('');
  const [mode, setMode] = useState('existing'); // 'existing' or 'new'
  const [showCustom, setShowCustom] = useState(false);
  const [suggestedKey, setSuggestedKey] = useState('');
  const [wasLoading, setWasLoading] = useState(false);

  // Clear key input after successful login/account creation
  useEffect(() => {
    if (wasLoading && !isLoading) {
      // Operation completed - clear the key for security
      setKeyInput('');
    }
    setWasLoading(isLoading);
  }, [isLoading]);

  /**
   * Handle login form submission (existing users only)
   */
  const handleLogin = (e) => {
    e.preventDefault();
    if (keyInput.trim()) {
      // Normalize the key before sending to server
      onLogin(normalizeKey(keyInput.trim()));
    }
  };

  /**
   * Handle create account form submission (new users)
   */
  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (keyInput.trim()) {
      // Normalize the key before sending to server
      onCreateAccount(normalizeKey(keyInput.trim()));
    }
  };

  /**
   * Generate a random key for new account
   */
  const handleGenerateKey = () => {
    const randomKey = generateRandomKey();
    setKeyInput(randomKey);
    setSuggestedKey(randomKey);
    setShowCustom(true);
    setMode('new');
  };

  /**
   * Handle custom key creation
   */
  const handleCustomKey = () => {
    setShowCustom(true);
    setMode('new');
  };

  /**
   * Format key for display (with word-spacing)
   */
  const formatKeyDisplay = (key) => {
    return key.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' — ');
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
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode('existing');
                setShowCustom(false);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                mode === 'existing' && !showCustom
                  ? 'bg-yellow-500 text-black dark:bg-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              Existing Key
            </button>
            <button
              onClick={() => {
                setMode('new');
                setShowCustom(false);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                mode === 'new' && !showCustom
                  ? 'bg-yellow-500 text-black dark:bg-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              New Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg border ${
              errorCode === 'USER_NOT_FOUND'
                ? 'bg-yellow-400/10 border-yellow-400/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <p className={`text-sm ${
                errorCode === 'USER_NOT_FOUND'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-500'
              }`}>
                {error}
              </p>

              {/* Show "Create Account" option when user not found */}
              {errorCode === 'USER_NOT_FOUND' && keyInput && (
                <div className="mt-3 pt-3 border-t border-yellow-400/20">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Want to create a new account with this key?
                  </p>
                  <button
                    onClick={() => onCreateAccount(normalizeKey(keyInput))}
                    disabled={isLoading}
                    className="bg-yellow-500 text-black dark:bg-white dark:text-black px-4 py-2 rounded-lg font-medium w-full disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create New Account'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Existing Key Mode */}
          {mode === 'existing' && !showCustom ? (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div>
                <label htmlFor="key" className="block text-sm font-medium mb-2">
                  Enter your Key
                </label>
                <input
                  id="key"
                  type="text"
                  name="login-key"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Ex: sky-fill-cycle"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-500 [&::placeholder]:italic"
                  disabled={isLoading}
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !keyInput}
                className="bg-yellow-500 text-black dark:bg-white dark:text-black px-4 py-2 rounded-lg font-medium w-full disabled:opacity-50 hover:bg-yellow-600 dark:hover:bg-gray-200"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleCustomKey}
                  className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
                >
                  Create custom key instead
                </button>
              </div>
            </form>
          ) : mode === 'new' && !showCustom ? (
            <div className="space-y-4">
              <div className="text-center py-6">
                <button
                  onClick={handleGenerateKey}
                  disabled={isLoading}
                  className="bg-yellow-500 text-black dark:bg-white dark:text-black px-4 py-2 rounded-lg font-medium w-full disabled:opacity-50 hover:bg-yellow-600 dark:hover:bg-gray-200"
                >
                  {isLoading ? 'Creating...' : 'Generate Random Key'}
                </button>
              </div>

              <div className="relative my-6">
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
                onClick={handleCustomKey}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-medium w-full"
              >
                Create My Own Key
              </button>
            </div>
          ) : (
            /* Custom Key Mode */
            <form onSubmit={handleCreateAccount} className="space-y-4" autoComplete="off">
              <div>
                <label htmlFor="customKey" className="block text-sm font-medium mb-2">
                  Create Your Key
                </label>
                <input
                  id="customKey"
                  type="text"
                  name="custom-key"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="your-words-here"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={isLoading}
                  autoFocus
                  autoComplete="off"
                />
              </div>


              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustom(false);
                    setKeyInput('');
                  }}
                  className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-medium flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !keyInput}
                  className="bg-yellow-500 text-black dark:bg-white dark:text-black px-4 py-2 rounded-lg font-medium flex-1 disabled:opacity-50 hover:bg-yellow-600 dark:hover:bg-gray-200"
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

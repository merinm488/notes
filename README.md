# Notes Application

A modern, full-stack notes application with passwordless authentication using custom keys. Features a beautiful UI with dark/light themes, folder organization, search, and pinning functionality.

## ✨ Features

- 🔐 **Passwordless Authentication** - Secure login using custom keys
- 📝 **Rich Note Management** - Create, edit, delete, and archive notes
- 📁 **Folder Organization** - Organize notes into color-coded folders
- 🔍 **Full-Text Search** - Search across all your notes instantly
- 📌 **Pin Important Notes** - Keep key notes at the top
- 🌙 **Dark & Light Themes** - Beautiful, high-contrast themes
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- ⚡ **Fast & Lightweight** - Built with Vite for instant loading
- 🔒 **Secure PWA** - Service worker only caches static assets, never sensitive data

## 🏗️ Architecture

This is a **full-stack application** with:

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: TextDB.dev external API for data persistence
- **Dev Server**: Express for local development with JSON file storage
- **Production**: Vercel serverless functions with TextDB.dev integration

## 🏗️ Project Structure

```
Notes/
├── src/
│   ├── components/          # UI components
│   │   ├── Login.jsx        # Authentication screen
│   │   ├── NoteCard.jsx     # Individual note display
│   │   ├── NoteEditor.jsx   # Note editing modal
│   │   ├── NoteListView.jsx # List view of notes
│   │   ├── NoteActions.jsx  # Note action buttons
│   │   ├── FolderList.jsx   # Folder management
│   │   ├── SearchBar.jsx    # Search functionality
│   │   ├── ThemeToggle.jsx  # Dark/light theme switcher
│   │   ├── UserDisplay.jsx  # User info and logout
│   │   └── Tooltip.jsx      # Tooltip component
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication logic
│   │   ├── useNotes.js      # Notes and folders management
│   │   └── useTheme.js      # Theme management
│   ├── lib/                 # Core utilities
│   │   ├── cryptoUtils.js   # Hashing and key validation
│   │   ├── wordlist.js      # Word list for key generation
│   │   └── db.js            # Database API client
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── api/
│   └── notes.js              # Vercel serverless API
├── server/
│   └── dev-server.js        # Express dev server
├── db/
│   └── users/               # User data (JSON files)
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js          # Vite configuration
├── vercel.json              # Vercel deployment config
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🔐 How Authentication Works

### The Login Flow

1. **User enters key**: Key: `"yellow-lily-flies"`

2. **Key is normalized**: Converted to lowercase, hyphens normalized
   ```
   "Yellow Lily Flies" → "yellow-lily-flies"
   ```

3. **Key is hashed**: Using SHA-256 algorithm
   ```
   "yellow-lily-flies" → "a7f8c2e9b4d3f1a6c8e5b2d9f4a7c1e8..."
   ```

4. **Database lookup**: Search for the hash in TextDB.dev
   ```
   GET https://textdb.dev/api/data/a7f8c2e9b4d3f1a6c8e5b2d9f4a7c1e8
   → { notes: [...], folders: [...], settings: { name: "john" } }
   ```

5. **Result**:
   - Found → User logged in, data returned
   - Not found → Account not found (use account creation)

### Account Creation Flow

1. **User provides key**: Key required
2. **Server validates**: Key format
3. **Hash generated**: SHA-256 of normalized key
4. **Account created**: New user stored with key→hash mapping
5. **Response**: Success with hash for immediate login

### Key Security Features

✅ **Passwordless authentication** - Requires key

✅ **Original key never stored** - Only the hash exists in the database

✅ **Hash is one-way** - Cannot reverse the hash to get the original key

✅ **Data isolation** - Different keys produce completely different hashes

✅ **No sensitive PWA caching** - Service worker only caches static assets

## 📊 Data Structure

Each user's data is stored as a JSON file:

```javascript
// db/users/{hash}.json
{
  folders: [
    {
      id: "f1",
      name: "All Notes",
      color: "#FACC15",
      isDefault: true
    },
    {
      id: "f2",
      name: "Work",
      color: "#3B82F6",
      isDefault: false
    }
  ],
  notes: [
    {
      id: "n1",
      title: "My First Note",
      content: "This is my note content...",
      folderId: "f1",
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z",
      pinned: false,
      archived: false
    }
  ],
  settings: {
    theme: "dark",
    createdAt: "2024-01-15T10:00:00.000Z"
  }
}
```

## 🎨 Themes

The application supports two beautiful themes:

### Dark Theme
- Pure black background with white text
- High contrast, minimalist design
- Easy on the eyes in low light

### Light Theme
- Clean white background with yellow accents
- Warm, inviting aesthetic
- Great for daytime use


### Backend Storage Options

**Current (Production):** TextDB.dev
- ✅ Data persists across serverless invocations
- ✅ Simple REST API integration
- ✅ Free for basic usage

<<<<<<< HEAD

=======
>>>>>>> 847651e (refactor: remove name field from authentication)
**For High-Scale Production:** Consider upgrading to:
- **Vercel Postgres** - Managed PostgreSQL
- **Supabase** - Full-featured backend with auth
- **MongoDB Atlas** - NoSQL document database

## 🛠️ Built With

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Express** - Development API server
- **Web Crypto API** - Cryptographic hashing
- **TextDB.dev** - External data storage (production)
- **VitePWA** - Progressive Web App with secure asset caching

## 📄 License

MIT License - feel free to use this for learning and building.

---

<<<<<<< HEAD
**Note:** This application uses TextDB.dev for production data persistence. All notes are stored securely with SHA-256 hashed keys.
=======
**Note:** This application uses TextDB.dev for production data persistence. All notes are stored securely with SHA-256 hashed keys.
>>>>>>> 847651e (refactor: remove name field from authentication)

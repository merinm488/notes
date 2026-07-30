# Secure Notes Application

A modern, full-stack notes application with passwordless authentication using three-word keys. Features a beautiful UI with dark/light themes, folder organization, search, and pinning functionality.

## ✨ Features

- 🔐 **Passwordless Authentication** - Secure login using three-word keys
- 📝 **Rich Note Management** - Create, edit, delete, and archive notes
- 📁 **Folder Organization** - Organize notes into color-coded folders
- 🔍 **Full-Text Search** - Search across all your notes instantly
- 📌 **Pin Important Notes** - Keep key notes at the top
- 🌙 **Dark & Light Themes** - Beautiful, high-contrast themes
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- ⚡ **Fast & Lightweight** - Built with Vite for instant loading

## 🏗️ Architecture

This is a **full-stack application** with:

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: TextDB (JSON file storage via REST API)
- **Dev Server**: Express for local development
- **Production**: Vercel serverless functions

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd Notes
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3002`

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
│   └── notes/
│       └── route.js         # Vercel serverless API
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

1. **User enters key**: `"yellow-lily-flies"`

2. **Key is normalized**: Converted to lowercase, hyphens normalized
   ```
   "Yellow Lily Flies" → "yellow-lily-flies"
   ```

3. **Key is hashed**: Using SHA-256 algorithm
   ```
   "yellow-lily-flies" → "a7f8c2e9b4d3f1a6c8e5b2d9f4a7c1e8..."
   ```

4. **Database lookup**: Search for the hash in database
   ```
   db/users/a7f8c2e9b4d3f1a6c8e5b2d9f4a7c1e8.json → { notes: [...], folders: [...] }
   ```

5. **Result**:
   - Found → User logged in, data returned
   - Not found → New account created

### Key Security Features

✅ **Original key never stored** - Only the hash exists in the database

✅ **Hash is one-way** - Cannot reverse the hash to get the original key

✅ **Same key = same hash** - Consistent identification

✅ **Data isolation** - Different keys produce completely different hashes

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

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

This starts both the Express API server (port 3003) and Vite dev server (port 3002).

### Deploy to Vercel

**⚠️ Important Note:** The current backend uses TextDB (JSON file storage), which **will not persist data on Vercel** due to serverless function limitations.

For production use, you need to migrate to a proper database:
- **Vercel Postgres** - Managed PostgreSQL
- **Supabase** - Firebase alternative
- **MongoDB Atlas** - NoSQL document database

To deploy anyway (for testing):

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy with default settings

The app will work, but notes will not persist after each serverless function execution.

### Migrating to a Real Database

To make notes persist, update `api/notes/route.js` to use a real database instead of JSON file storage.

## 🛠️ Built With

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Express** - Development API server
- **Web Crypto API** - Cryptographic hashing
- **TextDB** - JSON file storage (local dev only)

## 📄 License

MIT License - feel free to use this for learning and building.

---

**Note:** This is a demonstration project. The current backend implementation (TextDB) is suitable for local development only. For production use, migrate to a proper database service.

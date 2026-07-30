# Secure Notes Application

A secure notes application with passwordless authentication using three-word keys. This project demonstrates fundamental backend concepts including cryptographic hashing, data isolation, and CRUD operations.

## 🎯 What This Project Teaches

This application is designed to help you understand **how backend systems work** through practical implementation:

### 1. Passwordless Authentication
- **Traditional Auth**: Username + password stored in database
- **Our Approach**: Three-word key → hashed → database lookup
- **Benefit**: No passwords to store, no password reset flows

### 2. Cryptographic Hashing
- **What**: Converting data into a fixed-size string of characters
- **Why**: Never store the original key, only its hash
- **How**: SHA-256 algorithm via Web Crypto API
- **Example**: `"yellow-lily-flies"` → `"a7f8c2e9b4d3f1a6c8e5b2d9f4a7c1e8b3d6f9a2c5e8b1d4f7a9c2e5b8d1f4a7"`

### 3. Data Isolation
- Each user's data is completely separate
- Hash is the only connection between user and data
- Users cannot access each other's notes without knowing the exact key

### 4. CRUD Operations
- **Create**: Add new notes to database
- **Read**: Retrieve notes for display
- **Update**: Modify existing notes
- **Delete**: Remove notes from database

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager


## 🏗️ Project Structure

```
Notes/
├── src/
│   ├── components/          # UI components
│   │   ├── Login.jsx        # Authentication screen
│   │   ├── NoteCard.jsx     # Individual note display
│   │   ├── NoteEditor.jsx   # Note editing modal
│   │   ├── FolderList.jsx   # Folder management
│   │   ├── SearchBar.jsx    # Search functionality
│   │   ├── ThemeToggle.jsx  # Dark/light theme switcher
│   │   └── UserDisplay.jsx  # User info and logout
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication logic
│   │   ├── useNotes.js      # Notes and folders management
│   │   └── useTheme.js      # Theme management
│   ├── lib/                 # Core utilities (backend logic)
│   │   ├── cryptoUtils.js   # Hashing and key validation
│   │   ├── wordlist.js      # Word list for key generation
│   │   └── db.js            # Database operations (CRUD)
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js          # Vite configuration
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

4. **Database lookup**: Search for the hash in our database
   ```
   db["a7f8c2e9b4d3f1a6c8e5b2d9f4a7c1e8..."] → { notes: [...], folders: [...] }
   ```

5. **Result**:
   - Found → User logged in, data returned
   - Not found → New account created

### Key Security Features

✅ **Original key never stored** - Only the hash exists in the database

✅ **Hash is one-way** - Cannot reverse the hash to get the original key

✅ **Same key = same hash** - Consistent identification

✅ **Data isolation** - Different keys produce completely different hashes


## 🎨 Themes

The application supports two beautiful themes:

### Dark Theme 
- Pure black background (#0A0A0A)
- White text and accents
- High contrast, minimalist
- Easy on the eyes in low light

### Light Theme
- Off-white background (#FAFAFA)
- Yellow accents (#FACC15)
- Warm, clean aesthetic
- Great for daytime use

## 🔧 Backend Concepts Explained

### What is a Hash Function?

A hash function is a mathematical algorithm that:
- Takes input of any size (your three-word key)
- Produces output of fixed size (64 characters for SHA-256)
- Is deterministic (same input always produces same output)
- Is one-way (cannot reverse the hash to get input)

**Real-world analogy**: Think of it like a fingerprint - unique to each person, but you can't recreate the person from just their fingerprint.

### What is CRUD?

CRUD stands for the four basic operations of persistent storage:

1. **Create**: Add new data
   - `db.createNote(hash, noteData)`

2. **Read**: Retrieve data
   - `db.getNotes(hash)`

3. **Update**: Modify existing data
   - `db.updateNote(hash, noteId, updates)`

4. **Delete**: Remove data
   - `db.deleteNote(hash, noteId)`

### What is Data Isolation?

Data isolation means each user's data is completely separate:

```
User A enters: "yellow-lily-flies"
→ Hash: "a7f8c2e9..."
→ Accesses only User A's notes

User B enters: "blue-panther-life"
→ Hash: "b3f9d1a7..."
→ Accesses only User B's notes

The hashes are different, so the data is completely isolated!
```


## 📝 Features

- ✅ Passwordless authentication with three-word keys
- ✅ Secure key hashing (SHA-256)
- ✅ Create, edit, delete notes
- ✅ Folder organization
- ✅ Search across all notes
- ✅ Pin important notes
- ✅ Dark and Light themes
- ✅ Responsive design
- ✅ Keyboard shortcuts (Ctrl/Cmd+S to save)

## 🛠️ Built With

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Web Crypto API** - Cryptographic hashing
- **localStorage** - Data persistence

## 📚 Learning Path

If you're learning backend development, this project demonstrates:

1. ✅ Authentication without passwords
2. ✅ Cryptographic hashing
3. ✅ Data storage and retrieval
4. ✅ Data isolation between users
5. ✅ CRUD operations
6. ✅ Session management

## 🤝 Contributing

This is a learning project. Feel free to fork it and experiment!

## 📄 License

MIT License - feel free to use this for learning and building.

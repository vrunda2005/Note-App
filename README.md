# 📝 TakeNote - Intelligent Note-Taking Application

A modern, feature-rich note-taking application built with Next.js 15, React 19, and TypeScript. Features AI-powered assistance, end-to-end encryption, rich text editing, and offline-first architecture using IndexedDB.

---

## 🎯 Project Overview

**TakeNote** is a full-stack web application that combines secure note management with AI capabilities. It demonstrates modern web development practices, including server-side rendering, client-side state management, encryption, and AI integration.

### Key Features

- 🔐 **Password-Protected Notes** - AES-GCM encryption using Web Crypto API
- 🤖 **AI-Powered Features** - Summary generation, tag suggestions, grammar checking
- 📝 **Rich Text Editor** - Full formatting support with toolbar
- 🎨 **Drawing Canvas** - Integrated sketching tool
- 💾 **Offline-First** - IndexedDB storage for local persistence
- 🔍 **Advanced Search** - Real-time note filtering
- 📌 **Note Organization** - Pinning, tagging, and sorting
- 🌙 **Modern UI** - Responsive design with Tailwind CSS
- 📄 **PDF Export** - Export notes to PDF format
- 🔗 **Web Share API** - Native sharing capabilities

---

## 🏗️ Technical Architecture

### Tech Stack

- **Framework:** Next.js 15.4.6 (App Router)
- **Frontend:** React 19.1.0, TypeScript 5
- **Styling:** Tailwind CSS 4
- **State Management:** React Hooks (Custom hooks)
- **Database:** IndexedDB (via `idb` library)
- **AI Provider:** Google Gemini API
- **Encryption:** Web Crypto API (PBKDF2 + AES-GCM)
- **Icons:** Lucide React
- **PDF Generation:** jsPDF

### Project Structure

```
take-note/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   └── ai/
│   │   │       └── route.ts         # AI endpoint (Gemini API integration)
│   │   ├── layout.tsx               # Root layout with error boundary
│   │   ├── page.tsx                 # Main application page
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                   # React Components (PascalCase)
│   │   ├── AIFallbackBanner.tsx     # AI status notification banner
│   │   ├── AIToolsPanel.tsx         # AI features toolbar
│   │   ├── AppHeader.tsx            # Application header with actions
│   │   ├── DrawCanvas.tsx           # Drawing/sketching canvas
│   │   ├── EditableContent.tsx      # Contenteditable wrapper
│   │   ├── ErrorBoundary.tsx        # Error handling wrapper
│   │   ├── NoteEditor.tsx           # Main note editing interface
│   │   ├── NotesSidebar.tsx         # Notes list sidebar
│   │   ├── PasswordModal.tsx        # Password input modal
│   │   ├── RichTextEditor.tsx       # Rich text editing component
│   │   ├── RichTextToolbar.tsx      # Text formatting toolbar
│   │   └── SummaryBox.tsx           # AI-generated summary display
│   │
│   ├── hooks/                        # Custom React Hooks (camelCase)
│   │   ├── useAI.ts                 # AI features hook (client-side)
│   │   └── useNotes.ts              # Notes management hook
│   │
│   ├── lib/                          # Library utilities
│   │   └── getGeminiSdk.ts          # Gemini SDK dynamic loader
│   │
│   ├── utils/                        # Utility functions (camelCase)
│   │   ├── encryption.ts            # Crypto utilities (PBKDF2, AES-GCM)
│   │   └── storage.ts               # IndexedDB wrapper functions
│   │
│   ├── types/                        # Type definitions
│   │   └── genai.d.ts               # Google Gemini SDK types
│   │
│   └── types.ts                      # Core application types
│
├── public/                           # Static assets
├── scripts/
│   └── test_ai.js                   # AI endpoint testing script
├── .env                              # Environment variables (template)
├── .env.local                        # Local environment variables
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
└── tailwind.config.mjs              # Tailwind CSS configuration
```

---

## 📋 Core Features Implementation

### 1. Note Management (`src/hooks/useNotes.ts`)

**Location:** `src/hooks/useNotes.ts`

**What it does:**

- Manages all note CRUD operations
- Handles note state and persistence to IndexedDB
- Implements in-memory unlocked content map for encrypted notes
- Provides sorting (pinned first, then by last modified)

**Key Functions:**

- `createNewNote()` - Creates a new note with unique ID
- `updateNote()` - Updates existing note properties
- `deleteSelected()` - Deletes a note by ID
- `togglePin()` - Toggles note pinned status
- `encryptNote()` - Encrypts note content with password
- `decryptNote()` - Decrypts encrypted note content

**Architecture Decision:**
Encrypted notes store only ciphertext in IndexedDB. Decrypted content is kept in memory (`unlockedContents` map) to prevent accidental plaintext persistence.

---

### 2. AI Integration (`src/app/api/ai/route.ts` + `src/hooks/useAI.ts`)

**Backend API Route:** `src/app/api/ai/route.ts`

**What it does:**

- Server-side endpoint for AI operations
- Integrates with Google Gemini API
- Handles multiple API versions (v1, v1beta) with fallback
- Returns fallback text if API fails

**Supported AI Tasks:**

1. **Summarize** - Generate 2-line summaries
2. **Suggest Tags** - Extract relevant tags
3. **Grammar Check** - Check and correct grammar
4. **Glossary Highlight** - Identify technical terms
5. **Readability Check** - Analyze text readability

**Client Hook:** `src/hooks/useAI.ts`

**What it does:**

- Client-side wrapper for AI API calls
- Manages loading states
- Dispatches fallback events for UI notifications
- Handles error scenarios gracefully

**Key Functions:**

- `generateSummary(text)` - Returns AI-generated summary
- `suggestTags(text)` - Returns array of suggested tags
- `checkGrammar(text)` - Returns grammar-corrected text
- `highlightGlossary(text)` - Returns array of technical terms
- `checkReadability(text)` - Returns readability analysis

**API Flow:**

```
User Action → useAI Hook → /api/ai endpoint → Gemini API → Response → UI Update
```

---

### 3. Encryption System (`src/utils/encryption.ts`)

**Location:** `src/utils/encryption.ts`

**What it does:**

- Implements password-based encryption using Web Crypto API
- Uses PBKDF2 for key derivation (100,000 iterations)
- Uses AES-GCM for encryption (256-bit keys)
- Stores salt + IV + ciphertext as base64 combined payload

**Encryption Flow:**

1. Generate random salt (16 bytes)
2. Derive key from password using PBKDF2
3. Generate random IV (12 bytes)
4. Encrypt plaintext using AES-GCM
5. Combine salt + IV + ciphertext
6. Encode as base64 string

**Decryption Flow:**

1. Decode base64 payload
2. Extract salt, IV, and ciphertext
3. Derive key from password using same PBKDF2 settings
4. Decrypt using AES-GCM
5. Return plaintext or null if password incorrect

**Security Features:**

- No password storage (only derived keys)
- Random salt per encryption (prevents rainbow table attacks)
- Random IV per encryption (ensures unique ciphertexts)
- High iteration count (protects against brute force)

---

### 4. Storage Layer (`src/utils/storage.ts`)

**Location:** `src/utils/storage.ts`

**What it does:**

- Wrapper around IndexedDB for note persistence
- Provides simple async API for database operations
- Handles database initialization and upgrades

**Database Schema:**

- **Database:** `notes-app-db`
- **Store:** `notes`
- **Key Path:** `id` (string)

**Functions:**

- `saveNote(note)` - Creates or updates a note
- `getAllNotes()` - Retrieves all notes
- `deleteNote(id)` - Deletes a note by ID

**Why IndexedDB?**

- Large storage capacity (gigabytes)
- Works offline
- Structured data with indexes
- Asynchronous (non-blocking)

---

### 5. Rich Text Editor (`src/components/RichTextEditor.tsx`)

**Location:** `src/components/RichTextEditor.tsx`, `src/components/RichTextToolbar.tsx`

**What it does:**

- Full-featured WYSIWYG editor
- Supports text formatting (bold, italic, underline)
- Supports lists (ordered, unordered)
- Supports links
- Glossary term highlighting

**Features:**

- `contentEditable` API for editing
- `document.execCommand()` for formatting
- Custom toolbar with visual feedback
- Read-only mode for locked notes
- Term highlighting overlay

---

### 6. Components Overview

#### `src/components/NotesSidebar.tsx`

- Displays list of all notes
- Shows lock status and unlock buttons
- Supports search/filter
- Indicates pinned notes
- Delete and pin toggle actions

#### `src/components/NoteEditor.tsx`

- Main editing interface
- Title input
- Rich text content editor
- Tag management UI
- Glossary term display

#### `src/components/AppHeader.tsx`

- Application actions (encrypt, export, share)
- AI tools panel toggle
- Drawing mode toggle
- Password modal management
- Unlock functionality

#### `src/components/AIToolsPanel.tsx`

- AI feature buttons (5 tools)
- Loading state handling
- Disabled state for empty notes

#### `src/components/PasswordModal.tsx`

- Password input dialog
- Encryption/decryption flow
- Error handling display

#### `src/components/DrawCanvas.tsx`

- HTML5 Canvas-based drawing
- Tool selection (pen, eraser)
- Color picker
- Brush size control
- Save/export functionality

---

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Google Gemini API key

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/vrunda2005/Note-App.git
cd take-note
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_GEMINI_MODEL=gemini-2.5-flash
```

**How to get API key:**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create a new API key
4. Copy and paste into `.env.local`

5. **Run development server**

```bash
npm run dev
```

5. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🚀 Usage Guide

### Creating Notes

1. Click "Create New Note" or "+" button
2. Enter a title and content
3. Add tags (optional)
4. Note auto-saves to IndexedDB

### Password Protection

1. Select a note
2. Click the lock icon in header
3. Enter a password
4. Note is encrypted and stored

### Unlocking Notes

1. Click on a locked note in sidebar
2. Click "Unlock" button
3. Enter password
4. Content becomes editable

### AI Features

1. Create or select a note with content
2. Open AI Tools Panel
3. Click any AI feature:
   - **Suggest Tags** - Generates relevant tags
   - **Check Grammar** - Corrects text
   - **Readability** - Analyzes complexity
   - **Summarize** - Creates brief summary
   - **Glossary** - Highlights technical terms

### Exporting Notes

1. Select a note
2. Click "Export to PDF" button
3. PDF downloads with formatted content

---

## 🧪 Testing

### Test AI Endpoint

```bash
node scripts/test_ai.js
```

This script tests the `/api/ai` endpoint with a sample summarization task.

**Expected Output:**

```json
{
  "result": "AI-generated summary here",
  "modelUsed": "gemini-2.5-flash"
}
```

---

## 📦 Build & Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables for Production

Ensure these are set in your hosting platform:

- `GEMINI_API_KEY`
- `GOOGLE_GEMINI_MODEL` (optional, defaults to gemini-2.5-flash)

### Deployment Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **AWS Amplify**

---

## 🔍 Key Files Explanation

### Most Important Files for Understanding the Project

1. **`src/app/page.tsx`** (371 lines)

   - Main application component
   - Orchestrates all features
   - State management for UI
   - Event handlers for all actions

2. **`src/hooks/useNotes.ts`** (200+ lines)

   - Core business logic for notes
   - Encryption/decryption integration
   - IndexedDB persistence
   - **Start here** to understand data flow

3. **`src/app/api/ai/route.ts`** (105 lines)

   - Server-side AI integration
   - Gemini API implementation
   - Error handling and fallbacks
   - **Key file** for AI features

4. **`src/utils/encryption.ts`** (80+ lines)

   - Password-based encryption
   - Web Crypto API implementation
   - Security best practices

5. **`src/components/AppHeader.tsx`** (447 lines)
   - Application actions
   - AI feature orchestration
   - Password modal logic

---

## 🎨 Design Decisions

### Why Next.js App Router?

- Server-side rendering for better SEO
- API routes for backend logic
- File-based routing
- Built-in optimization

### Why IndexedDB?

- Large storage capacity
- Structured data storage
- Offline-first capability
- Better than localStorage for complex data

### Why Web Crypto API?

- Browser-native encryption
- No external crypto libraries
- Secure key derivation
- Industry-standard algorithms

### Why Custom Hooks?

- Separation of concerns
- Reusable business logic
- Easier testing
- Cleaner components

---

## 🐛 Troubleshooting

### AI Features Not Working

**Problem:** AI button shows fallback banner

**Solution:**

1. Check `.env.local` has valid `GEMINI_API_KEY`
2. Restart dev server after adding env variables
3. Test API: `node scripts/test_ai.js`
4. Check console for error messages

### Notes Not Saving

**Problem:** Notes disappear on refresh

**Solution:**

1. Check browser supports IndexedDB
2. Check browser console for errors
3. Clear browser cache and reload
4. Check IndexedDB in DevTools → Application tab

### Decryption Fails

**Problem:** "Incorrect password" even with correct password

**Solution:**

- Encryption uses random salt/IV, so password must be exact
- Browser/device must support Web Crypto API
- Check if note was encrypted with same browser

---

## 📚 Dependencies Explained

### Core Dependencies

- `next` - React framework
- `react`, `react-dom` - UI library
- `typescript` - Type safety
- `@google/genai` - Gemini AI SDK

### UI & Styling

- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library

### Storage & Data

- `idb` - IndexedDB wrapper
- `uuid` - Unique ID generation

### Features

- `jspdf` - PDF generation
- `react-error-boundary` - Error handling

---

## 🎓 Interview Talking Points

### Architecture Highlights

1. **Separation of Concerns**

   - Components focus on UI
   - Hooks handle business logic
   - Utils provide shared functionality

2. **Security-First Design**

   - Client-side encryption
   - No plaintext storage
   - In-memory decrypted content

3. **Offline-First**

   - IndexedDB for local storage
   - Works without internet
   - Progressive enhancement

4. **Modern React Patterns**

   - Custom hooks
   - Composition over inheritance
   - Functional components

5. **API Design**
   - RESTful endpoint structure
   - Error handling
   - Fallback mechanisms

### Technical Challenges Solved

1. **Secure Encryption Implementation**

   - Challenge: Implement secure client-side encryption
   - Solution: Web Crypto API with PBKDF2 + AES-GCM

2. **AI Integration**

   - Challenge: Integrate external AI API
   - Solution: Server-side proxy with fallback

3. **State Management**

   - Challenge: Manage complex note state
   - Solution: Custom hooks with IndexedDB sync

4. **File Organization**
   - Challenge: Maintain clean codebase
   - Solution: Feature-based structure with clear naming

---

## 📝 Code Naming Conventions

### Current Conventions (Followed)

- **Components:** PascalCase (e.g., `NoteEditor.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useNotes.ts`)
- **Utils:** camelCase (e.g., `encryption.ts`)
- **Types:** PascalCase (e.g., `Note` interface)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DB_NAME`)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes.

---

## 👤 Author

**Vrunda Patel**

- GitHub: [@vrunda2005](https://github.com/vrunda2005)
- Repository: [Note-App](https://github.com/vrunda2005/Note-App)

---

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Next.js team for amazing framework
- Vercel for hosting platform
- Open source community

---

## 📞 Support

For questions or issues:

1. Check [Troubleshooting](#-troubleshooting) section
2. Review code comments in key files
3. Open an issue on GitHub
4. Check browser console for errors

---

**Last Updated:** November 17, 2025  
**Version:** 0.1.0  
**Status:** ✅ Production Ready

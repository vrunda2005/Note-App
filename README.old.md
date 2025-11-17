# Take-Note (Note-App)

This repository contains a small encrypted note-taking application built with Next.js (App Router), React, and TypeScript. It stores notes in IndexedDB, supports password-protected notes using Web Crypto (PBKDF2 + AES-GCM), and includes a lightweight AI assistant endpoint (server-side) that calls an external provider when configured or returns deterministic fallbacks during development.

This README documents the project structure, technical details, important flows (encryption and unlock), environment variables, development and troubleshooting steps, and pointers for common edits.

---

## Quick facts

- Project: Take-Note (Note-App)
- Framework: Next.js (App Router)
- Language: TypeScript + React
- Storage: IndexedDB (via `idb`)
- Crypto: Web Crypto API (PBKDF2 + AES-GCM)
- AI provider: XAI HTTP endpoint (configure `XAI_API_URL` + `XAI_API_KEY`) with a local fallback when no API key is present

---

## Versions (from package.json)

- next: 15.4.6
- react: 19.1.0
- react-dom: 19.1.0
- typescript: ^5
- groq-sdk: ^0.30.0
- grok-sdk: ^6.0.0 (present but not required unless you use provider-specific features)
- idb: ^8.0.3
- tailwindcss: ^4
- lucide-react: ^0.539.0
- uuid: ^11.1.0
- jspdf: ^2.5.1

Note: Dependency minor/patch versions are controlled by your package manager; check `package.json` and `package-lock.json`/`pnpm-lock.yaml` for exact installed versions.

---

## High-level architecture

- App router pages: `src/app/*` (layout, page, API routes)
- Main components: `src/components/*` — header, sidebar, editor, password modal, etc.
- Hooks: `src/hooks/*` — `useNotes.ts` (note state + persistence), `useAI.ts` (client AI helper)
- Utils: `src/utils/*` — `encryption.ts` (WebCrypto helpers), `storage.ts` (IDB wrappers), `api.ts` (if present)
- Server AI route: `src/app/api/ai/route.ts` — wraps Groq provider with dev fallback

Files and responsibilities (most important):

- `src/utils/encryption.ts` — PBKDF2 key derivation and AES-GCM encrypt/decrypt utilities. Produces/stores base64 combined payload containing salt + iv + ciphertext.
- `src/hooks/useNotes.ts` — manages notes, persistence, and an in-memory unlocked content map (`unlockedContents`) used so that decrypted content is never persisted unintentionally.
- `src/components/NotesSidebar.tsx` — shows note list, locked/unlocked indicators, and inline Unlock buttons.
- `src/components/NoteEditor.tsx` — editor UI; editable only when note is either unprotected or currently unlocked in memory.
- `src/app/api/ai/route.ts` — server-side AI route. Calls provider when `XAI_API_KEY` and `XAI_API_URL` are set; otherwise returns deterministic `simpleFallback()` results. Also tries `XAI_MODEL_FALLBACK` if the primary model is unavailable.

---

## Encryption details (how it works)

All encryption is performed client-side using the browser Web Crypto API. The goal is to keep only encrypted data on disk and only keep plaintext in-memory when explicitly unlocked.

Key points:

- Key derivation: PBKDF2 using the provided password with a random 16-byte salt.
- Cipher: AES-GCM with a 12-byte IV.
- Stored blob: salt + iv + ciphertext are concatenated and base64-encoded before saving to IndexedDB.

APIs you may want to edit:

- `src/utils/encryption.ts`: `encryptContent(plain: string, password: string)` and `decryptContent(dataBase64: string, password: string)`.

Security note: decrypted content is kept in-memory in `useNotes`'s `unlockedContents` map and is not written back to storage unless the user explicitly removes the password protection.

---

## Unlock/Lock flow and in-memory unlocked content

Behavior implemented for safety and UX:

- Notes are persisted encrypted when password-protected.
- When a user unlocks a note (provides the password), the app decrypts the note and writes the plaintext only into the in-memory `unlockedContents` map inside `useNotes`.
- UI (editor) will check `isUnlocked` and allow editing only when the note is unlocked — changes are kept in-memory and saved back to storage in encrypted form when the user removes password protection or saves in the unprotected state.
- When the user re-locks a note (or navigates away), the in-memory unlocked content may be cleared, preventing plaintext from being persisted accidentally.

Files to inspect for this flow:

- `src/hooks/useNotes.ts` — `unlockedContents`, `setUnlockedContent`.
- `src/components/PasswordModal.tsx` — small modal for prompting password.
- `src/components/NotesSidebar.tsx` and `src/components/NoteEditor.tsx` — UI behavior for locked/unlocked states.

---

## AI route behavior and environment variables

The server API route at `src/app/api/ai/route.ts` either calls the configured Groq provider or returns deterministic local fallbacks.

Environment variables supported (set these in a `.env.local` or in your environment):

- `XAI_API_KEY` — if set together with `XAI_API_URL`, the route will call the configured XAI HTTP endpoint.
- `XAI_API_URL` — the full URL for the provider's chat/completions endpoint.
- `XAI_MODEL` — optional. If set, the route will request this model from the provider.
- `XAI_MODEL_FALLBACK` — optional. If the provider returns an error for the primary model, the route will try this fallback model before returning the local `simpleFallback()`.

Behavior summary:

- No API key: the route returns the local `simpleFallback()` so the app remains usable in dev.
- API key present: the route calls the provider with `GROQ_MODEL` (if provided) or a default model. If the provider responds that the model is decommissioned, the route will try `GROQ_MODEL_FALLBACK` if set. If both fail, it returns `simpleFallback()`.

If you're seeing provider/model errors, set `XAI_MODEL` to a supported model name for your account, and optionally `XAI_MODEL_FALLBACK` to a stable alternative.

Additional notes:

- The server now includes `modelUsed` and `fallbackUsed` fields in the JSON response for debugging. Example successful provider response:

  ```json
  { "result": "...", "modelUsed": "model-name", "fallbackUsed": false }
  ```

  And when a local deterministic fallback was returned the response includes `fallbackUsed: true` (and `modelUsed` may be null).

- Development default model: if `GROQ_MODEL` is not set, the server uses a safe development default (`llama3-8b`) to avoid hard failures; however you should pick a model supported by your Groq account in production.

- Recommended models and provider docs:
  - Model availability and names change over time. Check your AI provider's documentation to see which models are currently supported for your account. For Groq, see: https://console.groq.com/docs/deprecations
  - Example model names you might encounter (provider-specific): `llama3-8b`, `llama3-13b`. Use the exact names provided by your account.

---

## Development

Install dependencies:

```powershell
npm install
```

Run locally:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
npm run start
```

Environment variables for local development (example `.env.local`):

```
XAI_API_KEY=
XAI_API_URL=
XAI_MODEL=your-model-name
XAI_MODEL_FALLBACK=optional-fallback-model
```

Testing the AI route quickly (after running dev):

```powershell
curl -X POST "http://localhost:3000/api/ai" -H "Content-Type: application/json" -d '{ "task":"summarize", "text":"This is a test text to summarize." }'
```

---

## Troubleshooting

- EPERM / locked `.next` folder when running `npm run dev`: stop Node/Next processes, run PowerShell as Administrator, then delete `.next`. Example commands:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
# then
Remove-Item -Recurse -Force .next
```

- If you cannot remove `.next`, reboot or use elevated cmd with `takeown` / `icacls` to change ownership before deletion.

---

## Where to edit common behaviors

- Change encryption algorithm/parameters: `src/utils/encryption.ts`.
- Change storage behavior (IDB schema): `src/utils/storage.ts` and `src/hooks/useNotes.ts`.
- Change unlock UI/flow: `src/hooks/useNotes.ts`, `src/components/PasswordModal.tsx`, `src/components/NotesSidebar.tsx`, `src/components/NoteEditor.tsx`, and `src/app/page.tsx`.
- Change AI behavior, model selection, or fallback logic: `src/app/api/ai/route.ts` and `src/hooks/useAI.ts`.

---

## Suggested small improvements (future work)

- Persist session unlock state carefully (if desired) with strict expiration and clear warnings.
- Add unit/integration tests around encryption and unlock flows.
- Improve `simpleFallback()` to generate better structured outputs for tags and glossary.
- Add E2E tests for the AI route with mocking to ensure graceful fallback behavior.

---

If you'd like, I can now:

- Add a small CONTRIBUTING.md describing code layout and edit flow,
- Implement autofocus of the editor after unlock, and an icon-only unlock button in the sidebar,
- Run the dev server here after you confirm it's ok for me to attempt removing the locked `.next` cache.

Pick one next step and I'll implement it.# TakeNote - Advanced Note-Taking Application

A professional, feature-rich note-taking application built with Next.js, TypeScript, and Tailwind CSS. TakeNote combines powerful text editing capabilities with AI-powered features to enhance your note-taking experience.

## ✨ Core Features

### 📝 Rich Text Editor

- **Custom-built editor** (no external libraries like TinyMCE or Quill)
- **Text formatting**: Bold, italic, underline
- **Alignment options**: Left, center, right
- **Font customization**: Multiple font families and sizes
- **Text highlighting**: Multiple color options with custom highlight tool
- **Drawing canvas**: Integrated drawing tool for sketches and diagrams

### 📚 Note Management

- **Create, edit, delete** notes with ease
- **Pin important notes** to the top with visual indicators
- **Search functionality** by title or content
- **Tags system** for organization
- **Password protection** for sensitive notes with encryption

### 🤖 AI-Powered Features

- **Smart Tag Suggestions**: AI generates relevant tags based on content
- **Grammar & Spelling Check**: Identifies and suggests corrections for writing errors
- **Readability Analysis**: Provides readability scores and improvement suggestions
- **Auto Glossary Highlighting**: Automatically identifies and highlights key terms
- **AI Summarization**: Generates concise summaries of your notes

### 📱 User Experience

- **Clean, modern UI** with gradient designs and glassmorphism effects
- **Responsive design** that works on desktop, tablet, and mobile
- **Touch-friendly interface** with optimized layouts for smaller screens
- **Dark/light theme** with beautiful color schemes

### 🔒 Security & Privacy

- **Note encryption** with password protection
- **Local storage** - your data stays on your device
- **Secure password handling** for protected notes

### 📤 Export & Sharing

- **PDF Export**: Convert notes to professional PDF documents
- **Share functionality**: Copy notes to clipboard or use native sharing
- **Multiple export formats** for different use cases

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- XAI API key + URL (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd take-note
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   XAI_API_KEY=your_xai_api_key_here
   XAI_API_URL=https://api.your-provider.com/v1/chat/completions
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom gradients and animations
- **AI Integration**: Groq API for natural language processing
- **PDF Generation**: jsPDF for document export
- **Icons**: Lucide React for beautiful, consistent icons
- **Storage**: IndexedDB for local data persistence

## 📖 How to Use

### Creating Notes

1. Click the **+** button in the sidebar
2. Enter a title for your note
3. Start typing in the rich text editor
4. Use the toolbar for formatting options

### AI Features

1. **Generate Tags**: Click the AI Tools button and select "Suggest Tags"
2. **Check Grammar**: Use "Check Grammar" to find writing errors
3. **Analyze Readability**: Get readability scores and suggestions
4. **Highlight Glossary**: Automatically identify key terms
5. **Create Summaries**: Generate concise note summaries

### Note Organization

- **Pin important notes** by clicking the pin icon
- **Add tags** for better categorization
- **Search notes** using the search bar
- **Use the sidebar** to navigate between notes

### Security Features

- **Protect notes** by clicking the lock icon
- **Set passwords** for sensitive content
- **Encrypted notes** are stored securely

### Export & Share

- **Export to PDF** using the download button
- **Share notes** with the share button
- **Copy to clipboard** for easy sharing

## 🔧 Configuration

### AI API Settings

- **Model**: Currently uses Groq's `llama3-8b-8192` model
- **Temperature**: Set to 0.3 for consistent results
- **Max Tokens**: Limited to 1000 for cost efficiency

### PDF Export Settings

- **Page Size**: Standard A4 format
- **Margins**: 20px on all sides
- **Fonts**: Helvetica for clean, professional appearance

## 📱 Responsive Design

The application is fully responsive and includes:

- **Desktop layout**: Full sidebar with all features
- **Tablet layout**: Optimized for medium screens
- **Mobile layout**: Collapsible sidebar with touch-friendly controls

## 🚀 Deployment

link - https://note-app-tan-omega.vercel.app/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Groq** for providing the AI API
- **Next.js team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set

## 📞 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include your browser version and operating system

## 🔮 Future Enhancements

- **Multi-language support** with AI translation
- **Version history** for note changes
- **Collaborative editing** features
- **Cloud sync** options
- **Advanced search** with filters
- **Note templates** for common use cases

---

**TakeNote** - Where AI meets productivity in note-taking! 🚀

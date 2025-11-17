# Contributing to Take-Note

Small guide to help you make edits and understand the code layout.

Code map (high-level):

- `src/app/` - Next.js App Router pages and API routes.

  - `src/app/page.tsx` - main app page, composes sidebar, header, and editor.
  - `src/app/api/ai/route.ts` - server API route used for AI features.

- `src/components/` - React components used in the UI.

  - `AppHeader.tsx` - top header with AI tools and lock controls.
  - `NotesSidebar.tsx` - note list, lock/unlock actions.
  - `NoteEditor.tsx` - editor UI and controls.
  - `PasswordModal.tsx` - modal to input unlock password.

- `src/hooks/` - small hooks

  - `useNotes.ts` - note state management and persistence (IndexedDB)
  - `useAI.ts` - client helper to call `/api/ai`

- `src/utils/` - utilities
  - `encryption.ts` - Web Crypto helpers (PBKDF2 + AES-GCM)
  - `storage.ts` - IDB helper functions

Editing guidelines:

- Keep security in mind: decrypted note content must not be written to storage unless explicitly requested. See `useNotes` and `unlockedContents` behavior.
- When changing UI state that affects unlocked content, update both `useNotes` and any consumers (AppHeader, NoteEditor, NotesSidebar).
- Keep components small and focused; prefer to lift state up into `useNotes` when shared across components.
- Add tests and type annotations when editing hooks or utils.

If you are unsure where to change behavior, start at `src/hooks/useNotes.ts` and trace which components use the exported functions/state.

# 📝 Take-Note – AI-Powered Rich Text Notes App

A modern **Next.js** application for creating, editing, and managing rich text notes with **AI-powered features** and **local data persistence**.  
The app is optimized for simplicity, speed, and offline-friendly usage via IndexedDB.

---

## 🚀 Core Functionalities

### 1. Custom Rich Text Editor

- Built **from scratch** without libraries like TinyMCE or Quill.
- Supports:
  - **Bold**
  - **Italic**
  - **Underline**
  - **Text alignment** (Left, Center, Right)
  - **Font size changes**
- Toolbar with buttons for easy text formatting.

---

### 2. Note Management

- **Create, edit, delete** notes.
- **Pin important notes** – pinned notes always appear at the top of the list.
- **Search notes** by title or content.

---

### 3. Basic UI with Persistence

- Clean, intuitive layout with:
  - Formatting toolbar
  - Notes list sidebar
  - Main editing area
- **IndexedDB storage** to save notes and preferences between sessions.

---

### 4. AI Features

> Powered by an external AI API (configurable in code).

- **Auto Glossary Highlighting** – highlights key terms, hover to view definitions.
- **Summarization** – condenses note content to 1–2 sentences.
- **AI Tag Suggestions** – suggests 3–5 relevant tags for the note.
- **Grammar Check** – underlines grammatical errors.

---

### 5. Note Encryption

- Password-protect individual notes.
- Requires password entry to view encrypted content.

---

### 6. Hosting

- Deployed to [Vercel](https://vercel.com/) for production hosting.

---

## 📂 Project Structure

img

## ⚙️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Data Storage:** IndexedDB (via `idb`)
- **AI Integration:** Configurable API (Grok Cloud api )
- **Encryption:** AES via Web Crypto API

```

AES-GCM (Advanced Encryption Standard – Galois/Counter Mode) for encryption, and PBKDF2 (Password-Based Key Derivation Function 2) with SHA-256 for secure key derivation.

AES-256-GCM: Authenticated encryption mode that ensures both confidentiality and integrity of the data.

PBKDF2 with SHA-256: Derives the AES key from the user’s password using 120,000 iterations and a random 16-byte salt, making brute-force attacks computationally expensive.

Each encrypted note uses a unique Initialization Vector (IV) and salt for maximum security.

All cryptographic operations are performed locally in the browser using the Web Crypto API — the password never leaves the user’s device.

```

---

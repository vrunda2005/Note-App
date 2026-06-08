# 📝 TakeNote - Intelligent, Secure, & Scalable Note-Taking Platform

Welcome to **TakeNote**, a high-fidelity, full-stack note-taking platform designed for modern workflows. Built with **Next.js 15**, **React 19**, and **TypeScript**, TakeNote bridges the gap between quick note-taking, canvas-based sketching, and professional-grade AI assistance. 

---

## 🛠️ Tech Stack: The Engine Under the Hood

We chose our technical stack to guarantee maximum responsiveness, security, and developer velocity:

*   **Frontend Framework:** `React 19` & `Next.js 15.4` (utilizing the modern App Router architecture for seamless client/server execution).
*   **Styling & Design System:** `Tailwind CSS` for utility-first responsive styling and `Lucide React` for clean, consistent iconography.
*   **AI Integration:** Google Gemini API for fast, contextual language and grammar analysis.
*   **Security & Encryption:**
    *   Client-side **AES-GCM (256-bit)** encryption via the Web Crypto API for secure, password-locked notes.
    *   **JWT (JSON Web Tokens)** stored in security-hardened `HTTP-only cookies` for stateless session authentication.
    *   Secure server-side password hashing powered by **bcrypt**.
*   **State Management & Performance:**
    *   Optimistic state synchronization via custom React context (`useNotes` & `useAuth`).
    *   Custom debounce scheduling to reduce unnecessary server synchronization.

---

## 🎨 Feature Suite: Built for Creative & Analytical Minds

TakeNote goes far beyond basic text input. It organizes your creative flow into three primary workspaces:

### 1. Unified Note Action Bar
Surfaced right at the top of the editor, this command center gives you one-click access to everything:
*   🔒 **Zero-Knowledge Encryption:** Instantly password-protect sensitive notes. Plaintext keys and unencrypted contents never leave your device.
*   🎨 **Interactive Canvas:** Draw, sketch, and visualize ideas with an integrated vector canvas. Toggle back to text mode with a single click.
*   📤 **Note Sharing:** Safely share notes with others via email-linked accounts.
*   📄 **Export PDF:** Download cleanly formatted PDF copies of your notes directly to your machine.

### 2. Segmented AI Copilot Sidebar
A dedicated 3-column right sidebar houses your AI companion, neatly divided into two distinct panels:
*   ✨ **Assistant Tab:** Focuses on language operations. Get instant grammar suggestions, readability grade evaluations (Flesch-Kincaid), tag recommendations, custom summaries, and glossary term highlighting.
*   📊 **Analytics Tab:** Built for transparency. Tracks requests made, approximate token efficiency, API latencies, and service success rates.

### 3. Smart Note Manager
*   Persistent categorization sidebar with pinning support.
*   Search filter indexing tags, note titles, and contents.
*   Automated background synchronization (debounced at 1000ms) to ensure your data is always safe without clogging network bandwidth.

---

## 🌱 What Lies Ahead: Future Horizons

While TakeNote is production-ready, great software is never truly finished. Here is where we want to take the platform next in a warm, human-centric manner:

*   🔄 **Real-Time Collaboration:** Integrating WebSockets or CRDTs (like Yjs) to enable Google Docs-style live collaborative note editing and canvas whiteboarding with teammates.
*   🗄️ **ORM Database Migration:** Migrating the prototype backend storage to a production SQL database (like PostgreSQL) utilizing **Prisma** or **Drizzle ORM** for scalable querying.
*   ✍️ **TipTap Rich Text Editor:** Moving to a block-based TipTap editor to support slash commands, code blocks, task lists, and drag-and-drop elements.
*   📱 **Offline First (PWA):** Building robust Service Worker caching and IndexedDB synchronization so you can view, create, and encrypt notes even when you are 30,000 feet in the air without internet.
*   🔐 **Multi-Factor Authentication (MFA):** Adding support for authenticator apps (TOTP) to double down on profile security.

---

## 🏁 Getting Started

### Prerequisites
*   Node.js 18+
*   npm or pnpm

### Quick Start
1. **Clone and Install:**
   ```bash
   git clone https://github.com/vrunda2005/Note-App.git
   cd take-note
   npm install
   ```
2. **Environment Configuration:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   JWT_SECRET=your_secure_jwt_token_secret
   ```
3. **Run Dev Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to start writing!

---

## 👤 Author & Contributor

**Vrunda Patel**
*   **GitHub:** [@vrunda2005](https://github.com/vrunda2005)
*   **Project Link:** [Note-App](https://github.com/vrunda2005/Note-App)

*Developed with care to make note-taking smarter, safer, and cleaner.*

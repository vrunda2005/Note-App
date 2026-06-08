# 🗄️ TakeNote Database Migration Guide (PostgreSQL & Prisma)

This guide outlines the database architecture strategy for transitioning TakeNote from local JSON storage to a production-grade relational database.

---

## ⚖️ PostgreSQL vs. MongoDB: Decision Criteria

For TakeNote, **PostgreSQL combined with Prisma ORM** is the recommended choice. Here is why:

| Feature | PostgreSQL + Prisma (Recommended) | MongoDB (NoSQL) |
| :--- | :--- | :--- |
| **Data Relations** | **Superior:** Direct SQL foreign keys link notes to users. Share-permissions are cleanly structured. | **Weak:** Relations are mock-managed via nested string arrays. |
| **Referential Integrity**| **Strong:** Deleting a user cascade-deletes their notes automatically. | **Manual:** Requires manual database cleanup triggers. |
| **Type Safety** | **Outstanding:** Prisma generates precise, strong TypeScript interfaces directly from the schema. | **Partial:** Schemas must be maintained via secondary ODM (Mongoose). |
| **Canvas Data** | **Supported:** Easily stores canvas points/drawing lists inside `JSONB` columns. | **Supported:** Native JSON storage. |

---

## 🚀 Step 1: Spin Up PostgreSQL

You can run PostgreSQL locally or host it on a free cloud provider:
*   **Cloud Hosted (Easiest):** Spin up a database in 2 minutes using [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
*   **Local Setup (Docker):**
    ```bash
    docker run --name takenote-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
    ```

---

## 🛠️ Step 2: Install Prisma CLI & Client

Run these commands in your project root to pull in the dependencies:
```bash
npm install @prisma/client
npm install -D prisma
```

---

## 📝 Step 3: Configure Environment Variables

Add your PostgreSQL connection string to `.env.local`:
```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/takenote?schema=public"
```

---

## ⚡ Step 4: Run Migrations

To apply the schema from `prisma/schema.prisma` to your live PostgreSQL database, run:
```bash
npx prisma migrate dev --name init
```
This command will create the tables and generate your Prisma Client (`@prisma/client`) types.

---

## 🎨 Step 5: Prisma DB Client Code Blueprint

When you are ready to switch the local JSON file database (`src/lib/db.ts`) to use PostgreSQL, use this blueprint as a replacement:

```typescript
import { prisma } from './prisma';
import { Note } from '../types';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export const db = {
  users: {
    create: async (user: Omit<User, 'createdAt'>) => {
      return await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
        }
      });
    },
    findByEmail: async (email: string) => {
      return await prisma.user.findUnique({
        where: { email },
      });
    },
    findById: async (id: string) => {
      return await prisma.user.findUnique({
        where: { id },
      });
    },
  },
  notes: {
    getByUserId: async (userId: string) => {
      // Find the user email to check notes shared with them
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return [];

      return await prisma.note.findMany({
        where: {
          OR: [
            { userId: userId },
            { sharedWith: { has: user.email } }
          ]
        },
        orderBy: {
          lastModified: 'desc'
        }
      });
    },
    create: async (note: Omit<Note, 'lastModified'>) => {
      return await prisma.note.create({
        data: {
          id: note.id,
          title: note.title,
          content: note.content,
          pinned: note.pinned,
          tags: note.tags,
          summary: note.summary,
          passwordProtected: note.passwordProtected,
          encryptedContent: note.encryptedContent,
          userId: note.userId,
          sharedWith: note.sharedWith,
        }
      });
    },
    update: async (id: string, updates: Partial<Note>) => {
      // Convert standard Note fields to Prisma update payload
      const data: any = {};
      if (updates.title !== undefined) data.title = updates.title;
      if (updates.content !== undefined) data.content = updates.content;
      if (updates.pinned !== undefined) data.pinned = updates.pinned;
      if (updates.tags !== undefined) data.tags = updates.tags;
      if (updates.summary !== undefined) data.summary = updates.summary;
      if (updates.passwordProtected !== undefined) data.passwordProtected = updates.passwordProtected;
      if (updates.encryptedContent !== undefined) data.encryptedContent = updates.encryptedContent;
      if (updates.sharedWith !== undefined) data.sharedWith = updates.sharedWith;

      return await prisma.note.update({
        where: { id },
        data,
      });
    },
    delete: async (id: string) => {
      await prisma.note.delete({
        where: { id },
      });
    },
    findById: async (id: string) => {
      return await prisma.note.findUnique({
        where: { id },
      });
    }
  }
};
```

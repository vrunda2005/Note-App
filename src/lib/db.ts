import { prisma } from './prisma';
import { Note } from '../types';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

const mapPrismaNote = (note: any): Note => ({
  id: note.id,
  title: note.title,
  content: note.content,
  pinned: note.pinned,
  tags: note.tags,
  summary: note.summary,
  passwordProtected: note.passwordProtected,
  encryptedContent: note.encryptedContent ?? undefined,
  lastModified: note.lastModified.getTime(),
  userId: note.userId,
  sharedWith: note.sharedWith,
});

export const db = {
  users: {
    create: async (user: Omit<User, 'createdAt'>) => {
      const created = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
        }
      });
      return {
        ...created,
        createdAt: created.createdAt.toISOString()
      };
    },
    findByEmail: async (email: string): Promise<User | undefined> => {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) return undefined;
      return {
        ...user,
        createdAt: user.createdAt.toISOString()
      };
    },
    findById: async (id: string): Promise<User | undefined> => {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) return undefined;
      return {
        ...user,
        createdAt: user.createdAt.toISOString()
      };
    },
  },
  notes: {
    getByUserId: async (userId: string): Promise<Note[]> => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return [];

      const notes = await prisma.note.findMany({
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
      return notes.map(mapPrismaNote);
    },
    create: async (note: Omit<Note, 'lastModified'>): Promise<Note> => {
      const created = await prisma.note.create({
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
      return mapPrismaNote(created);
    },
    update: async (id: string, updates: Partial<Note>): Promise<Note | null> => {
      const data: any = {};
      if (updates.title !== undefined) data.title = updates.title;
      if (updates.content !== undefined) data.content = updates.content;
      if (updates.pinned !== undefined) data.pinned = updates.pinned;
      if (updates.tags !== undefined) data.tags = updates.tags;
      if (updates.summary !== undefined) data.summary = updates.summary;
      if (updates.passwordProtected !== undefined) data.passwordProtected = updates.passwordProtected;
      if (updates.encryptedContent !== undefined) data.encryptedContent = updates.encryptedContent;
      if (updates.sharedWith !== undefined) data.sharedWith = updates.sharedWith;

      const updated = await prisma.note.update({
        where: { id },
        data,
      });
      return mapPrismaNote(updated);
    },
    delete: async (id: string): Promise<void> => {
      await prisma.note.delete({
        where: { id },
      });
    },
    findById: async (id: string): Promise<Note | undefined> => {
      const note = await prisma.note.findUnique({
        where: { id },
      });
      if (!note) return undefined;
      return mapPrismaNote(note);
    }
  }
};

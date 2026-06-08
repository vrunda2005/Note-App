import fs from 'fs';
import path from 'path';
import { Note } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Ensure notes file exists
if (!fs.existsSync(NOTES_FILE)) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export const db = {
  users: {
    getAll: (): User[] => {
      try {
        const data = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        return [];
      }
    },
    create: (user: User) => {
      const users = db.users.getAll();
      users.push(user);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return user;
    },
    findByEmail: (email: string): User | undefined => {
      const users = db.users.getAll();
      return users.find((u) => u.email === email);
    },
    findById: (id: string): User | undefined => {
      const users = db.users.getAll();
      return users.find((u) => u.id === id);
    },
  },
  notes: {
    getAll: (): Note[] => {
      try {
        const data = fs.readFileSync(NOTES_FILE, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        return [];
      }
    },
    getByUserId: (userId: string): Note[] => {
      const notes = db.notes.getAll();
      const user = db.users.findById(userId);
      if (!user) return [];

      return notes.filter(n =>
        n.userId === userId ||
        (n.sharedWith && n.sharedWith.includes(user.email))
      );
    },
    create: (note: Note) => {
      const notes = db.notes.getAll();
      notes.push(note);
      fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
      return note;
    },
    update: (id: string, updates: Partial<Note>) => {
      const notes = db.notes.getAll();
      const index = notes.findIndex(n => n.id === id);
      if (index === -1) return null;

      const updatedNote = { ...notes[index], ...updates };
      notes[index] = updatedNote;
      fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
      return updatedNote;
    },
    delete: (id: string) => {
      const notes = db.notes.getAll();
      const filtered = notes.filter(n => n.id !== id);
      fs.writeFileSync(NOTES_FILE, JSON.stringify(filtered, null, 2));
    },
    findById: (id: string): Note | undefined => {
      const notes = db.notes.getAll();
      return notes.find(n => n.id === id);
    }
  }
};

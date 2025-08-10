import { openDB, IDBPDatabase } from 'idb';
import { type Note,type Drawing } from '@/types'; // Assuming you have a Note type definition

const DB_NAME = 'notes-app-db';
const STORE_NAME = 'notes';
const STORE_DRAWINGS = 'drawings';

const DB_VERSION = 2;


/**
 * Initializes and opens a connection to the IndexedDB database.
 * @returns A promise that resolves to the database instance.
 */
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    /**
     * The upgrade callback is only triggered if the database version changes
     * or if the database does not yet exist.
     * @param db The database instance.
     */
    upgrade(db) {
      // Create the 'notes' object store if it doesn't already exist.
      // The 'id' property is set as the keyPath, meaning it's the unique identifier for each record.
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }

       // Create 'drawings' store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_DRAWINGS)) {
        db.createObjectStore(STORE_DRAWINGS, { keyPath: 'id' });
      }
    }
  });
}

/**
 * Saves or updates a note in the database.
 * The 'put' method handles both creation and updates automatically.
 * @param note The note object to save.
 */
export async function saveNote(note: Note): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, note);
}

/**
 * Retrieves all notes from the database.
 * @returns A promise that resolves to an array of all note objects.
 */
export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  // The 'getAll' method efficiently fetches all records from the object store.
  return db.getAll(STORE_NAME);
}

/**
 * Deletes a specific note from the database by its ID.
 * @param id The unique ID of the note to delete.
 */
export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}



// Drawings API - save, get, delete drawings
export async function saveDrawing(drawing: Drawing): Promise<void> {
  const db = await getDB();
  await db.put(STORE_DRAWINGS, drawing);
}

export async function getDrawing(id: string): Promise<Drawing | undefined> {
  const db = await getDB();
  return db.get(STORE_DRAWINGS, id);
}

export async function getAllDrawings(): Promise<Drawing[]> {
  const db = await getDB();
  return db.getAll(STORE_DRAWINGS);
}

export async function deleteDrawing(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_DRAWINGS, id);
}
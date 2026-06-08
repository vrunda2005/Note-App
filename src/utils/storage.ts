import { openDB, IDBPDatabase } from 'idb';
import { type Note } from '@/types';

const DB_NAME = 'notes-app-db';
const STORE_NAME = 'notes';
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
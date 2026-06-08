export interface Note {
  id: string;
  title: string;
  content: string;           // content (or encryptedContent if encrypted)
  pinned: boolean;
  tags: string[];
  summary: string;
  passwordProtected: boolean;
  encryptedContent?: string; //  if passwordProtected = true
  lastModified: number;
  userId: string;
  sharedWith: string[]; // List of user emails
}
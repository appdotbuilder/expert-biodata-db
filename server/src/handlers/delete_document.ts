
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

export async function deleteDocument(id: number): Promise<boolean> {
  try {
    // First, get the document to check if it exists and get file path
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, id))
      .execute();

    if (documents.length === 0) {
      return false; // Document not found
    }

    const document = documents[0];

    // Delete the database record first
    const result = await db.delete(documentsTable)
      .where(eq(documentsTable.id, id))
      .execute();

    // If database deletion was successful, try to delete the physical file
    if (result.rowCount && result.rowCount > 0) {
      try {
        // Check if file exists before attempting to delete
        if (existsSync(document.file_path)) {
          await unlink(document.file_path);
        }
        // File deletion success or file didn't exist - both are acceptable
      } catch (fileError) {
        // Log file deletion error but don't fail the operation
        // Database record is already deleted, which is the primary concern
        console.error('Failed to delete physical file:', fileError);
      }
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('Document deletion failed:', error);
    throw error;
  }
}


import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type Document } from '../schema';
import { eq } from 'drizzle-orm';

export async function getExpertDocuments(expertId: number): Promise<Document[]> {
  try {
    const results = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.expert_id, expertId))
      .execute();

    return results.map(document => ({
      ...document,
      uploaded_at: document.uploaded_at
    }));
  } catch (error) {
    console.error('Failed to fetch expert documents:', error);
    throw error;
  }
}

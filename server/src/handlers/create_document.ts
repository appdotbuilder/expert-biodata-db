
import { db } from '../db';
import { documentsTable, expertsTable } from '../db/schema';
import { type CreateDocumentInput, type Document } from '../schema';
import { eq } from 'drizzle-orm';

export const createDocument = async (input: CreateDocumentInput): Promise<Document> => {
  try {
    // Verify that the expert exists
    const expertExists = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, input.expert_id))
      .execute();

    if (expertExists.length === 0) {
      throw new Error(`Expert with id ${input.expert_id} not found`);
    }

    // Insert document record
    const result = await db.insert(documentsTable)
      .values({
        expert_id: input.expert_id,
        document_name: input.document_name,
        document_type: input.document_type,
        file_path: input.file_path,
        file_size: input.file_size,
        mime_type: input.mime_type
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Document creation failed:', error);
    throw error;
  }
};


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expertsTable, documentsTable } from '../db/schema';
import { type CreateExpertInput, type CreateDocumentInput } from '../schema';
import { deleteDocument } from '../handlers/delete_document';
import { eq } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Test data
const testExpert: CreateExpertInput = {
  full_name: 'Test Expert',
  place_of_birth: 'Test City',
  date_of_birth: new Date('1990-01-01'),
  address: '123 Test Street',
  email: 'test@example.com',
  phone_number: '+1234567890'
};

const testDocument: CreateDocumentInput = {
  expert_id: 1, // Will be set after expert creation
  document_name: 'Test CV',
  document_type: 'cv',
  file_path: '/tmp/test_cv.pdf',
  file_size: 1024,
  mime_type: 'application/pdf'
};

describe('deleteDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing document from database', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: testExpert.full_name,
        place_of_birth: testExpert.place_of_birth,
        date_of_birth: '1990-01-01', // Use string format for date column
        address: testExpert.address,
        email: testExpert.email,
        phone_number: testExpert.phone_number
      })
      .returning()
      .execute();

    const expertId = expertResult[0].id;

    // Create document
    const documentResult = await db.insert(documentsTable)
      .values({
        ...testDocument,
        expert_id: expertId
      })
      .returning()
      .execute();

    const documentId = documentResult[0].id;

    // Delete the document
    const result = await deleteDocument(documentId);

    expect(result).toBe(true);

    // Verify document is deleted from database
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, documentId))
      .execute();

    expect(documents).toHaveLength(0);
  });

  it('should delete physical file when document exists', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: testExpert.full_name,
        place_of_birth: testExpert.place_of_birth,
        date_of_birth: '1990-01-01', // Use string format for date column
        address: testExpert.address,
        email: testExpert.email,
        phone_number: testExpert.phone_number
      })
      .returning()
      .execute();

    const expertId = expertResult[0].id;

    // Create test file
    const testFilePath = join('/tmp', 'test_document_delete.txt');
    await writeFile(testFilePath, 'test content');

    // Create document with test file path
    const documentResult = await db.insert(documentsTable)
      .values({
        ...testDocument,
        expert_id: expertId,
        file_path: testFilePath
      })
      .returning()
      .execute();

    const documentId = documentResult[0].id;

    // Verify file exists before deletion
    expect(existsSync(testFilePath)).toBe(true);

    // Delete the document
    const result = await deleteDocument(documentId);

    expect(result).toBe(true);

    // Verify file is deleted
    expect(existsSync(testFilePath)).toBe(false);
  });

  it('should return false when document does not exist', async () => {
    const nonExistentId = 999;

    const result = await deleteDocument(nonExistentId);

    expect(result).toBe(false);
  });

  it('should handle case when physical file does not exist', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: testExpert.full_name,
        place_of_birth: testExpert.place_of_birth,
        date_of_birth: '1990-01-01', // Use string format for date column
        address: testExpert.address,
        email: testExpert.email,
        phone_number: testExpert.phone_number
      })
      .returning()
      .execute();

    const expertId = expertResult[0].id;

    // Create document with non-existent file path
    const nonExistentPath = '/tmp/non_existent_file.pdf';
    const documentResult = await db.insert(documentsTable)
      .values({
        ...testDocument,
        expert_id: expertId,
        file_path: nonExistentPath
      })
      .returning()
      .execute();

    const documentId = documentResult[0].id;

    // Delete should still succeed even if file doesn't exist
    const result = await deleteDocument(documentId);

    expect(result).toBe(true);

    // Verify document is deleted from database
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, documentId))
      .execute();

    expect(documents).toHaveLength(0);
  });

  it('should delete document with all valid document types', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: testExpert.full_name,
        place_of_birth: testExpert.place_of_birth,
        date_of_birth: '1990-01-01', // Use string format for date column
        address: testExpert.address,
        email: testExpert.email,
        phone_number: testExpert.phone_number
      })
      .returning()
      .execute();

    const expertId = expertResult[0].id;

    const documentTypes: Array<'cv' | 'certificate' | 'portfolio' | 'other'> = ['cv', 'certificate', 'portfolio', 'other'];

    for (const docType of documentTypes) {
      // Create document of specific type
      const documentResult = await db.insert(documentsTable)
        .values({
          ...testDocument,
          expert_id: expertId,
          document_type: docType,
          document_name: `Test ${docType}`
        })
        .returning()
        .execute();

      const documentId = documentResult[0].id;

      // Delete the document
      const result = await deleteDocument(documentId);

      expect(result).toBe(true);

      // Verify document is deleted
      const documents = await db.select()
        .from(documentsTable)
        .where(eq(documentsTable.id, documentId))
        .execute();

      expect(documents).toHaveLength(0);
    }
  });
});

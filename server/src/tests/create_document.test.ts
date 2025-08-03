
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { documentsTable, expertsTable } from '../db/schema';
import { type CreateDocumentInput } from '../schema';
import { createDocument } from '../handlers/create_document';
import { eq } from 'drizzle-orm';

// Test input for creating an expert first
const testExpertData = {
  full_name: 'John Doe',
  place_of_birth: 'New York',
  date_of_birth: '1990-01-01', // String format for date column
  address: '123 Main St',
  email: 'john.doe@example.com',
  phone_number: '+1234567890'
};

// Test input for creating a document
const testDocumentInput: CreateDocumentInput = {
  expert_id: 1, // Will be updated after creating expert
  document_name: 'John Doe CV',
  document_type: 'cv',
  file_path: '/uploads/documents/john_doe_cv.pdf',
  file_size: 2048576,
  mime_type: 'application/pdf'
};

describe('createDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a document', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values(testExpertData)
      .returning()
      .execute();

    const updatedInput = {
      ...testDocumentInput,
      expert_id: expertResult[0].id
    };

    const result = await createDocument(updatedInput);

    // Basic field validation
    expect(result.expert_id).toEqual(expertResult[0].id);
    expect(result.document_name).toEqual('John Doe CV');
    expect(result.document_type).toEqual('cv');
    expect(result.file_path).toEqual('/uploads/documents/john_doe_cv.pdf');
    expect(result.file_size).toEqual(2048576);
    expect(result.mime_type).toEqual('application/pdf');
    expect(result.id).toBeDefined();
    expect(result.uploaded_at).toBeInstanceOf(Date);
  });

  it('should save document to database', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values(testExpertData)
      .returning()
      .execute();

    const updatedInput = {
      ...testDocumentInput,
      expert_id: expertResult[0].id
    };

    const result = await createDocument(updatedInput);

    // Query database to verify document was saved
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, result.id))
      .execute();

    expect(documents).toHaveLength(1);
    expect(documents[0].expert_id).toEqual(expertResult[0].id);
    expect(documents[0].document_name).toEqual('John Doe CV');
    expect(documents[0].document_type).toEqual('cv');
    expect(documents[0].file_path).toEqual('/uploads/documents/john_doe_cv.pdf');
    expect(documents[0].file_size).toEqual(2048576);
    expect(documents[0].mime_type).toEqual('application/pdf');
    expect(documents[0].uploaded_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent expert', async () => {
    const invalidInput = {
      ...testDocumentInput,
      expert_id: 999 // Non-existent expert ID
    };

    await expect(createDocument(invalidInput)).rejects.toThrow(/expert with id 999 not found/i);
  });

  it('should handle different document types', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values(testExpertData)
      .returning()
      .execute();

    const certificateInput = {
      expert_id: expertResult[0].id,
      document_name: 'AWS Certification',
      document_type: 'certificate' as const,
      file_path: '/uploads/certificates/aws_cert.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf'
    };

    const result = await createDocument(certificateInput);

    expect(result.document_type).toEqual('certificate');
    expect(result.document_name).toEqual('AWS Certification');
    expect(result.file_path).toEqual('/uploads/certificates/aws_cert.pdf');
  });
});

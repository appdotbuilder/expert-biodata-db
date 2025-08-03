
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expertsTable, documentsTable } from '../db/schema';
import { type CreateDocumentInput } from '../schema';
import { getExpertDocuments } from '../handlers/get_expert_documents';

// Test data
const testExpert = {
  full_name: 'John Doe',
  place_of_birth: 'New York',
  date_of_birth: '1990-01-01', // String format for date column
  address: '123 Main St',
  email: 'john.doe@example.com',
  phone_number: '+1234567890'
};

const testDocument: CreateDocumentInput = {
  expert_id: 1, // Will be updated after creating expert
  document_name: 'Resume.pdf',
  document_type: 'cv',
  file_path: '/uploads/resume.pdf',
  file_size: 1024000,
  mime_type: 'application/pdf'
};

describe('getExpertDocuments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when expert has no documents', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const result = await getExpertDocuments(expertResult[0].id);

    expect(result).toEqual([]);
  });

  it('should return all documents for an expert', async () => {
    // Create expert first
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const expertId = expertResult[0].id;

    // Create multiple documents
    const document1 = { ...testDocument, expert_id: expertId };
    const document2 = {
      ...testDocument,
      expert_id: expertId,
      document_name: 'Certificate.pdf',
      document_type: 'certificate' as const,
      file_path: '/uploads/certificate.pdf'
    };

    await db.insert(documentsTable)
      .values([document1, document2])
      .execute();

    const result = await getExpertDocuments(expertId);

    expect(result).toHaveLength(2);
    
    // Check first document
    expect(result[0].document_name).toEqual('Resume.pdf');
    expect(result[0].document_type).toEqual('cv');
    expect(result[0].file_path).toEqual('/uploads/resume.pdf');
    expect(result[0].file_size).toEqual(1024000);
    expect(result[0].mime_type).toEqual('application/pdf');
    expect(result[0].expert_id).toEqual(expertId);
    expect(result[0].id).toBeDefined();
    expect(result[0].uploaded_at).toBeInstanceOf(Date);

    // Check second document
    expect(result[1].document_name).toEqual('Certificate.pdf');
    expect(result[1].document_type).toEqual('certificate');
    expect(result[1].file_path).toEqual('/uploads/certificate.pdf');
  });

  it('should not return documents from other experts', async () => {
    // Create two experts
    const expert1Result = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const expert2Result = await db.insert(expertsTable)
      .values({
        ...testExpert,
        full_name: 'Jane Smith',
        email: 'jane.smith@example.com'
      })
      .returning()
      .execute();

    const expert1Id = expert1Result[0].id;
    const expert2Id = expert2Result[0].id;

    // Create documents for both experts
    await db.insert(documentsTable)
      .values([
        { ...testDocument, expert_id: expert1Id },
        { ...testDocument, expert_id: expert2Id, document_name: 'Other Resume.pdf' }
      ])
      .execute();

    const result = await getExpertDocuments(expert1Id);

    expect(result).toHaveLength(1);
    expect(result[0].document_name).toEqual('Resume.pdf');
    expect(result[0].expert_id).toEqual(expert1Id);
  });

  it('should return empty array for non-existent expert', async () => {
    const result = await getExpertDocuments(999);

    expect(result).toEqual([]);
  });
});


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { certificationsTable, expertsTable } from '../db/schema';
import { type CreateCertificationInput } from '../schema';
import { createCertification } from '../handlers/create_certification';
import { eq } from 'drizzle-orm';

// Test data
const testExpert = {
  full_name: 'John Doe',
  place_of_birth: 'New York',
  date_of_birth: '1990-01-01',
  address: '123 Main St',
  email: 'john@example.com',
  phone_number: '+1234567890'
};

const testInput: CreateCertificationInput = {
  expert_id: 1, // Will be updated after expert creation
  certification_name: 'AWS Certified Solutions Architect',
  issuing_body: 'Amazon Web Services',
  year_obtained: 2023,
  expiry_date: new Date('2026-12-31')
};

describe('createCertification', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a certification', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const input = { ...testInput, expert_id: expertResult[0].id };
    const result = await createCertification(input);

    // Basic field validation
    expect(result.certification_name).toEqual('AWS Certified Solutions Architect');
    expect(result.issuing_body).toEqual('Amazon Web Services');
    expect(result.year_obtained).toEqual(2023);
    expect(result.expiry_date).toEqual(new Date('2026-12-31'));
    expect(result.expert_id).toEqual(expertResult[0].id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save certification to database', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const input = { ...testInput, expert_id: expertResult[0].id };
    const result = await createCertification(input);

    // Query database to verify
    const certifications = await db.select()
      .from(certificationsTable)
      .where(eq(certificationsTable.id, result.id))
      .execute();

    expect(certifications).toHaveLength(1);
    expect(certifications[0].certification_name).toEqual('AWS Certified Solutions Architect');
    expect(certifications[0].issuing_body).toEqual('Amazon Web Services');
    expect(certifications[0].year_obtained).toEqual(2023);
    expect(certifications[0].expiry_date).toEqual('2026-12-31'); // Database stores as string
    expect(certifications[0].expert_id).toEqual(expertResult[0].id);
    expect(certifications[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle certification without expiry date', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const inputWithoutExpiry = {
      ...testInput,
      expert_id: expertResult[0].id,
      expiry_date: null
    };

    const result = await createCertification(inputWithoutExpiry);

    expect(result.certification_name).toEqual('AWS Certified Solutions Architect');
    expect(result.expiry_date).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should throw error when expert does not exist', async () => {
    const input = { ...testInput, expert_id: 999 };

    await expect(createCertification(input)).rejects.toThrow(/expert with id 999 not found/i);
  });

  it('should create multiple certifications for same expert', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const input1 = { ...testInput, expert_id: expertResult[0].id };
    const input2 = {
      ...testInput,
      expert_id: expertResult[0].id,
      certification_name: 'Google Cloud Professional',
      issuing_body: 'Google Cloud',
      year_obtained: 2022
    };

    const result1 = await createCertification(input1);
    const result2 = await createCertification(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.expert_id).toEqual(result2.expert_id);
    expect(result1.certification_name).toEqual('AWS Certified Solutions Architect');
    expect(result2.certification_name).toEqual('Google Cloud Professional');

    // Verify both exist in database
    const certifications = await db.select()
      .from(certificationsTable)
      .where(eq(certificationsTable.expert_id, expertResult[0].id))
      .execute();

    expect(certifications).toHaveLength(2);
  });

  it('should convert date properly between formats', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const testDate = new Date('2025-06-15');
    const input = {
      ...testInput,
      expert_id: expertResult[0].id,
      expiry_date: testDate
    };

    const result = await createCertification(input);

    // Handler should return Date object
    expect(result.expiry_date).toBeInstanceOf(Date);
    expect(result.expiry_date).toEqual(testDate);

    // Database should store as string
    const dbRecord = await db.select()
      .from(certificationsTable)
      .where(eq(certificationsTable.id, result.id))
      .execute();

    expect(dbRecord[0].expiry_date).toEqual('2025-06-15');
  });
});

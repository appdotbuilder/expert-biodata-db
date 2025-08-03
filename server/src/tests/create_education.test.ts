
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { educationTable, expertsTable } from '../db/schema';
import { type CreateEducationInput, type CreateExpertInput } from '../schema';
import { createEducation } from '../handlers/create_education';
import { eq } from 'drizzle-orm';

// Test data
const testExpert: CreateExpertInput = {
  full_name: 'John Doe',
  place_of_birth: 'Jakarta',
  date_of_birth: new Date('1990-01-01'),
  address: '123 Main St',
  email: 'john.doe@example.com',
  phone_number: '+62123456789'
};

const testEducation: CreateEducationInput = {
  expert_id: 1, // Will be updated after creating expert
  level: 'Bachelor',
  major: 'Computer Science',
  institution: 'MIT',
  graduation_year: 2015
};

describe('createEducation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an education record', async () => {
    // Create prerequisite expert - convert Date to string for date column
    const expertResult = await db.insert(expertsTable)
      .values({
        ...testExpert,
        date_of_birth: testExpert.date_of_birth.toISOString().split('T')[0] // Convert Date to YYYY-MM-DD string
      })
      .returning()
      .execute();
    const expertId = expertResult[0].id;

    const educationInput = { ...testEducation, expert_id: expertId };
    const result = await createEducation(educationInput);

    // Validate returned education
    expect(result.expert_id).toEqual(expertId);
    expect(result.level).toEqual('Bachelor');
    expect(result.major).toEqual('Computer Science');
    expect(result.institution).toEqual('MIT');
    expect(result.graduation_year).toEqual(2015);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save education record to database', async () => {
    // Create prerequisite expert - convert Date to string for date column
    const expertResult = await db.insert(expertsTable)
      .values({
        ...testExpert,
        date_of_birth: testExpert.date_of_birth.toISOString().split('T')[0] // Convert Date to YYYY-MM-DD string
      })
      .returning()
      .execute();
    const expertId = expertResult[0].id;

    const educationInput = { ...testEducation, expert_id: expertId };
    const result = await createEducation(educationInput);

    // Query database to verify record was saved
    const educationRecords = await db.select()
      .from(educationTable)
      .where(eq(educationTable.id, result.id))
      .execute();

    expect(educationRecords).toHaveLength(1);
    const savedEducation = educationRecords[0];
    expect(savedEducation.expert_id).toEqual(expertId);
    expect(savedEducation.level).toEqual('Bachelor');
    expect(savedEducation.major).toEqual('Computer Science');
    expect(savedEducation.institution).toEqual('MIT');
    expect(savedEducation.graduation_year).toEqual(2015);
    expect(savedEducation.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when expert does not exist', async () => {
    const educationInput = { ...testEducation, expert_id: 999 };

    await expect(createEducation(educationInput))
      .rejects
      .toThrow(/Expert with id 999 not found/i);
  });

  it('should handle multiple education records for same expert', async () => {
    // Create prerequisite expert - convert Date to string for date column
    const expertResult = await db.insert(expertsTable)
      .values({
        ...testExpert,
        date_of_birth: testExpert.date_of_birth.toISOString().split('T')[0] // Convert Date to YYYY-MM-DD string
      })
      .returning()
      .execute();
    const expertId = expertResult[0].id;

    // Create first education record
    const firstEducation = { ...testEducation, expert_id: expertId };
    const firstResult = await createEducation(firstEducation);

    // Create second education record
    const secondEducation = {
      expert_id: expertId,
      level: 'Master',
      major: 'Software Engineering',
      institution: 'Stanford',
      graduation_year: 2017
    };
    const secondResult = await createEducation(secondEducation);

    // Verify both records exist
    const allEducationRecords = await db.select()
      .from(educationTable)
      .where(eq(educationTable.expert_id, expertId))
      .execute();

    expect(allEducationRecords).toHaveLength(2);
    expect(allEducationRecords.map(e => e.level)).toContain('Bachelor');
    expect(allEducationRecords.map(e => e.level)).toContain('Master');
    expect(firstResult.id).not.toEqual(secondResult.id);
  });
});


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { workExperienceTable, expertsTable } from '../db/schema';
import { type CreateWorkExperienceInput } from '../schema';
import { createWorkExperience } from '../handlers/create_work_experience';
import { eq } from 'drizzle-orm';

// Test data
const testExpert = {
  full_name: 'Test Expert',
  place_of_birth: 'Test City',
  date_of_birth: '1990-01-01', // Use string format for date column
  address: '123 Test Street',
  email: 'test@example.com',
  phone_number: '+1234567890'
};

const testInput: CreateWorkExperienceInput = {
  expert_id: 1, // Will be set after expert creation
  company_name: 'Test Company',
  position: 'Software Engineer',
  start_date: new Date('2020-01-01'),
  end_date: new Date('2022-12-31'),
  job_description: 'Developed web applications using modern technologies'
};

describe('createWorkExperience', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create work experience', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;
    const inputWithExpertId = { ...testInput, expert_id: expertId };

    const result = await createWorkExperience(inputWithExpertId);

    // Basic field validation
    expect(result.expert_id).toEqual(expertId);
    expect(result.company_name).toEqual('Test Company');
    expect(result.position).toEqual('Software Engineer');
    expect(result.start_date).toEqual(new Date('2020-01-01'));
    expect(result.end_date).toEqual(new Date('2022-12-31'));
    expect(result.job_description).toEqual('Developed web applications using modern technologies');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save work experience to database', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;
    const inputWithExpertId = { ...testInput, expert_id: expertId };

    const result = await createWorkExperience(inputWithExpertId);

    // Query using proper drizzle syntax
    const workExperiences = await db.select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.id, result.id))
      .execute();

    expect(workExperiences).toHaveLength(1);
    expect(workExperiences[0].expert_id).toEqual(expertId);
    expect(workExperiences[0].company_name).toEqual('Test Company');
    expect(workExperiences[0].position).toEqual('Software Engineer');
    expect(workExperiences[0].created_at).toBeInstanceOf(Date);
  });

  it('should create work experience without end date', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;
    const inputWithoutEndDate = {
      ...testInput,
      expert_id: expertId,
      end_date: null
    };

    const result = await createWorkExperience(inputWithoutEndDate);

    expect(result.expert_id).toEqual(expertId);
    expect(result.end_date).toBeNull();
    expect(result.start_date).toEqual(new Date('2020-01-01'));
  });

  it('should throw error when expert does not exist', async () => {
    const inputWithInvalidExpert = { ...testInput, expert_id: 999 };

    expect(createWorkExperience(inputWithInvalidExpert))
      .rejects.toThrow(/expert.*not found/i);
  });

  it('should throw error when end date is before start date', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;
    const inputWithInvalidDates = {
      ...testInput,
      expert_id: expertId,
      start_date: new Date('2022-01-01'),
      end_date: new Date('2021-01-01') // End date before start date
    };

    expect(createWorkExperience(inputWithInvalidDates))
      .rejects.toThrow(/end date must be after start date/i);
  });

  it('should throw error when end date equals start date', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;
    const inputWithEqualDates = {
      ...testInput,
      expert_id: expertId,
      start_date: new Date('2022-01-01'),
      end_date: new Date('2022-01-01') // Same date
    };

    expect(createWorkExperience(inputWithEqualDates))
      .rejects.toThrow(/end date must be after start date/i);
  });
});

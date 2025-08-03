
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable, expertsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

// Test expert data - convert Date to string for date_of_birth
const testExpert = {
  full_name: 'John Doe',
  place_of_birth: 'New York',
  date_of_birth: '1990-01-01', // String format for date column
  address: '123 Main St',
  email: 'john.doe@example.com',
  phone_number: '+1234567890'
};

// Test project input
const testInput: CreateProjectInput = {
  expert_id: 1,
  project_name: 'E-commerce Platform',
  role_in_project: 'Lead Developer',
  start_date: new Date('2023-01-01'),
  end_date: new Date('2023-12-31'),
  description: 'Developed a full-stack e-commerce platform using React and Node.js'
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const updatedInput = { ...testInput, expert_id: expertResult[0].id };
    const result = await createProject(updatedInput);

    // Basic field validation
    expect(result.project_name).toEqual('E-commerce Platform');
    expect(result.role_in_project).toEqual('Lead Developer');
    expect(result.start_date).toEqual(new Date('2023-01-01'));
    expect(result.end_date).toEqual(new Date('2023-12-31'));
    expect(result.description).toEqual(testInput.description);
    expect(result.expert_id).toEqual(expertResult[0].id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save project to database', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const updatedInput = { ...testInput, expert_id: expertResult[0].id };
    const result = await createProject(updatedInput);

    // Query database to verify record was saved
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].project_name).toEqual('E-commerce Platform');
    expect(projects[0].role_in_project).toEqual('Lead Developer');
    expect(projects[0].description).toEqual(testInput.description);
    expect(projects[0].expert_id).toEqual(expertResult[0].id);
    expect(projects[0].created_at).toBeInstanceOf(Date);
    // Database stores dates as strings, so verify the string format
    expect(projects[0].start_date).toEqual('2023-01-01');
    expect(projects[0].end_date).toEqual('2023-12-31');
  });

  it('should create project with null end_date', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const inputWithoutEndDate = {
      ...testInput,
      expert_id: expertResult[0].id,
      end_date: null
    };

    const result = await createProject(inputWithoutEndDate);

    expect(result.project_name).toEqual('E-commerce Platform');
    expect(result.end_date).toBeNull();
    expect(result.start_date).toEqual(new Date('2023-01-01'));
  });

  it('should throw error for non-existent expert', async () => {
    const inputWithInvalidExpert = { ...testInput, expert_id: 999 };

    await expect(createProject(inputWithInvalidExpert))
      .rejects.toThrow(/expert not found/i);
  });

  it('should throw error when end_date is before start_date', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const inputWithInvalidDates = {
      ...testInput,
      expert_id: expertResult[0].id,
      start_date: new Date('2023-12-31'),
      end_date: new Date('2023-01-01')
    };

    await expect(createProject(inputWithInvalidDates))
      .rejects.toThrow(/end date cannot be before start date/i);
  });

  it('should handle same start and end dates', async () => {
    // Create prerequisite expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const sameDate = new Date('2023-06-15');
    const inputWithSameDates = {
      ...testInput,
      expert_id: expertResult[0].id,
      start_date: sameDate,
      end_date: sameDate
    };

    const result = await createProject(inputWithSameDates);

    expect(result.start_date).toEqual(sameDate);
    expect(result.end_date).toEqual(sameDate);
    expect(result.project_name).toEqual('E-commerce Platform');
  });
});

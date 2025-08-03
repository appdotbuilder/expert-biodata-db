
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expertsTable, skillsTable } from '../db/schema';
import { type CreateSkillInput } from '../schema';
import { createSkill } from '../handlers/create_skill';
import { eq, and } from 'drizzle-orm';

// Test input
const testInput: CreateSkillInput = {
  expert_id: 1,
  skill_name: 'JavaScript',
  proficiency_level: 'advanced'
};

describe('createSkill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a skill', async () => {
    // Create prerequisite expert
    await db.insert(expertsTable)
      .values({
        full_name: 'Test Expert',
        place_of_birth: 'Test City',
        date_of_birth: '1990-01-01',
        address: 'Test Address',
        email: 'test@example.com',
        phone_number: '123456789'
      })
      .execute();

    const result = await createSkill(testInput);

    // Basic field validation
    expect(result.expert_id).toEqual(1);
    expect(result.skill_name).toEqual('JavaScript');
    expect(result.proficiency_level).toEqual('advanced');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save skill to database', async () => {
    // Create prerequisite expert
    await db.insert(expertsTable)
      .values({
        full_name: 'Test Expert',
        place_of_birth: 'Test City',
        date_of_birth: '1990-01-01',
        address: 'Test Address',
        email: 'test@example.com',
        phone_number: '123456789'
      })
      .execute();

    const result = await createSkill(testInput);

    // Query using proper drizzle syntax
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, result.id))
      .execute();

    expect(skills).toHaveLength(1);
    expect(skills[0].expert_id).toEqual(1);
    expect(skills[0].skill_name).toEqual('JavaScript');
    expect(skills[0].proficiency_level).toEqual('advanced');
    expect(skills[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when expert does not exist', async () => {
    await expect(createSkill(testInput)).rejects.toThrow(/expert with id 1 not found/i);
  });

  it('should prevent duplicate skills for the same expert', async () => {
    // Create prerequisite expert
    await db.insert(expertsTable)
      .values({
        full_name: 'Test Expert',
        place_of_birth: 'Test City',
        date_of_birth: '1990-01-01',
        address: 'Test Address',
        email: 'test@example.com',
        phone_number: '123456789'
      })
      .execute();

    // Create first skill
    await createSkill(testInput);

    // Try to create duplicate skill
    await expect(createSkill(testInput)).rejects.toThrow(/skill "JavaScript" already exists for expert 1/i);
  });

  it('should allow same skill name for different experts', async () => {
    // Create two experts
    await db.insert(expertsTable)
      .values([
        {
          full_name: 'Test Expert 1',
          place_of_birth: 'Test City',
          date_of_birth: '1990-01-01',
          address: 'Test Address',
          email: 'test1@example.com',
          phone_number: '123456789'
        },
        {
          full_name: 'Test Expert 2',
          place_of_birth: 'Test City',
          date_of_birth: '1990-01-01',
          address: 'Test Address',
          email: 'test2@example.com',
          phone_number: '987654321'
        }
      ])
      .execute();

    // Create same skill for first expert
    const result1 = await createSkill(testInput);

    // Create same skill for second expert
    const input2: CreateSkillInput = { ...testInput, expert_id: 2 };
    const result2 = await createSkill(input2);

    expect(result1.expert_id).toEqual(1);
    expect(result2.expert_id).toEqual(2);
    expect(result1.skill_name).toEqual(result2.skill_name);

    // Verify both records exist in database
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.skill_name, 'JavaScript'))
      .execute();

    expect(skills).toHaveLength(2);
  });

  it('should allow different skills for the same expert', async () => {
    // Create prerequisite expert
    await db.insert(expertsTable)
      .values({
        full_name: 'Test Expert',
        place_of_birth: 'Test City',
        date_of_birth: '1990-01-01',
        address: 'Test Address',
        email: 'test@example.com',
        phone_number: '123456789'
      })
      .execute();

    // Create first skill
    const result1 = await createSkill(testInput);

    // Create different skill for same expert
    const input2: CreateSkillInput = {
      expert_id: 1,
      skill_name: 'Python',
      proficiency_level: 'intermediate'
    };
    const result2 = await createSkill(input2);

    expect(result1.expert_id).toEqual(result2.expert_id);
    expect(result1.skill_name).toEqual('JavaScript');
    expect(result2.skill_name).toEqual('Python');

    // Verify both records exist in database
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.expert_id, 1))
      .execute();

    expect(skills).toHaveLength(2);
  });
});

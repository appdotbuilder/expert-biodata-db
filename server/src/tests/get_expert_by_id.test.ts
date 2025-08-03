
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { getExpertById } from '../handlers/get_expert_by_id';

// Test expert data
const testExpert = {
  full_name: 'John Doe',
  place_of_birth: 'Jakarta',
  date_of_birth: '1990-01-15',
  address: '123 Main Street, Jakarta',
  email: 'john.doe@example.com',
  phone_number: '+62-123-456-7890'
};

describe('getExpertById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return expert when found', async () => {
    // Create test expert
    const insertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();

    const createdExpert = insertResult[0];

    // Test retrieval
    const result = await getExpertById(createdExpert.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdExpert.id);
    expect(result!.full_name).toEqual('John Doe');
    expect(result!.place_of_birth).toEqual('Jakarta');
    expect(result!.date_of_birth).toBeInstanceOf(Date);
    expect(result!.date_of_birth.getFullYear()).toEqual(1990);
    expect(result!.address).toEqual('123 Main Street, Jakarta');
    expect(result!.email).toEqual('john.doe@example.com');
    expect(result!.phone_number).toEqual('+62-123-456-7890');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when expert not found', async () => {
    const result = await getExpertById(999);

    expect(result).toBeNull();
  });

  it('should handle database query correctly', async () => {
    // Create multiple experts
    const expert1 = await db.insert(expertsTable)
      .values({
        ...testExpert,
        full_name: 'Expert One',
        email: 'expert1@example.com'
      })
      .returning()
      .execute();

    const expert2 = await db.insert(expertsTable)
      .values({
        ...testExpert,
        full_name: 'Expert Two',
        email: 'expert2@example.com'
      })
      .returning()
      .execute();

    // Test that we get the correct expert
    const result = await getExpertById(expert2[0].id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(expert2[0].id);
    expect(result!.full_name).toEqual('Expert Two');
    expect(result!.email).toEqual('expert2@example.com');
  });
});

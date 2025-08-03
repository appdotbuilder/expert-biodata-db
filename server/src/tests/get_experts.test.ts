
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { getExperts } from '../handlers/get_experts';

// Test data - dates as strings for database insertion
const testExpert1 = {
  full_name: 'John Doe',
  place_of_birth: 'New York',
  date_of_birth: '1985-06-15',
  address: '123 Main St, New York, NY',
  email: 'john.doe@example.com',
  phone_number: '+1-555-0123'
};

const testExpert2 = {
  full_name: 'Jane Smith',
  place_of_birth: 'Los Angeles',
  date_of_birth: '1990-03-22',
  address: '456 Oak Ave, Los Angeles, CA',
  email: 'jane.smith@example.com',
  phone_number: '+1-555-0456'
};

describe('getExperts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no experts exist', async () => {
    const result = await getExperts();

    expect(result).toEqual([]);
  });

  it('should return all experts', async () => {
    // Create test experts
    await db.insert(expertsTable)
      .values([testExpert1, testExpert2])
      .execute();

    const result = await getExperts();

    expect(result).toHaveLength(2);
    
    // Verify first expert
    const expert1 = result.find(e => e.full_name === 'John Doe');
    expect(expert1).toBeDefined();
    expect(expert1!.place_of_birth).toEqual('New York');
    expect(expert1!.email).toEqual('john.doe@example.com');
    expect(expert1!.phone_number).toEqual('+1-555-0123');
    expect(expert1!.id).toBeDefined();
    expect(expert1!.created_at).toBeInstanceOf(Date);
    expect(expert1!.updated_at).toBeInstanceOf(Date);

    // Verify second expert
    const expert2 = result.find(e => e.full_name === 'Jane Smith');
    expect(expert2).toBeDefined();
    expect(expert2!.place_of_birth).toEqual('Los Angeles');
    expect(expert2!.email).toEqual('jane.smith@example.com');
    expect(expert2!.phone_number).toEqual('+1-555-0456');
    expect(expert2!.id).toBeDefined();
    expect(expert2!.created_at).toBeInstanceOf(Date);
    expect(expert2!.updated_at).toBeInstanceOf(Date);
  });

  it('should return experts with correct date types', async () => {
    await db.insert(expertsTable)
      .values(testExpert1)
      .execute();

    const result = await getExperts();

    expect(result).toHaveLength(1);
    expect(result[0].date_of_birth).toBeInstanceOf(Date);
    expect(result[0].date_of_birth.getFullYear()).toEqual(1985);
    expect(result[0].date_of_birth.getMonth()).toEqual(5); // June is month 5 (0-indexed)
    expect(result[0].date_of_birth.getDate()).toEqual(15);
  });

  it('should handle multiple experts with different dates', async () => {
    await db.insert(expertsTable)
      .values([testExpert1, testExpert2])
      .execute();

    const result = await getExperts();

    expect(result).toHaveLength(2);
    
    // Verify dates are preserved correctly
    const expert1 = result.find(e => e.full_name === 'John Doe');
    const expert2 = result.find(e => e.full_name === 'Jane Smith');
    
    expect(expert1!.date_of_birth.getFullYear()).toEqual(1985);
    expect(expert2!.date_of_birth.getFullYear()).toEqual(1990);
  });
});

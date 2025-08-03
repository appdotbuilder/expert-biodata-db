
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { type UpdateExpertInput, type CreateExpertInput } from '../schema';
import { updateExpert } from '../handlers/update_expert';
import { eq } from 'drizzle-orm';

// Helper to create a test expert
const createTestExpert = async (): Promise<number> => {
  const testExpert = {
    full_name: 'John Doe',
    place_of_birth: 'New York',
    date_of_birth: '1990-01-01', // String format for database
    address: '123 Main St',
    email: 'john.doe@example.com',
    phone_number: '+1234567890'
  };

  const result = await db.insert(expertsTable)
    .values(testExpert)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateExpert', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update expert with all fields', async () => {
    const expertId = await createTestExpert();

    const updateInput: UpdateExpertInput = {
      id: expertId,
      full_name: 'Jane Smith',
      place_of_birth: 'Los Angeles',
      date_of_birth: new Date('1985-05-15'),
      address: '456 Oak Ave',
      email: 'jane.smith@example.com',
      phone_number: '+9876543210'
    };

    const result = await updateExpert(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(expertId);
    expect(result!.full_name).toEqual('Jane Smith');
    expect(result!.place_of_birth).toEqual('Los Angeles');
    expect(result!.date_of_birth).toEqual(new Date('1985-05-15'));
    expect(result!.address).toEqual('456 Oak Ave');
    expect(result!.email).toEqual('jane.smith@example.com');
    expect(result!.phone_number).toEqual('+9876543210');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update expert with partial fields', async () => {
    const expertId = await createTestExpert();

    const updateInput: UpdateExpertInput = {
      id: expertId,
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com'
    };

    const result = await updateExpert(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(expertId);
    expect(result!.full_name).toEqual('Jane Smith');
    expect(result!.email).toEqual('jane.smith@example.com');
    // Original values should remain unchanged
    expect(result!.place_of_birth).toEqual('New York');
    expect(result!.address).toEqual('123 Main St');
    expect(result!.phone_number).toEqual('+1234567890');
    expect(result!.date_of_birth).toEqual(new Date('1990-01-01'));
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated expert to database', async () => {
    const expertId = await createTestExpert();

    const updateInput: UpdateExpertInput = {
      id: expertId,
      full_name: 'Updated Name',
      email: 'updated@example.com'
    };

    await updateExpert(updateInput);

    // Verify changes were persisted
    const experts = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, expertId))
      .execute();

    expect(experts).toHaveLength(1);
    expect(experts[0].full_name).toEqual('Updated Name');
    expect(experts[0].email).toEqual('updated@example.com');
    expect(experts[0].place_of_birth).toEqual('New York'); // Unchanged
    expect(experts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent expert', async () => {
    const updateInput: UpdateExpertInput = {
      id: 999,
      full_name: 'Non-existent Expert'
    };

    const result = await updateExpert(updateInput);

    expect(result).toBeNull();
  });

  it('should handle update with no fields to change', async () => {
    const expertId = await createTestExpert();

    const updateInput: UpdateExpertInput = {
      id: expertId
    };

    const result = await updateExpert(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(expertId);
    expect(result!.full_name).toEqual('John Doe');
    expect(result!.email).toEqual('john.doe@example.com');
    expect(result!.date_of_birth).toEqual(new Date('1990-01-01'));
  });

  it('should update the updated_at timestamp', async () => {
    const expertId = await createTestExpert();

    // Get original timestamp
    const originalExpert = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, expertId))
      .execute();

    const originalUpdatedAt = originalExpert[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateExpertInput = {
      id: expertId,
      full_name: 'Updated Name'
    };

    const result = await updateExpert(updateInput);

    expect(result).not.toBeNull();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should update date_of_birth correctly', async () => {
    const expertId = await createTestExpert();

    const newBirthDate = new Date('1988-12-25');
    const updateInput: UpdateExpertInput = {
      id: expertId,
      date_of_birth: newBirthDate
    };

    const result = await updateExpert(updateInput);

    expect(result).not.toBeNull();
    expect(result!.date_of_birth).toEqual(newBirthDate);

    // Verify in database
    const experts = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, expertId))
      .execute();

    expect(experts[0].date_of_birth).toEqual('1988-12-25'); // Database stores as string
  });
});

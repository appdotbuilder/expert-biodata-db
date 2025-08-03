
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { type CreateExpertInput } from '../schema';
import { createExpert } from '../handlers/create_expert';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateExpertInput = {
  full_name: 'John Doe',
  place_of_birth: 'New York',
  date_of_birth: new Date('1990-01-15'),
  address: '123 Main Street, New York, NY 10001',
  email: 'john.doe@example.com',
  phone_number: '+1-555-0123'
};

describe('createExpert', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an expert', async () => {
    const result = await createExpert(testInput);

    // Basic field validation
    expect(result.full_name).toEqual('John Doe');
    expect(result.place_of_birth).toEqual('New York');
    expect(result.date_of_birth).toEqual(new Date('1990-01-15'));
    expect(result.address).toEqual('123 Main Street, New York, NY 10001');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.phone_number).toEqual('+1-555-0123');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save expert to database', async () => {
    const result = await createExpert(testInput);

    // Query using proper drizzle syntax
    const experts = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, result.id))
      .execute();

    expect(experts).toHaveLength(1);
    expect(experts[0].full_name).toEqual('John Doe');
    expect(experts[0].place_of_birth).toEqual('New York');
    expect(new Date(experts[0].date_of_birth)).toEqual(new Date('1990-01-15'));
    expect(experts[0].address).toEqual('123 Main Street, New York, NY 10001');
    expect(experts[0].email).toEqual('john.doe@example.com');
    expect(experts[0].phone_number).toEqual('+1-555-0123');
    expect(experts[0].created_at).toBeInstanceOf(Date);
    expect(experts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle different date formats correctly', async () => {
    const inputWithDifferentDate: CreateExpertInput = {
      ...testInput,
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      date_of_birth: new Date('1985-12-25')
    };

    const result = await createExpert(inputWithDifferentDate);

    expect(result.date_of_birth).toEqual(new Date('1985-12-25'));
    expect(result.date_of_birth).toBeInstanceOf(Date);

    // Verify in database
    const experts = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, result.id))
      .execute();

    expect(new Date(experts[0].date_of_birth)).toEqual(new Date('1985-12-25'));
  });

  it('should create multiple experts with unique IDs', async () => {
    const input1 = { ...testInput, full_name: 'Expert One', email: 'expert1@example.com' };
    const input2 = { ...testInput, full_name: 'Expert Two', email: 'expert2@example.com' };

    const result1 = await createExpert(input1);
    const result2 = await createExpert(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.full_name).toEqual('Expert One');
    expect(result2.full_name).toEqual('Expert Two');

    // Verify both are in database
    const allExperts = await db.select()
      .from(expertsTable)
      .execute();

    expect(allExperts).toHaveLength(2);
  });

  it('should handle date conversion properly', async () => {
    const testDate = new Date('1992-06-30');
    const inputWithDate: CreateExpertInput = {
      ...testInput,
      full_name: 'Date Test Expert',
      email: 'datetest@example.com',
      date_of_birth: testDate
    };

    const result = await createExpert(inputWithDate);

    // Check that the returned date is still a Date object and matches input
    expect(result.date_of_birth).toBeInstanceOf(Date);
    expect(result.date_of_birth.getTime()).toEqual(testDate.getTime());

    // Verify date was stored correctly in database
    const experts = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, result.id))
      .execute();

    const storedDate = new Date(experts[0].date_of_birth);
    expect(storedDate.getTime()).toEqual(testDate.getTime());
  });
});

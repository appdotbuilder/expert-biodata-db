
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expertsTable, skillsTable, educationTable, workExperienceTable } from '../db/schema';
import { type ExpertSearchInput } from '../schema';
import { searchExperts } from '../handlers/search_experts';

// Test data - note: date_of_birth needs to be string for database insertion
const testExpert1 = {
  full_name: 'John Smith',
  place_of_birth: 'New York',
  date_of_birth: '1985-05-15', // String format for DB
  address: '123 Main St, NYC',
  email: 'john.smith@example.com',
  phone_number: '+1-555-0123'
};

const testExpert2 = {
  full_name: 'Jane Doe',
  place_of_birth: 'California',
  date_of_birth: '1990-08-20', // String format for DB
  address: '456 Oak Ave, LA',
  email: 'jane.doe@example.com',
  phone_number: '+1-555-0456'
};

const testExpert3 = {
  full_name: 'Bob Johnson',
  place_of_birth: 'Texas',
  date_of_birth: '1980-12-10', // String format for DB
  address: '789 Pine Rd, Austin',
  email: 'bob.johnson@example.com',
  phone_number: '+1-555-0789'
};

describe('searchExperts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all experts with default pagination', async () => {
    // Create test experts
    await db.insert(expertsTable).values([testExpert1, testExpert2, testExpert3]).execute();

    const searchInput: ExpertSearchInput = {
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(3);
    expect(results[0].full_name).toBeDefined();
    expect(results[0].email).toBeDefined();
    expect(results[0].created_at).toBeInstanceOf(Date);
    expect(results[0].date_of_birth).toBeInstanceOf(Date); // Should be converted to Date
  });

  it('should search experts by name', async () => {
    // Create test experts
    await db.insert(expertsTable).values([testExpert1, testExpert2, testExpert3]).execute();

    const searchInput: ExpertSearchInput = {
      search_term: 'John',
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(2); // John Smith and Bob Johnson
    const names = results.map(r => r.full_name);
    expect(names).toContain('John Smith');
    expect(names).toContain('Bob Johnson');
  });

  it('should search experts by skills', async () => {
    // Create test experts
    const experts = await db.insert(expertsTable)
      .values([testExpert1, testExpert2])
      .returning()
      .execute();

    // Add skills
    await db.insert(skillsTable).values([
      {
        expert_id: experts[0].id,
        skill_name: 'JavaScript',
        proficiency_level: 'advanced'
      },
      {
        expert_id: experts[1].id,
        skill_name: 'Python',
        proficiency_level: 'expert'
      }
    ]).execute();

    const searchInput: ExpertSearchInput = {
      search_term: 'JavaScript',
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(1);
    expect(results[0].full_name).toBe('John Smith');
  });

  it('should filter experts by specific skills', async () => {
    // Create test experts
    const experts = await db.insert(expertsTable)
      .values([testExpert1, testExpert2, testExpert3])
      .returning()
      .execute();

    // Add skills
    await db.insert(skillsTable).values([
      {
        expert_id: experts[0].id,
        skill_name: 'React',
        proficiency_level: 'advanced'
      },
      {
        expert_id: experts[1].id,
        skill_name: 'Vue.js',
        proficiency_level: 'intermediate'
      },
      {
        expert_id: experts[2].id,
        skill_name: 'React',
        proficiency_level: 'expert'
      }
    ]).execute();

    const searchInput: ExpertSearchInput = {
      skills: ['React'],
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(2);
    const names = results.map(r => r.full_name);
    expect(names).toContain('John Smith');
    expect(names).toContain('Bob Johnson');
  });

  it('should filter experts by education level', async () => {
    // Create test experts
    const experts = await db.insert(expertsTable)
      .values([testExpert1, testExpert2])
      .returning()
      .execute();

    // Add education records
    await db.insert(educationTable).values([
      {
        expert_id: experts[0].id,
        level: 'Bachelor',
        major: 'Computer Science',
        institution: 'MIT',
        graduation_year: 2007
      },
      {
        expert_id: experts[1].id,
        level: 'Master',
        major: 'Software Engineering',
        institution: 'Stanford',
        graduation_year: 2014
      }
    ]).execute();

    const searchInput: ExpertSearchInput = {
      education_level: 'Master',
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(1);
    expect(results[0].full_name).toBe('Jane Doe');
  });

  it('should filter experts by minimum years of experience', async () => {
    // Create test experts
    const experts = await db.insert(expertsTable)
      .values([testExpert1, testExpert2])
      .returning()
      .execute();

    // Add work experience (John has more experience)
    await db.insert(workExperienceTable).values([
      {
        expert_id: experts[0].id,
        company_name: 'Tech Corp',
        position: 'Senior Developer',
        start_date: '2010-01-01', // String format for DB
        end_date: '2020-12-31',   // String format for DB
        job_description: 'Led development team'
      },
      {
        expert_id: experts[1].id,
        company_name: 'StartupXYZ',
        position: 'Junior Developer',
        start_date: '2020-01-01', // String format for DB
        end_date: null,
        job_description: 'Frontend development'
      }
    ]).execute();

    const searchInput: ExpertSearchInput = {
      experience_years_min: 10,
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(1);
    expect(results[0].full_name).toBe('John Smith');
  });

  it('should search in education and work experience fields', async () => {
    // Create test expert
    const experts = await db.insert(expertsTable)
      .values([testExpert1])
      .returning()
      .execute();

    // Add education and work experience
    await db.insert(educationTable).values([
      {
        expert_id: experts[0].id,
        level: 'Bachelor',
        major: 'Computer Science',
        institution: 'MIT',
        graduation_year: 2007
      }
    ]).execute();

    await db.insert(workExperienceTable).values([
      {
        expert_id: experts[0].id,
        company_name: 'Google',
        position: 'Software Engineer',
        start_date: '2015-01-01', // String format for DB
        end_date: null,
        job_description: 'Machine learning development'
      }
    ]).execute();

    const searchInput: ExpertSearchInput = {
      search_term: 'MIT',
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(1);
    expect(results[0].full_name).toBe('John Smith');
  });

  it('should apply pagination correctly', async () => {
    // Create test experts
    await db.insert(expertsTable).values([testExpert1, testExpert2, testExpert3]).execute();

    // Test first page
    const searchInput1: ExpertSearchInput = {
      limit: 2,
      offset: 0
    };

    const results1 = await searchExperts(searchInput1);
    expect(results1).toHaveLength(2);

    // Test second page
    const searchInput2: ExpertSearchInput = {
      limit: 2,
      offset: 2
    };

    const results2 = await searchExperts(searchInput2);
    expect(results2).toHaveLength(1);

    // Ensure no overlap
    const ids1 = results1.map(r => r.id);
    const ids2 = results2.map(r => r.id);
    expect(ids1.some(id => ids2.includes(id))).toBe(false);
  });

  it('should handle multiple skills filter', async () => {
    // Create test experts
    const experts = await db.insert(expertsTable)
      .values([testExpert1, testExpert2, testExpert3])
      .returning()
      .execute();

    // Add skills - only expert 1 has both React and Node.js
    await db.insert(skillsTable).values([
      {
        expert_id: experts[0].id,
        skill_name: 'React',
        proficiency_level: 'advanced'
      },
      {
        expert_id: experts[0].id,
        skill_name: 'Node.js',
        proficiency_level: 'advanced'
      },
      {
        expert_id: experts[1].id,
        skill_name: 'React',
        proficiency_level: 'intermediate'
      },
      {
        expert_id: experts[2].id,
        skill_name: 'Node.js',
        proficiency_level: 'expert'
      }
    ]).execute();

    const searchInput: ExpertSearchInput = {
      skills: ['React', 'Node.js'],
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(1);
    expect(results[0].full_name).toBe('John Smith');
  });

  it('should return empty array when no matches found', async () => {
    // Create test expert
    await db.insert(expertsTable).values([testExpert1]).execute();

    const searchInput: ExpertSearchInput = {
      search_term: 'NonExistentName',
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(0);
  });

  it('should handle combined filters correctly', async () => {
    // Create test expert
    const experts = await db.insert(expertsTable)
      .values([testExpert1, testExpert2])
      .returning()
      .execute();

    // Add comprehensive data
    await db.insert(skillsTable).values([
      {
        expert_id: experts[0].id,
        skill_name: 'React',
        proficiency_level: 'advanced'
      }
    ]).execute();

    await db.insert(educationTable).values([
      {
        expert_id: experts[0].id,
        level: 'Master',
        major: 'Computer Science',
        institution: 'MIT',
        graduation_year: 2007
      }
    ]).execute();

    const searchInput: ExpertSearchInput = {
      search_term: 'John',
      skills: ['React'],
      education_level: 'Master',
      limit: 20,
      offset: 0
    };

    const results = await searchExperts(searchInput);

    expect(results).toHaveLength(1);
    expect(results[0].full_name).toBe('John Smith');
  });
});


import { serial, text, pgTable, timestamp, integer, date, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);
export const proficiencyLevelEnum = pgEnum('proficiency_level', ['beginner', 'intermediate', 'advanced', 'expert']);
export const documentTypeEnum = pgEnum('document_type', ['cv', 'certificate', 'portfolio', 'other']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Experts table
export const expertsTable = pgTable('experts', {
  id: serial('id').primaryKey(),
  full_name: text('full_name').notNull(),
  place_of_birth: text('place_of_birth').notNull(),
  date_of_birth: date('date_of_birth').notNull(),
  address: text('address').notNull(),
  email: text('email').notNull(),
  phone_number: text('phone_number').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Education table
export const educationTable = pgTable('education', {
  id: serial('id').primaryKey(),
  expert_id: integer('expert_id').notNull().references(() => expertsTable.id, { onDelete: 'cascade' }),
  level: text('level').notNull(),
  major: text('major').notNull(),
  institution: text('institution').notNull(),
  graduation_year: integer('graduation_year').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Work Experience table
export const workExperienceTable = pgTable('work_experience', {
  id: serial('id').primaryKey(),
  expert_id: integer('expert_id').notNull().references(() => expertsTable.id, { onDelete: 'cascade' }),
  company_name: text('company_name').notNull(),
  position: text('position').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date'),
  job_description: text('job_description').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Skills table
export const skillsTable = pgTable('skills', {
  id: serial('id').primaryKey(),
  expert_id: integer('expert_id').notNull().references(() => expertsTable.id, { onDelete: 'cascade' }),
  skill_name: text('skill_name').notNull(),
  proficiency_level: proficiencyLevelEnum('proficiency_level').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Certifications table
export const certificationsTable = pgTable('certifications', {
  id: serial('id').primaryKey(),
  expert_id: integer('expert_id').notNull().references(() => expertsTable.id, { onDelete: 'cascade' }),
  certification_name: text('certification_name').notNull(),
  issuing_body: text('issuing_body').notNull(),
  year_obtained: integer('year_obtained').notNull(),
  expiry_date: date('expiry_date'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Projects table
export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  expert_id: integer('expert_id').notNull().references(() => expertsTable.id, { onDelete: 'cascade' }),
  project_name: text('project_name').notNull(),
  role_in_project: text('role_in_project').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date'),
  description: text('description').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Documents table
export const documentsTable = pgTable('documents', {
  id: serial('id').primaryKey(),
  expert_id: integer('expert_id').notNull().references(() => expertsTable.id, { onDelete: 'cascade' }),
  document_name: text('document_name').notNull(),
  document_type: documentTypeEnum('document_type').notNull(),
  file_path: text('file_path').notNull(),
  file_size: integer('file_size').notNull(),
  mime_type: text('mime_type').notNull(),
  uploaded_at: timestamp('uploaded_at').defaultNow().notNull()
});

// Relations
export const expertsRelations = relations(expertsTable, ({ many }) => ({
  education: many(educationTable),
  workExperience: many(workExperienceTable),
  skills: many(skillsTable),
  certifications: many(certificationsTable),
  projects: many(projectsTable),
  documents: many(documentsTable)
}));

export const educationRelations = relations(educationTable, ({ one }) => ({
  expert: one(expertsTable, {
    fields: [educationTable.expert_id],
    references: [expertsTable.id]
  })
}));

export const workExperienceRelations = relations(workExperienceTable, ({ one }) => ({
  expert: one(expertsTable, {
    fields: [workExperienceTable.expert_id],
    references: [expertsTable.id]
  })
}));

export const skillsRelations = relations(skillsTable, ({ one }) => ({
  expert: one(expertsTable, {
    fields: [skillsTable.expert_id],
    references: [expertsTable.id]
  })
}));

export const certificationsRelations = relations(certificationsTable, ({ one }) => ({
  expert: one(expertsTable, {
    fields: [certificationsTable.expert_id],
    references: [expertsTable.id]
  })
}));

export const projectsRelations = relations(projectsTable, ({ one }) => ({
  expert: one(expertsTable, {
    fields: [projectsTable.expert_id],
    references: [expertsTable.id]
  })
}));

export const documentsRelations = relations(documentsTable, ({ one }) => ({
  expert: one(expertsTable, {
    fields: [documentsTable.expert_id],
    references: [expertsTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  experts: expertsTable,
  education: educationTable,
  workExperience: workExperienceTable,
  skills: skillsTable,
  certifications: certificationsTable,
  projects: projectsTable,
  documents: documentsTable
};

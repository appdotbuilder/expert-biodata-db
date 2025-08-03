
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  role: z.enum(['admin', 'user']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Expert schema
export const expertSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  place_of_birth: z.string(),
  date_of_birth: z.coerce.date(),
  address: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Expert = z.infer<typeof expertSchema>;

// Education schema
export const educationSchema = z.object({
  id: z.number(),
  expert_id: z.number(),
  level: z.string(),
  major: z.string(),
  institution: z.string(),
  graduation_year: z.number().int(),
  created_at: z.coerce.date()
});

export type Education = z.infer<typeof educationSchema>;

// Work Experience schema
export const workExperienceSchema = z.object({
  id: z.number(),
  expert_id: z.number(),
  company_name: z.string(),
  position: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  job_description: z.string(),
  created_at: z.coerce.date()
});

export type WorkExperience = z.infer<typeof workExperienceSchema>;

// Skills schema
export const skillSchema = z.object({
  id: z.number(),
  expert_id: z.number(),
  skill_name: z.string(),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  created_at: z.coerce.date()
});

export type Skill = z.infer<typeof skillSchema>;

// Certification schema
export const certificationSchema = z.object({
  id: z.number(),
  expert_id: z.number(),
  certification_name: z.string(),
  issuing_body: z.string(),
  year_obtained: z.number().int(),
  expiry_date: z.coerce.date().nullable(),
  created_at: z.coerce.date()
});

export type Certification = z.infer<typeof certificationSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  expert_id: z.number(),
  project_name: z.string(),
  role_in_project: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  description: z.string(),
  created_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Document schema
export const documentSchema = z.object({
  id: z.number(),
  expert_id: z.number(),
  document_name: z.string(),
  document_type: z.enum(['cv', 'certificate', 'portfolio', 'other']),
  file_path: z.string(),
  file_size: z.number().int(),
  mime_type: z.string(),
  uploaded_at: z.coerce.date()
});

export type Document = z.infer<typeof documentSchema>;

// Input schemas for creating records
export const createExpertInputSchema = z.object({
  full_name: z.string().min(1),
  place_of_birth: z.string().min(1),
  date_of_birth: z.coerce.date(),
  address: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().min(1)
});

export type CreateExpertInput = z.infer<typeof createExpertInputSchema>;

export const createEducationInputSchema = z.object({
  expert_id: z.number(),
  level: z.string().min(1),
  major: z.string().min(1),
  institution: z.string().min(1),
  graduation_year: z.number().int().min(1900).max(new Date().getFullYear() + 10)
});

export type CreateEducationInput = z.infer<typeof createEducationInputSchema>;

export const createWorkExperienceInputSchema = z.object({
  expert_id: z.number(),
  company_name: z.string().min(1),
  position: z.string().min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  job_description: z.string().min(1)
});

export type CreateWorkExperienceInput = z.infer<typeof createWorkExperienceInputSchema>;

export const createSkillInputSchema = z.object({
  expert_id: z.number(),
  skill_name: z.string().min(1),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'])
});

export type CreateSkillInput = z.infer<typeof createSkillInputSchema>;

export const createCertificationInputSchema = z.object({
  expert_id: z.number(),
  certification_name: z.string().min(1),
  issuing_body: z.string().min(1),
  year_obtained: z.number().int().min(1900).max(new Date().getFullYear()),
  expiry_date: z.coerce.date().nullable()
});

export type CreateCertificationInput = z.infer<typeof createCertificationInputSchema>;

export const createProjectInputSchema = z.object({
  expert_id: z.number(),
  project_name: z.string().min(1),
  role_in_project: z.string().min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  description: z.string().min(1)
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const createDocumentInputSchema = z.object({
  expert_id: z.number(),
  document_name: z.string().min(1),
  document_type: z.enum(['cv', 'certificate', 'portfolio', 'other']),
  file_path: z.string().min(1),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1)
});

export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;

// Update schemas
export const updateExpertInputSchema = z.object({
  id: z.number(),
  full_name: z.string().min(1).optional(),
  place_of_birth: z.string().min(1).optional(),
  date_of_birth: z.coerce.date().optional(),
  address: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone_number: z.string().min(1).optional()
});

export type UpdateExpertInput = z.infer<typeof updateExpertInputSchema>;

// Search and filter schemas
export const expertSearchInputSchema = z.object({
  search_term: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education_level: z.string().optional(),
  experience_years_min: z.number().int().nonnegative().optional(),
  experience_years_max: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type ExpertSearchInput = z.infer<typeof expertSearchInputSchema>;

// Complete expert profile with all related data
export const expertProfileSchema = z.object({
  expert: expertSchema,
  education: z.array(educationSchema),
  work_experience: z.array(workExperienceSchema),
  skills: z.array(skillSchema),
  certifications: z.array(certificationSchema),
  projects: z.array(projectSchema),
  documents: z.array(documentSchema)
});

export type ExpertProfile = z.infer<typeof expertProfileSchema>;


import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createExpertInputSchema,
  createEducationInputSchema,
  createWorkExperienceInputSchema,
  createSkillInputSchema,
  createCertificationInputSchema,
  createProjectInputSchema,
  createDocumentInputSchema,
  updateExpertInputSchema,
  expertSearchInputSchema
} from './schema';

// Import handlers
import { createExpert } from './handlers/create_expert';
import { getExperts } from './handlers/get_experts';
import { getExpertById } from './handlers/get_expert_by_id';
import { getExpertProfile } from './handlers/get_expert_profile';
import { updateExpert } from './handlers/update_expert';
import { deleteExpert } from './handlers/delete_expert';
import { searchExperts } from './handlers/search_experts';
import { createEducation } from './handlers/create_education';
import { createWorkExperience } from './handlers/create_work_experience';
import { createSkill } from './handlers/create_skill';
import { createCertification } from './handlers/create_certification';
import { createProject } from './handlers/create_project';
import { createDocument } from './handlers/create_document';
import { getExpertDocuments } from './handlers/get_expert_documents';
import { deleteDocument } from './handlers/delete_document';
import { exportExpertData } from './handlers/export_expert_data';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Expert management
  createExpert: publicProcedure
    .input(createExpertInputSchema)
    .mutation(({ input }) => createExpert(input)),

  getExperts: publicProcedure
    .query(() => getExperts()),

  getExpertById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getExpertById(input.id)),

  getExpertProfile: publicProcedure
    .input(z.object({ expertId: z.number() }))
    .query(({ input }) => getExpertProfile(input.expertId)),

  updateExpert: publicProcedure
    .input(updateExpertInputSchema)
    .mutation(({ input }) => updateExpert(input)),

  deleteExpert: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteExpert(input.id)),

  searchExperts: publicProcedure
    .input(expertSearchInputSchema)
    .query(({ input }) => searchExperts(input)),

  // Education management
  createEducation: publicProcedure
    .input(createEducationInputSchema)
    .mutation(({ input }) => createEducation(input)),

  // Work experience management
  createWorkExperience: publicProcedure
    .input(createWorkExperienceInputSchema)
    .mutation(({ input }) => createWorkExperience(input)),

  // Skills management
  createSkill: publicProcedure
    .input(createSkillInputSchema)
    .mutation(({ input }) => createSkill(input)),

  // Certifications management
  createCertification: publicProcedure
    .input(createCertificationInputSchema)
    .mutation(({ input }) => createCertification(input)),

  // Projects management
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),

  // Document management
  createDocument: publicProcedure
    .input(createDocumentInputSchema)
    .mutation(({ input }) => createDocument(input)),

  getExpertDocuments: publicProcedure
    .input(z.object({ expertId: z.number() }))
    .query(({ input }) => getExpertDocuments(input.expertId)),

  deleteDocument: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteDocument(input.id)),

  // Data export
  exportExpertData: publicProcedure
    .input(z.object({ 
      expertId: z.number(), 
      format: z.enum(['json', 'pdf']) 
    }))
    .query(({ input }) => exportExpertData(input.expertId, input.format)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();

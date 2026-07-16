import { z } from 'zod';

const urlOrEmpty = z.union([
  z.string().url('Must be a valid URL'),
  z.literal(''),
]).optional();

// ─── Update profile ───────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string().min(2).max(60).trim().optional(),
    bio: z
      .string().max(500).trim().optional(),
    location: z
      .string().max(100).trim().optional(),
    website: urlOrEmpty,
    pronouns: z
      .string().max(30).trim().optional(),
    openToWork: z
      .boolean().optional(),
    availability: z
      .enum(['full-time', 'part-time', 'freelance', 'not-available']).optional(),
    yearsOfExperience: z
      .number().int().min(0).max(50).optional(),
    skills: z
      .array(z.string().min(1).max(50).toLowerCase().trim())
      .max(30, 'Maximum 30 skills')
      .optional(),
    techStack: z
      .array(z.string().min(1).max(50).trim())
      .max(30, 'Maximum 30 tech stack items')
      .optional(),
    githubUrl:    urlOrEmpty,
    linkedinUrl:  urlOrEmpty,
    twitterUrl:   urlOrEmpty,
    portfolioUrl: urlOrEmpty,
  }).strict(),
});

// ─── Add / update education entry ─────────────────────────────────────────────
export const educationSchema = z.object({
  body: z.object({
    school:      z.string().min(1).max(100).trim(),
    degree:      z.string().min(1).max(80).trim(),
    field:       z.string().min(1).max(80).trim(),
    startYear:   z.number().int().min(1950).max(new Date().getFullYear()),
    endYear:     z.number().int().min(1950).max(2100).optional(),
    current:     z.boolean().default(false),
    description: z.string().max(500).trim().optional(),
  }).refine(
    (d) => d.current || (d.endYear !== undefined && d.endYear >= d.startYear),
    { message: 'End year must be after start year, or mark as current', path: ['endYear'] },
  ),
});

// ─── Add / update experience entry ────────────────────────────────────────────
export const experienceSchema = z.object({
  body: z.object({
    company:     z.string().min(1).max(100).trim(),
    role:        z.string().min(1).max(100).trim(),
    location:    z.string().max(100).trim().optional(),
    startMonth:  z.number().int().min(1).max(12),
    startYear:   z.number().int().min(1950).max(new Date().getFullYear()),
    endMonth:    z.number().int().min(1).max(12).optional(),
    endYear:     z.number().int().min(1950).max(2100).optional(),
    current:     z.boolean().default(false),
    description: z.string().max(1000).trim().optional(),
    techUsed:    z.array(z.string().trim()).max(20).default([]),
  }).refine(
    (d) => d.current || (d.endYear !== undefined),
    { message: 'Provide an end date, or mark as current', path: ['endYear'] },
  ),
});

// ─── Change password (authenticated) ──────────────────────────────────────────
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  }).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

// ─── Entry ID param ────────────────────────────────────────────────────────────
export const entryIdSchema = z.object({
  params: z.object({
    entryId: z.string().length(24, 'Invalid ID'),
  }),
});

// ─── Username param ────────────────────────────────────────────────────────────
export const usernameParamSchema = z.object({
  params: z.object({
    username: z.string().min(3).max(30).toLowerCase().trim(),
  }),
});

export type UpdateProfileInput  = z.infer<typeof updateProfileSchema>['body'];
export type EducationInput      = z.infer<typeof educationSchema>['body'];
export type ExperienceInput     = z.infer<typeof experienceSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];

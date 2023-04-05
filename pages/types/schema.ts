import z, { ZodSchema } from 'zod'

import { Role } from '@prisma/client' 
export const signUpSchema: ZodSchema =
    z.object({
        email: z.string(),
        password: z.string().min(5,"too short password"),
        name: z.string(),
        phoneNumber: z.string(),
        role:z.enum(["USER","ADMIN"])
        
    })
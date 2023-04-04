import z, { ZodSchema } from 'zod'

export  const signInSchema:ZodSchema<{email:string, password:string}> = 
z.object({
email: z.string(),
password: z.string()
})
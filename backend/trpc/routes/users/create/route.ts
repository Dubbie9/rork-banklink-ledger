import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { User } from '../../../../models/User';

export const createUserProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    name: z.string().min(1),
    country: z.string().optional(),
    dateOfBirth: z.date().optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      const user = new User(input);
      await user.save();
      return user;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  });
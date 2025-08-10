import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { User } from '../../../../models/User';

export const getUserProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
  }))
  .query(async ({ input }) => {
    const user = await User.findOne({ email: input.email });
    return user;
  });
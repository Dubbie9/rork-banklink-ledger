import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import mongoose from "mongoose";

// MongoDB connection
let isConnected = false;

const connectToMongoDB = async () => {
  if (isConnected) return;
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('MONGODB_URI not found in environment variables');
      return;
    }
    
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Ensure MongoDB connection
  await connectToMongoDB();
  
  return {
    req: opts.req,
    db: mongoose.connection,
    // You can add more context items here like auth, etc.
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
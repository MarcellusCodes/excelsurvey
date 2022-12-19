import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { pollRouter } from "./poll";

export const appRouter = router({
  example: exampleRouter,
  poll: pollRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

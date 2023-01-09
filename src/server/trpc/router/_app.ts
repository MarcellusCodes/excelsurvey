import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { pollRouter } from "./poll";
import { choiceRouter } from "./choice";

export const appRouter = router({
  example: exampleRouter,
  poll: pollRouter,
  choice: choiceRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

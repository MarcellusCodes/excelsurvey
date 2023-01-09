import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "../trpc";

export const choiceRouter = router({
  addVote: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.choice.update({
        where: { id: input.id },
        data: {
          votes: { increment: 1 },
        },
      });
    }),
});

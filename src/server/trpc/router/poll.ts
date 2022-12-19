import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "../trpc";

export const pollRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.poll.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        title: true,
        description: true,
        choices: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),
  addPoll: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.poll.create({
        data: {
          title: input.title,
          description: input.description,
          user: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),
});

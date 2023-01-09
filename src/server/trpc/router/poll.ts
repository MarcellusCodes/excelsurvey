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
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.poll.findUnique({
        where: { id: input?.id },
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
  addPoll: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        choices: z.array(z.object({ title: z.string() })),
      })
    )
    .mutation(({ ctx, input }) => {
      if (ctx.session !== null) {
        return ctx.prisma.poll.create({
          data: {
            title: input.title,
            description: input.description,
            user: {
              connect: { id: ctx.session?.user?.id },
            },
            choices: {
              create: input.choices,
            },
          },
        });
      }
      return ctx.prisma.poll.create({
        data: {
          title: input.title,
          description: input.description,
          user: {},
          choices: {
            create: input.choices,
          },
        },
      });
    }),
  deletePoll: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.poll.deleteMany({
        where: { id: input.id, userId: ctx.session?.user?.id },
      });
    }),
});

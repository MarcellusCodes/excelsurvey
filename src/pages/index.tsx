import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";

const pollSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z
    .string()
    .min(15, { message: "Please provider a short description of your poll" }),
  choices: z.array(
    z.object({
      title: z.string().min(1, {
        message: "Choice is required",
      }),
    })
  ),
});

interface AddPollProps {
  title: string;
  description: string;
  choices: { title: string }[];
}

const Home: NextPage = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { data: sessionData } = useSession();
  const polls = trpc.poll.getAll.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  });
  const {
    register,
    control,
    handleSubmit,

    formState: { errors },
  } = useForm<AddPollProps>({ resolver: zodResolver(pollSchema) });

  const { fields, prepend } = useFieldArray({
    name: "choices",
    control,
  });

  const addPoll = trpc.poll.addPoll.useMutation({
    onSuccess: async (context) => {
      router.push(`/polls/${context.id}`);
    },
  });

  const handleAddPoll = ({ title, description, choices }: AddPollProps) => {
    addPoll.mutate({
      title: title,
      description: description,
      choices: choices,
    });
  };

  const deletePoll = trpc.poll.deletePoll.useMutation({
    onSuccess: async () => {
      utils.poll.getAll.invalidate();
    },
  });

  const handleDeletePoll = ({ id }: { id: string }) => {
    deletePoll.mutate({
      id: id,
    });
  };

  return (
    <>
      <Head>
        <title>ExcelSurvey</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <AuthShowcase />
        <div className="flex flex-row flex-wrap items-center gap-6">
          {polls.data?.map((poll) => (
            <article key={poll.id} className="bg-purple-300 p-4">
              <h3>{poll.title}</h3>
              <p>{poll.description}</p>
              <Link className="bg-purple-600 p-2 " href={`/polls/${poll.id}`}>
                Go to
              </Link>
              <button
                onClick={() => {
                  handleDeletePoll({ id: poll.id });
                }}
              >
                Delete Poll
              </button>
            </article>
          ))}
        </div>
        <div className="mt-10" />
        <form
          onSubmit={handleSubmit((values) =>
            handleAddPoll({
              title: values.title,
              description: values.description,
              choices: values.choices,
            })
          )}
        >
          <div>
            <>
              <input {...register("title")} />
              {errors.title?.message}
              <textarea {...register("description")} />
              {errors.description?.message}
              <button type="button" onClick={() => prepend({ title: "" })}>
                Add Choice
              </button>
              <div className="flex flex-col items-start">
                {fields.map((field, index) => (
                  <div key={index}>
                    <input
                      key={field.id}
                      {...register(`choices.${index}.title` as const)}
                    />
                    {errors?.["choices"]?.[index]?.["title"]?.["message"]}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className={`rounded-full bg-purple-600 px-8 py-2 hover:bg-purple-400 active:bg-purple-700 ${
                  addPoll.isLoading && "bg-gray-400"
                } `}
                disabled={addPoll.isLoading}
              >
                Add Poll
              </button>
            </>
          </div>
        </form>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData?.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

export async function getServerSideProps({ req }) {
  console.log(req.headers);
  const ip = req.headers["x-real-ip"] || req.connection.remoteAddress;
  console.log(ip, "################## - IP");

  return {
    props: {
      ip,
    }, // will be passed to the page component as props
  };
}

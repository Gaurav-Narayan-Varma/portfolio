import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

export async function createTRPCContext(headers: Headers) {
  return { headers };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Custom TRPC error formatter for zod errors
 *
 * This is a custom error formatter that formats the error message so that
 * the error message can be accessed in the front end the same way that
 * a regular error message is.
 */
const t = initTRPC.context<TRPCContext>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;

    // Log all errors to console
    console.error("tRPC Error:", {
      code: error.code,
      path: shape.data.path,
      message: error.message,
      cause: error.cause,
    });

    if (error.code === "BAD_REQUEST" && error.cause instanceof ZodError) {
      /**
       * Get the first error message from the ZodError
       */
      const firstError = error.cause.errors[0];
      return {
        ...shape,
        message: firstError?.message || "Validation error",
        data: {
          ...shape.data,
          zodError: error.cause.flatten(),
        },
      };
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

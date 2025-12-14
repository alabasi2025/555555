import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { accountsRouter } from "./routers/accounts";
import { customersRouter } from "./routers/customers";
import { suppliersRouter } from "./routers/suppliers";
import { invoicesRouter } from "./routers/invoices";
import { paymentsRouter } from "./routers/payments";
import { inventoryRouter } from "./routers/inventory";
import { purchasesRouter } from "./routers/purchases";
import { reportsRouter } from "./routers/reports";
import { journalEntriesRouter } from "./routers/journalEntries";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feature routers
  accounts: accountsRouter,
  customers: customersRouter,
  suppliers: suppliersRouter,
  invoices: invoicesRouter,
  payments: paymentsRouter,
  inventory: inventoryRouter,
  purchases: purchasesRouter,
  reports: reportsRouter,
  journalEntries: journalEntriesRouter,
});

export type AppRouter = typeof appRouter;

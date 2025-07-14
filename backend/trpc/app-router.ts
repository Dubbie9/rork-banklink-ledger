import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { getAccessTokenProcedure, refreshTokenProcedure } from "./routes/gocardless/auth/route";
import { getInstitutionsProcedure } from "./routes/gocardless/institutions/route";
import { createRequisitionProcedure, getRequisitionProcedure, deleteRequisitionProcedure } from "./routes/gocardless/requisitions/route";
import { getAccountDetailsProcedure, getAccountBalancesProcedure, getAccountTransactionsProcedure } from "./routes/gocardless/accounts/route";
import { createAgreementProcedure, getAgreementProcedure, deleteAgreementProcedure } from "./routes/gocardless/agreements/route";
import { debugEnvProcedure } from "./routes/debug/env/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  debug: createTRPCRouter({
    env: debugEnvProcedure,
  }),
  gocardless: createTRPCRouter({
    auth: createTRPCRouter({
      getAccessToken: getAccessTokenProcedure,
      refreshToken: refreshTokenProcedure,
    }),
    institutions: createTRPCRouter({
      list: getInstitutionsProcedure,
    }),
    requisitions: createTRPCRouter({
      create: createRequisitionProcedure,
      get: getRequisitionProcedure,
      delete: deleteRequisitionProcedure,
    }),
    accounts: createTRPCRouter({
      details: getAccountDetailsProcedure,
      balances: getAccountBalancesProcedure,
      transactions: getAccountTransactionsProcedure,
    }),
    agreements: createTRPCRouter({
      create: createAgreementProcedure,
      get: getAgreementProcedure,
      delete: deleteAgreementProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;
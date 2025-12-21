import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import localAuth, { LocalUser } from "./localAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  localUser: LocalUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let localUser: LocalUser | null = null;

  // محاولة المصادقة المحلية أولاً
  try {
    localUser = await localAuth.authenticateRequest(opts.req);
    
    // إذا نجحت المصادقة المحلية، نحول المستخدم المحلي إلى تنسيق User للتوافق
    if (localUser) {
      user = {
        id: localUser.id,
        openId: `local-${localUser.id}`,
        name: localUser.name,
        email: localUser.email,
        loginMethod: "local",
        role: localUser.role as "user" | "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: localUser.lastLogin || new Date(),
      } as User;
    }
  } catch (error) {
    // المصادقة المحلية فشلت، نحاول OAuth
    localUser = null;
  }

  // إذا لم تنجح المصادقة المحلية، نحاول OAuth
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    localUser,
  };
}

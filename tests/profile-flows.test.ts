import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../server/_core/context";

vi.mock("../server/db", () => ({
  getProfileByUserId: vi.fn(),
  upsertProfile: vi.fn(),
  connectClientToDietitianByCode: vi.fn(),
  listPairedClientsForDietitian: vi.fn(),
  getPairedDietitianForClient: vi.fn(),
  listAppointmentsForUser: vi.fn(),
  listFoods: vi.fn(),
  listMeasurementsForClient: vi.fn(),
  listMealsForClient: vi.fn(),
  listFoodRulesForClient: vi.fn(),
}));

import { appRouter } from "../server/routers";
import * as db from "../server/db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("profile and pairing flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores the selected role and display name for the authenticated user", async () => {
    vi.mocked(db.upsertProfile).mockResolvedValue({
      id: 1,
      userId: 42,
      role: "dietitian",
      displayName: "Dyt. Ayşe Demir",
      inviteCode: "ABC123",
      bio: "Klinik beslenme",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Awaited<ReturnType<typeof db.upsertProfile>>);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.profile.setup({
      role: "dietitian",
      displayName: "Dyt. Ayşe Demir",
      bio: "Klinik beslenme",
    });

    expect(db.upsertProfile).toHaveBeenCalledWith({
      userId: 42,
      role: "dietitian",
      displayName: "Dyt. Ayşe Demir",
      bio: "Klinik beslenme",
    });
    expect(result).toMatchObject({
      userId: 42,
      role: "dietitian",
      displayName: "Dyt. Ayşe Demir",
    });
  });

  it("connects a client to a dietitian using a normalized invite code", async () => {
    vi.mocked(db.getProfileByUserId).mockResolvedValue({
      id: 10,
      userId: 42,
      role: "client",
      displayName: "Elif Kaya",
      inviteCode: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Awaited<ReturnType<typeof db.getProfileByUserId>>);
    vi.mocked(db.connectClientToDietitianByCode).mockResolvedValue({
      id: 99,
      clientUserId: 42,
      dietitianUserId: 7,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Awaited<ReturnType<typeof db.connectClientToDietitianByCode>>);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.pairing.connectByCode({ inviteCode: " ab12cd " });

    expect(db.getProfileByUserId).toHaveBeenCalledWith(42);
    expect(db.connectClientToDietitianByCode).toHaveBeenCalledWith(42, "AB12CD");
    expect(result).toMatchObject({
      clientUserId: 42,
      dietitianUserId: 7,
      status: "active",
    });
  });
});

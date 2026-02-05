import { NextResponse } from "next/server";
import type { InviteRecord } from "../route";
import { parseInviteToken } from "@/lib/inviteToken";

declare global {
  // eslint-disable-next-line no-var
  var __hdfcInvitesStore: Map<string, InviteRecord> | undefined;
}

function getStore(): Map<string, InviteRecord> {
  if (!globalThis.__hdfcInvitesStore) {
    globalThis.__hdfcInvitesStore = new Map<string, InviteRecord>();
  }
  return globalThis.__hdfcInvitesStore;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const { inviteId } = await params;

  // Vercel-safe stateless invites: decode token and return a record-like shape.
  const tokenPayload = parseInviteToken(inviteId);
  if (tokenPayload) {
    const record: InviteRecord = {
      id: tokenPayload.id,
      employee: tokenPayload.employee,
      journeyType: tokenPayload.journeyType,
      prefilledData: tokenPayload.prefilledData ?? {},
      status: "opened",
      createdAt: tokenPayload.issuedAt,
      lastUpdatedAt: new Date().toISOString(),
    };
    return NextResponse.json(record);
  }

  const record = getStore().get(inviteId);
  if (!record) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  // Mark as opened (idempotent)
  if (record.status === "sent") {
    const updated: InviteRecord = {
      ...record,
      status: "opened",
      lastUpdatedAt: new Date().toISOString(),
    };
    getStore().set(inviteId, updated);
    return NextResponse.json(updated);
  }

  return NextResponse.json(record);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const { inviteId } = await params;

  // Stateless token invites have no server-side persistence; accept PATCH as no-op.
  const tokenPayload = parseInviteToken(inviteId);
  if (tokenPayload) {
    return NextResponse.json({ ok: true });
  }

  const record = getStore().get(inviteId);
  if (!record) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as InviteRecord["status"] | undefined;
  if (!status) {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const updated: InviteRecord = {
    ...record,
    status,
    lastUpdatedAt: new Date().toISOString(),
  };
  getStore().set(inviteId, updated);

  return NextResponse.json(updated);
}


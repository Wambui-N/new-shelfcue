import { type NextRequest, NextResponse } from "next/server";

/** ShelfCue is free — form creation is always allowed. */
export async function GET(_request: NextRequest) {
  return NextResponse.json({ allowed: true });
}

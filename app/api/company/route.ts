import { NextResponse } from "next/server";
import { runPrecheck } from "@/lib/kyc/run-precheck";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const identifier = url.searchParams.get("identifier");

  if (!identifier) {
    return NextResponse.json({ error: "Missing identifier." }, { status: 400 });
  }

  const result = await runPrecheck(identifier);

  return NextResponse.json({
    company: result.company,
    identifier: result.identifier,
    sourcesChecked: result.sourcesChecked,
  });
}

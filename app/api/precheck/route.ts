import { NextResponse } from "next/server";
import { z } from "zod";
import { runPrecheck } from "@/lib/kyc/run-precheck";

const schema = z.object({
  identifier: z.string().min(1),
  locale: z.enum(["en", "fr"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await runPrecheck(body.identifier, { locale: body.locale });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid pre-check request.",
      },
      { status: 400 },
    );
  }
}

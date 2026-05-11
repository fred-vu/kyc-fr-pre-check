import { NextResponse } from "next/server";
import { z } from "zod";
import { validateIban } from "@/lib/kyc/iban-validation";

const schema = z.object({
  iban: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = validateIban(body.iban);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid IBAN validation request.",
      },
      { status: 400 },
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { validateVatNumber } from "@/lib/kyc/vat-validation";

const schema = z.object({
  vatNumber: z.string().min(1),
  companySiren: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await validateVatNumber(body.vatNumber, {
      companySiren: body.companySiren,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid VAT validation request.",
      },
      { status: 400 },
    );
  }
}

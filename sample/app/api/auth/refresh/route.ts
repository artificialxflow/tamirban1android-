import { NextRequest, NextResponse } from "next/server";

import { refreshAccessToken } from "@/lib/services/auth.service";
import { handleApiError, successResponse } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const refreshToken = body?.refreshToken as string;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token الزامی است.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }

    const tokenPair = await refreshAccessToken(refreshToken);

    return successResponse(tokenPair, "توکن با موفقیت تمدید شد.");
  } catch (error) {
    return handleApiError(error);
  }
}


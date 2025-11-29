import { verifyOtp } from "@/lib/services/otp.service";
import { handleApiError, successResponse } from "@/lib/utils/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = body?.phone as string;
    const code = body?.code as string;

    const result = await verifyOtp(phone, code);

    return successResponse(
      {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        refreshExpiresIn: result.refreshExpiresIn,
        user: result.user,
      },
      "ورود با موفقیت انجام شد.",
    );
  } catch (error) {
    return handleApiError(error);
  }
}

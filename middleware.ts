import { NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import jwt_decode from "jwt-decode";
export function middleware(request: NextRequest) {
  console.log(request.headers.get("authorization")?.split(" ")[1]);

  //get bearer token
  if (request.headers.get("authorization")?.split(" ")[1] === "null") {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "ว้าย ว้าย เข้าไม่ได้ ปล. Postman สวะมากอาจารย์ :)",
      }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  } else {
    const jwtToken = request.headers
      .get("authorization")
      ?.split(" ")[1] as string;
    console.log(jwt_decode(jwtToken));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/hitme", "/api/credentials/signout"],
};

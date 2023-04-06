import { NextApiResponse } from "next";

import { NextRequest, NextResponse } from "next/server";
import jwt_decode from "jwt-decode";

type UserToken = {
  email: string;
  id: number;
  role: string;
  iat: number;
  exp: number;
};

export function middleware(request: NextRequest) {
  console.log(request.nextUrl.pathname); //get path name
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/credentials")) {
    return NextResponse.next();
  } else {
    //check token, sign in or not?

    if (
      request.headers.get("authorization")?.split(" ")[1] === "null" ||
      !request.headers.get("authorization")?.split(" ")[1]
    ) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "ว้าย ว้าย เข้าไม่ได้ ปล. Postman สวะมากอาจารย์ :)",
        }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    } else {
      //signed in, decode jwt token
      const jwtToken = request.headers
        .get("authorization")
        ?.split(" ")[1] as string;
      console.log(jwt_decode(jwtToken));
      const jwtDecode = jwt_decode(jwtToken) as UserToken;

      if (pathname.startsWith("/api/admin")) {
        //User role can't enter admin route
        if (jwtDecode.role === "USER") {
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: "You shall not pass!!!",
            }),
            { status: 401, headers: { "content-type": "application/json" } }
          );
        }
      }
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: "/api/:path*",
};

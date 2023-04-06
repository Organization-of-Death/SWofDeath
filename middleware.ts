import { NextApiResponse } from "next";

import { NextRequest, NextResponse } from "next/server";
import jwt_decode from "jwt-decode";
import { Role } from "@prisma/client";

type UserToken = {
  email: string;
  id: number;
  role: Role;
  iat: number;
  exp: number;
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const [isProtected, allowedRoles] = mustAuth(pathname);

  console.log("isProtected", isProtected);
  console.log("allowedRoles", allowedRoles);
  if (isProtected) {
    const jwtToken = request.headers.get("authorization")?.split(" ")[1];
    console.log("jwtToken", jwtToken);
    if (jwtToken == "null" || !jwtToken) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "ว้าย ว้าย LOG IN FIRST",
        }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    const jwtDecode = jwt_decode(typeof jwtToken === "string" ? jwtToken : "") as UserToken;
    console.log("jwtDecode", jwtDecode);
    // if jwtDecode fails .. do something
    // if (/* jwt fails */ false) {
    //   return new NextResponse(
    //     JSON.stringify({
    //       success: false,
    //       message: "ว้าย ว้าย LOG IN FIRST",
    //     }),
    //     { status: 401, headers: { "content-type": "application/json" } }
    //   );
    // }

    // if expires or invalid jwttoken

    const userRole = jwtDecode.role;
    if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {

      // set the id & role fields in the headers
      // so that the inner layer api can access these fields
      request.headers.set('jesus-id', jwtDecode.id.toString());
      request.headers.set('jesus-role', jwtDecode.role.toString());

      return NextResponse.next({request});
    }

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "ว้าย ว้าย UNAUTHORIZED ACCESS",
      }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*",'/((?!api/seed).*)'],
};

// these prefix routes are only accessible for certain roles
const protectedRoutes: [string, Role[]][] = [
  ["/api/credentials/logout", [Role.ADMIN, Role.USER]],
  ["/api/reservations", [Role.ADMIN, Role.USER]],
];

const mustAuth = (url: string): [boolean, Role[]] => {
  for (let i = 0; i < protectedRoutes.length; i++) {
    const routeUrl = protectedRoutes[i][0];
    const allowedRoles = protectedRoutes[i][1];
    if (url.startsWith(routeUrl)) {
      return [true, allowedRoles];
    }
  }
  return [false, []];
}
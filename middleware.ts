import { NextRequest, NextResponse } from "next/server";
import jwt_decode from "jwt-decode";
import { Role } from "@prisma/client";

// these prefix routes are only accessible for certain roles
// when creating a new route, add the prefix url along with allowed roles here
const protectedRoutes: [string, Role[]][] = [
  ["/api/credentials/logout", ["*" as Role]],
  ["/api/reservations", [Role.ADMIN, Role.USER]],
];

// apply middleware to all api paths except those that begins with /api/seed/*
export const config = {
  matcher: ["/api/:path*", "/((?!api/seed).*)"],
};

export function middleware(request: NextRequest) {
  // check if the routes is protected, and if so which roles are allowed to access it
  const [isProtected, allowedRoles] = mustAuth(request.nextUrl.pathname);
  if (isProtected) {
    // check if a jwtToken is provided
    const jwtToken = request.headers.get("authorization")?.split(" ")[1];
    if (jwtToken == "null" || !jwtToken) {
      return genNextResponse(401, "ว้าย ๆ Log in first");
    }

    // check if the token is valid
    let jwtDecode: UserToken;
    try {
      jwtDecode = jwt_decode(typeof jwtToken === "string" ? jwtToken : "");

      // if the token has already expired
      if (jwtDecode.exp < Date.now() / 1000) {
        return genNextResponse(401, "session expired, please log in again");
      }
    } catch (err) {
      // if the token is malformed
      return genNextResponse(401, "login token error: please try again");
    }

    // at this point, we're certain the jwtToken is valid, it's time to check if the user's role is authorized
    // if the user is authorized for the role then set the id & role fields in the headers
    // so that the inner layer api can access these fields without redecoding the jwtToken
    const userRole = jwtDecode.role;
    if (allowedRoles.includes("*" as Role) || allowedRoles.includes(userRole)) {
      request.headers.set("jesus-id", jwtDecode.id.toString());
      request.headers.set("jesus-role", jwtDecode.role.toString());
      return NextResponse.next({ request });
    }
    return genNextResponse(401, "ว้าย ว้าย UNAUTHORIZED ACCESS");
  }

  // the route is unprotected, can just simply proceed
  return NextResponse.next();
}

// check if the url required authentication and if so which roles are authorized
const mustAuth = (url: string): [boolean, Role[]] => {
  for (let i = 0; i < protectedRoutes.length; i++) {
    const routeUrl = protectedRoutes[i][0];
    const allowedRoles = protectedRoutes[i][1];
    if (url.startsWith(routeUrl)) {
      return [true, allowedRoles];
    }
  }
  return [false, []];
};

// utility function to generate a NextResponse based on the status code & message
const genNextResponse = (status: number, message: string) => {
  let success = true;
  if (status >= 400) {
    success = false;
  }
  return new NextResponse(JSON.stringify({ success, message }), {
    status,
    headers: { "content-type": "application/json" },
  });
};

type UserToken = {
  email: string;
  id: number;
  role: Role;
  iat: number;
  exp: number;
};

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const envUsername = process.env.DASHBOARD_USERNAME;
  const envPassword = process.env.DASHBOARD_PASSWORD;

  if (!envUsername || !envPassword) {
    return new NextResponse("Dashboard auth is not configured.", {
      status: 500,
    });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid request body.", { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("username" in body) ||
    !("password" in body)
  ) {
    return new NextResponse("Missing credentials.", { status: 400 });
  }

  const { username, password } = body as {
    username: string;
    password: string;
  };

  if (username !== envUsername || password !== envPassword) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("dashboard_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}


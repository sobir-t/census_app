import { getUserById } from "@/data/user";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const user = await getUserById(id);
  if (user) return NextResponse.json({ success: "Found requested user", user }, { status: 200 });
  else NextResponse.json({ error: `No user found by id = '${id}` }, { status: 404 });
}

// /api/household

import { saveHousehold, updateHousehold } from "@/actions/actionsHousehold";

export async function PUT(request: Request) {
  const body = await request.json();
  const { success, household, error, data, db_error, code } = await saveHousehold(body);
  return Response.json({ success, household, error, data, db_error }, { status: code });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { success, household, error, data, db_error, code } = await updateHousehold(body);
  return Response.json({ success, household, error, data, db_error }, { status: code });
}

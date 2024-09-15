// /api/record/relative

import {
  saveRecordWithRelationship,
  updateRecordWithRelationship,
} from "@/actions/actionsRecord";

export async function PUT(request: Request) {
  const body = await request.json();
  const { success, recordWithRelationship, error, data, db_error, code } =
    await saveRecordWithRelationship(body);
  return Response.json(
    { success, recordWithRelationship, error, data, db_error },
    { status: code },
  );
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { success, recordWithRelationship, error, data, db_error, code } =
    await updateRecordWithRelationship(body);
  return Response.json(
    { success, recordWithRelationship, error, data, db_error },
    { status: code },
  );
}

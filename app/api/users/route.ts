import { deleteUserById, updateUser } from "@/actions/actionsUser";

export async function PATCH(request: Request) {
  const { user, success, error, data, db_error, code } = await updateUser(await request.json());
  return Response.json({ success, user, error, data, db_error }, { status: code });
}

export async function DELETE(request: Request) {
  const { success, error, db_error, code } = await deleteUserById((await request.json()).id);
  return Response.json({ success, error, db_error }, { status: code });
}

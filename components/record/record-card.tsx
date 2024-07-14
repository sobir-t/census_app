"use client";

import { Dispatch, SetStateAction } from "react";
import { Record } from "@prisma/client";
import UpdateRecordDialog from "./update-record-dialog";

interface RecordCardProps {
  record: Record;
  setEditRecordDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export default function RecordCard({ record, setEditRecordDialogOpen }: RecordCardProps) {
  return (
    <div className="record-card p-4 flex flex-wrap gap-2 items-start justify-start sm:col-span-6 border-b-2 rounded-md shadow hover:bg-slate-100">
      <div className="inline-flex items-center justify-between">
        <p>
          <b>Relationship:</b> Self
        </p>
        <UpdateRecordDialog householdId={record.householdId} record={record} setEditRecordDialogOpen={setEditRecordDialogOpen} />
      </div>
      <p className="full-name">
        <b>Full name:</b> {record.firstName} {record.lastName}
      </p>
      <p className="dob">
        <b>Date of Birth:</b> {record.dob.toLocaleDateString()}
      </p>
      <p className="gender">
        <b>Gender:</b> {record.gender}
      </p>
      {record.telephone && (
        <p id="telephone">
          <b>Telephone:</b> {record.telephone}
        </p>
      )}
      <div className="inline-flex items-center justify-start gap-2">
        <p className="hispanic">
          <b>Hispanic:</b> {record.hispanic}
        </p>
        {record.hispanicOther && <p className="hispanic-other">{record.hispanicOther}</p>}
      </div>
      <div className="inline-flex items-center justify-start gap-2">
        <p className="race">
          <b>Race:</b> {record.race}
        </p>
        {record.raceOther && <p className="race-other">{record.raceOther}</p>}
      </div>
      <p className="other-stay">
        <b>Other stay:</b> {record.otherStay}
      </p>
    </div>
  );
}

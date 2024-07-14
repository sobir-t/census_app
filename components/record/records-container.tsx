import { Record } from "@prisma/client";
import { useEffect, useState } from "react";
import LoadingCard from "../household/loading-card";
import RecordCard from "./record-card";
import UpdateRecordDialog from "./update-record-dialog";
import { getRecordsUnderHouseholdId } from "@/actions/actionsRecord";

interface RecordsContainerProps {
  householdId: number;
}

export default function RecordsContainer({ householdId }: RecordsContainerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<Record[]>([]);
  const [editRecordDialogOpen, setEditRecordDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    console.log(`householdId = ${householdId}`);
    if (!editRecordDialogOpen) {
      setLoading(true);
      getRecordsUnderHouseholdId(householdId)
        .then((data) => {
          if (data.records) setRecords(data.records);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editRecordDialogOpen]);

  return (
    <div className={"records-container w-full mt-4 grid sm:grid-cols-12 gap-2"}>
      {loading ? (
        <LoadingCard className="loading-record-card sm:col-span-6 p-4 border-b-2 rounded-md shadow hover:bg-slate-100" />
      ) : records.length ? (
        <>
          {records.map((record, i) => (
            <RecordCard key={i} record={record} setEditRecordDialogOpen={setEditRecordDialogOpen} />
          ))}
          <div className="add-record-card sm:col-span-6 inline-flex items-start justify-between p-2 border-b-2 rounded-md shadow hover:bg-slate-100">
            <p>Do you have anybody else?</p>
            <UpdateRecordDialog householdId={householdId} record={undefined} setEditRecordDialogOpen={setEditRecordDialogOpen} />
          </div>
        </>
      ) : (
        <div className="no-records-card sm:col-span-6 inline-flex items-center justify-between p-2 border-b-2 rounded-md shadow hover:bg-slate-100">
          <p>You don't have any records yet.</p>
          <UpdateRecordDialog householdId={householdId} record={undefined} setEditRecordDialogOpen={setEditRecordDialogOpen} />
        </div>
      )}
    </div>
  );
}

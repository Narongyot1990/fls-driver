import type { AttendanceEvent } from "@/app/leader/attendance/_lib/attendanceClient";

export type AttendancePair = {
  in?: AttendanceEvent;
  out?: AttendanceEvent;
  id: string;
};

export type AttendanceCorrectionFormPayload = {
  type: "in" | "out";
  category: "correction" | "offsite";
  requestedTime: Date;
  reason: string;
  offsiteLocation?: string;
};

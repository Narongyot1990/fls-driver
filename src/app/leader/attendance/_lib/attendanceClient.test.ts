import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AttendanceClientError,
  deleteAttendanceRecord,
  getSessionUser,
  listAttendanceRecords,
  listWorkScheduleEntries,
  submitAttendanceCorrection,
  submitClockAction,
} from "@/app/leader/attendance/_lib/attendanceClient";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("attendanceClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns session user from /api/auth/me", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          success: true,
          user: { id: "leader-1", role: "leader", branch: "AYA", name: "Leader" },
        }),
      ),
    );

    const user = await getSessionUser();
    expect(user.id).toBe("leader-1");
  });

  it("loads attendance records list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          success: true,
          records: [{ _id: "evt-1", type: "in", timestamp: "2026-03-01T08:00:00.000Z", eventType: "actual" }],
        }),
      ),
    );

    const records = await listAttendanceRecords("u-1", "2026-02-01", "2026-03-01");
    expect(records).toHaveLength(1);
    expect(records[0]._id).toBe("evt-1");
  });

  it("loads work schedule entries", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          success: true,
          schedules: [{ entries: [{ date: "2026-03-10" }] }],
        }),
      ),
    );

    const entries = await listWorkScheduleEntries("u-2", "2026-03");
    expect(entries).toHaveLength(1);
  });

  it("submits clock action successfully", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ success: true })));

    await expect(
      submitClockAction({
        type: "in",
        location: { lat: 14.35, lon: 100.56 },
        branchCode: "AYA",
      }),
    ).resolves.toBeUndefined();
  });

  it("throws AttendanceClientError when clock action fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ success: false, error: "OUT_OF_RANGE" }, 400)),
    );

    await expect(
      submitClockAction({
        type: "in",
        location: { lat: 14.35, lon: 100.56 },
        branchCode: "AYA",
      }),
    ).rejects.toThrow(AttendanceClientError);
  });

  it("submits correction and deletes record successfully", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, correction: { _id: "c-1" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true }));
    vi.stubGlobal("fetch", fetchMock);

    await submitAttendanceCorrection({
      type: "in",
      category: "correction",
      requestedTime: new Date("2026-03-01T08:00:00.000Z"),
      reason: "Forgot to clock in",
      location: { lat: 14.35, lon: 100.56 },
      distance: 10,
      branch: "AYA",
    });
    await deleteAttendanceRecord("evt-2");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAttendanceController } from "@/app/leader/attendance/hooks/useAttendanceController";

const pushMock = vi.fn();
const showToastMock = vi.fn();
const getCurrentPositionMock = vi.fn();
const confirmMock = vi.fn();

const getSessionUserMock = vi.fn();
const listAttendanceRecordsMock = vi.fn();
const listWorkScheduleEntriesMock = vi.fn();
const submitClockActionMock = vi.fn();
const deleteAttendanceRecordMock = vi.fn();
const submitAttendanceCorrectionMock = vi.fn();

let branchesState: Array<{
  code: string;
  name: string;
  active: boolean;
  location?: { lat: number; lon: number } | null;
  radius?: number;
}> = [];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => ({ branches: branchesState }),
}));

vi.mock("@/components/Toast", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

vi.mock("@/app/leader/attendance/_lib/attendanceClient", () => ({
  AttendanceClientError: class AttendanceClientError extends Error {},
  getSessionUser: (...args: unknown[]) => getSessionUserMock(...args),
  listAttendanceRecords: (...args: unknown[]) => listAttendanceRecordsMock(...args),
  listWorkScheduleEntries: (...args: unknown[]) => listWorkScheduleEntriesMock(...args),
  submitClockAction: (...args: unknown[]) => submitClockActionMock(...args),
  deleteAttendanceRecord: (...args: unknown[]) => deleteAttendanceRecordMock(...args),
  submitAttendanceCorrection: (...args: unknown[]) => submitAttendanceCorrectionMock(...args),
}));

describe("useAttendanceController", () => {
  beforeEach(() => {
    branchesState = [];
    pushMock.mockReset();
    showToastMock.mockReset();

    getSessionUserMock.mockReset();
    listAttendanceRecordsMock.mockReset();
    listWorkScheduleEntriesMock.mockReset();
    submitClockActionMock.mockReset();
    deleteAttendanceRecordMock.mockReset();
    submitAttendanceCorrectionMock.mockReset();
    getCurrentPositionMock.mockReset();
    confirmMock.mockReset();

    listAttendanceRecordsMock.mockResolvedValue([]);
    listWorkScheduleEntriesMock.mockResolvedValue([]);
    submitClockActionMock.mockResolvedValue(undefined);
    submitAttendanceCorrectionMock.mockResolvedValue(undefined);

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      configurable: true,
    });

    Object.defineProperty(window, "confirm", {
      value: confirmMock,
      configurable: true,
    });
  });

  it("redirects to /admin/login when session loading fails", async () => {
    getSessionUserMock.mockRejectedValueOnce(new Error("unauthorized"));

    renderHook(() => useAttendanceController());

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/admin/login");
    });
  });

  it("shows error toast when clock action is triggered without location", async () => {
    getSessionUserMock.mockResolvedValueOnce({
      id: "user-1",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });

    const { result } = renderHook(() => useAttendanceController());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleClockAction("in");
    });

    expect(showToastMock).toHaveBeenCalledWith("error", "Current location is required to clock in/out.");
    expect(submitClockActionMock).not.toHaveBeenCalled();
  });

  it("submits clock action when location is available", async () => {
    branchesState = [
      {
        code: "AYA",
        name: "Ayutthaya",
        active: true,
        location: { lat: 14.35, lon: 100.56 },
        radius: 80,
      },
    ];

    getCurrentPositionMock.mockImplementationOnce((success: (position: GeolocationPosition) => void) => {
      success({
        coords: {
          latitude: 14.351,
          longitude: 100.561,
        },
      } as GeolocationPosition);
    });

    getSessionUserMock.mockResolvedValueOnce({
      id: "user-2",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });

    const { result } = renderHook(() => useAttendanceController());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.location).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleClockAction("in");
    });

    expect(submitClockActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "in",
        location: { lat: 14.351, lon: 100.561 },
        branchCode: "AYA",
      }),
    );
    expect(showToastMock).toHaveBeenCalledWith("success", "Clock-in completed.");
  });

  it("returns true on successful correction submission", async () => {
    getSessionUserMock.mockResolvedValueOnce({
      id: "user-3",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });

    const { result } = renderHook(() => useAttendanceController());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let outcome = false;
    await act(async () => {
      outcome = await result.current.submitCorrection({
        type: "in",
        category: "correction",
        requestedTime: new Date(),
        reason: "Forgot to clock in",
      });
    });

    expect(outcome).toBe(true);
    expect(submitAttendanceCorrectionMock).toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalledWith("success", "Correction request submitted.");
  });

  it("returns false when correction submission fails", async () => {
    getSessionUserMock.mockResolvedValueOnce({
      id: "user-4",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });
    submitAttendanceCorrectionMock.mockRejectedValueOnce(new Error("Correction failed"));

    const { result } = renderHook(() => useAttendanceController());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let outcome = true;
    await act(async () => {
      outcome = await result.current.submitCorrection({
        type: "out",
        category: "offsite",
        requestedTime: new Date(),
        reason: "Offsite delivery",
        offsiteLocation: "Warehouse",
      });
    });

    expect(outcome).toBe(false);
    expect(showToastMock).toHaveBeenCalledWith("error", "Unable to submit correction request.");
  });

  it("does not delete record when confirmation is cancelled", async () => {
    getSessionUserMock.mockResolvedValueOnce({
      id: "user-5",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });
    confirmMock.mockReturnValueOnce(false);

    const { result } = renderHook(() => useAttendanceController());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteRecord("rec-1");
    });

    expect(deleteAttendanceRecordMock).not.toHaveBeenCalled();
  });

  it("deletes record when confirmation is accepted", async () => {
    getSessionUserMock.mockResolvedValueOnce({
      id: "user-6",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });
    confirmMock.mockReturnValueOnce(true);

    const { result } = renderHook(() => useAttendanceController());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteRecord("rec-2");
    });

    expect(deleteAttendanceRecordMock).toHaveBeenCalledWith("rec-2");
    expect(showToastMock).toHaveBeenCalledWith("success", "Attendance record deleted.");
  });

  it("shows error toast when delete record fails", async () => {
    getSessionUserMock.mockResolvedValueOnce({
      id: "user-7",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });
    confirmMock.mockReturnValueOnce(true);
    deleteAttendanceRecordMock.mockRejectedValueOnce(new Error("delete failed"));

    const { result } = renderHook(() => useAttendanceController());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteRecord("rec-3");
    });

    expect(showToastMock).toHaveBeenCalledWith("error", "Unable to delete record.");
  });

  it("builds attendance pairs from mixed event sequences", async () => {
    getSessionUserMock.mockResolvedValueOnce({
      id: "user-8",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });
    listAttendanceRecordsMock.mockResolvedValueOnce([
      { _id: "evt-1", type: "in", timestamp: "2026-03-16T08:00:00.000Z", eventType: "actual", branch: "AYA" },
      { _id: "evt-2", type: "out", timestamp: "2026-03-16T17:00:00.000Z", eventType: "actual", branch: "AYA" },
      { _id: "evt-3", type: "out", timestamp: "2026-03-17T12:00:00.000Z", eventType: "actual", branch: "AYA" },
      { _id: "evt-4", type: "in", timestamp: "2026-03-17T08:30:00.000Z", eventType: "actual", branch: "AYA" },
      { _id: "evt-5", type: "in", timestamp: "2026-03-18T08:00:00.000Z", eventType: "correction", branch: "AYA" },
    ]);

    const { result } = renderHook(() => useAttendanceController());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.attendancePairs.length).toBe(3);
    });

    expect(result.current.attendancePairs[0].in?._id).toBe("evt-5");
    expect(result.current.attendancePairs[0].out).toBeUndefined();
    expect(result.current.attendancePairs[1].in?._id).toBe("evt-4");
    expect(result.current.attendancePairs[1].out?._id).toBe("evt-3");
    expect(result.current.attendancePairs[2].in?._id).toBe("evt-1");
    expect(result.current.attendancePairs[2].out?._id).toBe("evt-2");
  });

  it("updates distance and in-range state when geolocation succeeds", async () => {
    branchesState = [
      {
        code: "AYA",
        name: "Ayutthaya",
        active: true,
        location: { lat: 14.35, lon: 100.56 },
        radius: 200,
      },
    ];

    getCurrentPositionMock.mockImplementation((success: (position: GeolocationPosition) => void) => {
      success({
        coords: {
          latitude: 14.3505,
          longitude: 100.5605,
        },
      } as GeolocationPosition);
    });

    getSessionUserMock.mockResolvedValueOnce({
      id: "user-9",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });

    const { result } = renderHook(() => useAttendanceController());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.location).toEqual({ lat: 14.3505, lon: 100.5605 });
      expect(result.current.displayDistance).not.toBe("---");
    });

    expect(result.current.isInRange).toBe(true);
  });

  it("keeps safe defaults when geolocation fails", async () => {
    branchesState = [
      {
        code: "AYA",
        name: "Ayutthaya",
        active: true,
        location: { lat: 14.35, lon: 100.56 },
        radius: 80,
      },
    ];

    getCurrentPositionMock.mockImplementation(
      (_success: (position: GeolocationPosition) => void, error: (err: GeolocationPositionError) => void) => {
        error({ code: 1, message: "permission denied" } as GeolocationPositionError);
      },
    );

    getSessionUserMock.mockResolvedValueOnce({
      id: "user-10",
      role: "leader",
      branch: "AYA",
      name: "Leader",
    });

    const { result } = renderHook(() => useAttendanceController());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.location).toBeNull();
      expect(result.current.displayDistance).toBe("---");
    });

    expect(result.current.isInRange).toBe(false);
  });
});

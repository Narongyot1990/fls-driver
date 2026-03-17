import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLeaveHistoryController } from "@/app/leave/_hooks/useLeaveHistoryController";
import { LeaveApiClientError } from "@/app/leave/_lib/leaveApiClient";

const pushMock = vi.fn();

const mocks = vi.hoisted(() => ({
  getCurrentSessionUserMock: vi.fn(),
  getUserQuotaByIdMock: vi.fn(),
  getLeaveHistoryMock: vi.fn(),
  cancelLeaveRequestMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/leave/_lib/leaveApiClient", () => ({
  LeaveApiClientError: class LeaveApiClientError extends Error {},
  getCurrentSessionUser: (...args: unknown[]) => mocks.getCurrentSessionUserMock(...args),
  getUserQuotaById: (...args: unknown[]) => mocks.getUserQuotaByIdMock(...args),
  getLeaveHistory: (...args: unknown[]) => mocks.getLeaveHistoryMock(...args),
  cancelLeaveRequest: (...args: unknown[]) => mocks.cancelLeaveRequestMock(...args),
}));

describe("useLeaveHistoryController", () => {
  beforeEach(() => {
    pushMock.mockReset();
    mocks.getCurrentSessionUserMock.mockReset();
    mocks.getUserQuotaByIdMock.mockReset();
    mocks.getLeaveHistoryMock.mockReset();
    mocks.cancelLeaveRequestMock.mockReset();
    localStorage.clear();
  });

  it("redirects to login when session and localStorage are missing", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValue(null);

    renderHook(() => useLeaveHistoryController());

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("loads user and leave history from session", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValue({
      id: "driver-10",
      role: "driver",
      status: "active",
      lineDisplayName: "Driver 10",
    });
    mocks.getUserQuotaByIdMock.mockResolvedValue({
      id: "driver-10",
      role: "driver",
      lineDisplayName: "Driver 10",
      vacationDays: 9,
      sickDays: 8,
      personalDays: 3,
    });
    mocks.getLeaveHistoryMock.mockResolvedValue([
      {
        _id: "leave-1",
        leaveType: "vacation",
        startDate: "2026-03-10",
        endDate: "2026-03-11",
        reason: "Vacation",
        status: "pending",
        createdAt: "2026-03-01T00:00:00.000Z",
      },
    ]);

    const { result } = renderHook(() => useLeaveHistoryController());

    await waitFor(() => {
      expect(result.current.initializing).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.user?.id).toBe("driver-10");
      expect(result.current.requests.length).toBe(1);
    });

    expect(mocks.getLeaveHistoryMock).toHaveBeenCalledWith("driver-10");
  });

  it("cancels leave and updates quota/localStorage on success", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValue({
      id: "driver-11",
      role: "driver",
      status: "active",
      lineDisplayName: "Driver 11",
    });
    mocks.getUserQuotaByIdMock.mockResolvedValue({
      id: "driver-11",
      role: "driver",
      lineDisplayName: "Driver 11",
      vacationDays: 8,
      sickDays: 8,
      personalDays: 4,
    });
    mocks.getLeaveHistoryMock.mockResolvedValue([
      {
        _id: "leave-2",
        leaveType: "vacation",
        startDate: "2026-03-12",
        endDate: "2026-03-12",
        reason: "Vacation",
        status: "approved",
        createdAt: "2026-03-02T00:00:00.000Z",
      },
    ]);
    mocks.cancelLeaveRequestMock.mockResolvedValue({
      success: true,
      remainingQuota: {
        vacationDays: 9,
        sickDays: 8,
        personalDays: 4,
      },
    });

    const { result } = renderHook(() => useLeaveHistoryController());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.requests.length).toBe(1);
    });

    let outcome = false;
    await act(async () => {
      outcome = await result.current.cancelRequest("leave-2");
    });

    expect(outcome).toBe(true);
    expect(mocks.cancelLeaveRequestMock).toHaveBeenCalledWith("driver-11", "leave-2");
    const stored = JSON.parse(localStorage.getItem("driverUser") || "{}");
    expect(stored.vacationDays).toBe(9);
  });

  it("returns false and sets api error on cancel failure", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValue({
      id: "driver-12",
      role: "driver",
      status: "active",
      lineDisplayName: "Driver 12",
    });
    mocks.getUserQuotaByIdMock.mockResolvedValue({
      id: "driver-12",
      role: "driver",
      lineDisplayName: "Driver 12",
      vacationDays: 8,
      sickDays: 8,
      personalDays: 4,
    });
    mocks.getLeaveHistoryMock.mockResolvedValue([
      {
        _id: "leave-3",
        leaveType: "vacation",
        startDate: "2026-03-12",
        endDate: "2026-03-12",
        reason: "Vacation",
        status: "pending",
        createdAt: "2026-03-02T00:00:00.000Z",
      },
    ]);
    mocks.cancelLeaveRequestMock.mockRejectedValue(new LeaveApiClientError("CANCEL_NOT_ALLOWED"));

    const { result } = renderHook(() => useLeaveHistoryController());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let outcome = true;
    await act(async () => {
      outcome = await result.current.cancelRequest("leave-3");
    });

    expect(outcome).toBe(false);
    expect(result.current.error).toBe("CANCEL_NOT_ALLOWED");
  });
});

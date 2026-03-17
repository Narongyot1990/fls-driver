import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLeaveFormController } from "@/app/leave/_hooks/useLeaveFormController";

const pushMock = vi.fn();

const mocks = vi.hoisted(() => ({
  getCurrentSessionUserMock: vi.fn(),
  getUserQuotaByIdMock: vi.fn(),
  createLeaveRequestMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/leave/_lib/leaveApiClient", () => ({
  LeaveApiClientError: class LeaveApiClientError extends Error {},
  getCurrentSessionUser: (...args: unknown[]) => mocks.getCurrentSessionUserMock(...args),
  getUserQuotaById: (...args: unknown[]) => mocks.getUserQuotaByIdMock(...args),
  createLeaveRequest: (...args: unknown[]) => mocks.createLeaveRequestMock(...args),
}));

describe("useLeaveFormController", () => {
  beforeEach(() => {
    pushMock.mockReset();
    mocks.getCurrentSessionUserMock.mockReset();
    mocks.getUserQuotaByIdMock.mockReset();
    mocks.createLeaveRequestMock.mockReset();
    localStorage.clear();
    vi.useRealTimers();
  });

  it("redirects to login when session and localStorage are missing", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValueOnce(null);

    renderHook(() => useLeaveFormController(null));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("loads target user quota for leader/admin context", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValueOnce({
      id: "leader-1",
      role: "leader",
      status: "active",
      lineDisplayName: "Leader",
    });
    mocks.getUserQuotaByIdMock.mockResolvedValueOnce({
      id: "driver-2",
      role: "driver",
      lineDisplayName: "Driver Two",
      vacationDays: 7,
      sickDays: 5,
      personalDays: 2,
    });

    const { result } = renderHook(() => useLeaveFormController("driver-2"));

    await waitFor(() => {
      expect(result.current.initializing).toBe(false);
      expect(result.current.requestUser?.id).toBe("driver-2");
    });

    expect(mocks.getUserQuotaByIdMock).toHaveBeenCalledWith("driver-2");
  });

  it("blocks submit when required fields are missing", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValueOnce({
      id: "driver-1",
      role: "driver",
      status: "active",
      lineDisplayName: "Driver One",
    });
    mocks.getUserQuotaByIdMock.mockResolvedValueOnce({
      id: "driver-1",
      role: "driver",
      lineDisplayName: "Driver One",
      vacationDays: 10,
      sickDays: 10,
      personalDays: 5,
    });

    const { result } = renderHook(() => useLeaveFormController(null));
    await waitFor(() => expect(result.current.initializing).toBe(false));

    await act(async () => {
      await result.current.submit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(mocks.createLeaveRequestMock).not.toHaveBeenCalled();
    expect(result.current.error.length).toBeGreaterThan(0);
  });

  it("submits leave request and redirects on success", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValueOnce({
      id: "driver-3",
      role: "driver",
      status: "active",
      lineDisplayName: "Driver Three",
    });
    mocks.getUserQuotaByIdMock.mockResolvedValueOnce({
      id: "driver-3",
      role: "driver",
      lineDisplayName: "Driver Three",
      vacationDays: 10,
      sickDays: 10,
      personalDays: 5,
    });
    mocks.createLeaveRequestMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useLeaveFormController(null));
    await waitFor(() => expect(result.current.initializing).toBe(false));

    await act(async () => {
      result.current.setLeaveType("vacation");
      result.current.setReason("Personal vacation");
      result.current.handleDateSelect({
        from: new Date("2026-03-20T00:00:00.000Z"),
        to: new Date("2026-03-22T00:00:00.000Z"),
      });
    });
    await waitFor(() => {
      expect(result.current.leaveType).toBe("vacation");
      expect(result.current.reason).toBe("Personal vacation");
      expect(result.current.startDate).toBe("2026-03-20");
      expect(result.current.endDate).toBe("2026-03-22");
    });

    await act(async () => {
      await result.current.submit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(mocks.createLeaveRequestMock).toHaveBeenCalledWith({
      userId: "driver-3",
      leaveType: "vacation",
      startDate: "2026-03-20",
      endDate: "2026-03-22",
      reason: "Personal vacation",
    });
    expect(result.current.success).toBe(true);

    await waitFor(
      () => {
        expect(pushMock).toHaveBeenCalledWith("/leave/history");
      },
      { timeout: 2000 },
    );
  });

  it("shows error message when submission fails", async () => {
    mocks.getCurrentSessionUserMock.mockResolvedValueOnce({
      id: "driver-4",
      role: "driver",
      status: "active",
      lineDisplayName: "Driver Four",
    });
    mocks.getUserQuotaByIdMock.mockResolvedValueOnce({
      id: "driver-4",
      role: "driver",
      lineDisplayName: "Driver Four",
      vacationDays: 10,
      sickDays: 10,
      personalDays: 5,
    });
    mocks.createLeaveRequestMock.mockRejectedValueOnce(new Error("request failed"));

    const { result } = renderHook(() => useLeaveFormController(null));
    await waitFor(() => expect(result.current.initializing).toBe(false));

    await act(async () => {
      result.current.setLeaveType("vacation");
      result.current.setReason("Vacation");
      result.current.handleDateSelect({
        from: new Date("2026-03-20T00:00:00.000Z"),
        to: new Date("2026-03-20T00:00:00.000Z"),
      });
    });
    await waitFor(() => {
      expect(result.current.leaveType).toBe("vacation");
      expect(result.current.reason).toBe("Vacation");
      expect(result.current.startDate).toBe("2026-03-20");
      expect(result.current.endDate).toBe("2026-03-20");
    });

    await act(async () => {
      await result.current.submit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error.length).toBeGreaterThan(0);
  });
});

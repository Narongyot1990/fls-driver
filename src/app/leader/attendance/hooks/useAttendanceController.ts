import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBranches, type Branch } from '@/hooks/useBranches';
import { useToast } from '@/components/Toast';
import {
  AttendanceClientError,
  deleteAttendanceRecord,
  getSessionUser,
  listAttendanceRecords,
  listWorkScheduleEntries,
  submitAttendanceCorrection,
  submitClockAction,
  type AttendanceEvent,
  type AttendanceUser,
  type Coordinates,
} from '@/app/leader/attendance/_lib/attendanceClient';
import type { AttendanceCorrectionFormPayload, AttendancePair } from '@/app/leader/attendance/_lib/attendanceTypes';

function formatDateYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDistanceMeters(from: Coordinates, to: Coordinates) {
  const earthRadius = 6371e3;
  const fromLat = (from.lat * Math.PI) / 180;
  const toLat = (to.lat * Math.PI) / 180;
  const deltaLat = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLon = ((to.lon - from.lon) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function resolveBranch(branches: Branch[], user: AttendanceUser | null): Branch | undefined {
  const branchCode = user?.branch || 'AYA';
  return branches.find((item) => item.code === branchCode);
}

export function useAttendanceController() {
  const router = useRouter();
  const { branches } = useBranches();
  const { showToast } = useToast();

  const [user, setUser] = useState<AttendanceUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceEvent[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [branchRadius, setBranchRadius] = useState(50);
  const [branchLocation, setBranchLocation] = useState<Coordinates | null>(null);
  const [mySchedule, setMySchedule] = useState<unknown[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      try {
        const sessionUser = await getSessionUser();
        if (!cancelled) {
          setUser(sessionUser);
        }
      } catch {
        router.push('/admin/login');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const fetchRecords = useCallback(async () => {
    if (!user?.id) return;

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const items = await listAttendanceRecords(user.id, formatDateYmd(thirtyDaysAgo), formatDateYmd(now));

      const sorted = [...items].sort((a, b) => new Date(String(b.timestamp)).getTime() - new Date(String(a.timestamp)).getTime());
      setRecords(sorted);
    } catch {
      showToast('error', 'Unable to load attendance records.');
    }
  }, [user?.id, showToast]);

  const fetchMySchedule = useCallback(async () => {
    if (!user?.id) return;

    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const entries = await listWorkScheduleEntries(user.id, month);
      setMySchedule(entries);
    } catch {
      showToast('error', 'Unable to load schedule.');
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    if (!user) return;
    fetchRecords();
    fetchMySchedule();
  }, [user, fetchRecords, fetchMySchedule]);

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setLocation(coords);

        const branch = resolveBranch(branches, user);
        if (branch?.location) {
          const dist = calculateDistanceMeters(coords, branch.location);
          setDistance(dist);
          setBranchLocation(branch.location);
          setBranchRadius(branch.radius || 50);
        }

        setLocLoading(false);
      },
      () => setLocLoading(false),
      { enableHighAccuracy: true },
    );
  }, [branches, user]);

  useEffect(() => {
    if (branches.length > 0 && user) {
      updateLocation();
    }
  }, [branches, user, updateLocation]);

  const handleClockAction = async (type: 'in' | 'out') => {
    const branch = resolveBranch(branches, user);
    const branchCode = user?.branch || 'AYA';

    if (!location) {
      showToast('error', 'Current location is required to clock in/out.');
      return;
    }

    setActionLoading(true);
    try {
      await submitClockAction({
        type,
        location,
        branchCode,
        branchLocation: branch?.location || undefined,
        radius: branchRadius,
      });
      showToast('success', `Clock-${type} completed.`);
      await fetchRecords();
    } catch (error) {
      if (error instanceof AttendanceClientError) {
        showToast('error', error.message);
      } else {
        showToast('error', 'Unable to clock in/out.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Delete this attendance record?')) return;

    try {
      await deleteAttendanceRecord(id);
      showToast('success', 'Attendance record deleted.');
      await fetchRecords();
    } catch (error) {
      if (error instanceof AttendanceClientError) {
        showToast('error', error.message);
      } else {
        showToast('error', 'Unable to delete record.');
      }
    }
  };

  const submitCorrection = async (payload: AttendanceCorrectionFormPayload) => {
    setActionLoading(true);
    try {
      await submitAttendanceCorrection({
        ...payload,
        location,
        distance,
        branch: user?.branch || 'AYA',
      });
      showToast('success', 'Correction request submitted.');
      await fetchRecords();
      return true;
    } catch (error) {
      if (error instanceof AttendanceClientError) {
        showToast('error', error.message);
      } else {
        showToast('error', 'Unable to submit correction request.');
      }
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const actualRecords = records.filter((record) => record.eventType === 'actual');
  const isClockedIn = actualRecords.length > 0 && actualRecords[0].type === 'in';
  const isClockedOut = actualRecords.length > 0 && actualRecords[0].type === 'out';
  const lastRecordType: 'in' | 'out' = actualRecords.length > 0 ? actualRecords[0].type : 'out';
  const isInRange = distance !== null && distance <= branchRadius + 5;

  const attendancePairs = useMemo<AttendancePair[]>(() => {
    const pairs: AttendancePair[] = [];
    const sortedEvents = [...records].sort(
      (a, b) => new Date(String(a.timestamp)).getTime() - new Date(String(b.timestamp)).getTime(),
    );

    let currentPair: AttendancePair | null = null;

    sortedEvents.forEach((event) => {
      if (event.type === 'in') {
        if (currentPair) {
          pairs.push(currentPair);
        }
        currentPair = { in: event, id: event._id };
        return;
      }

      if (currentPair) {
        currentPair.out = event;
        pairs.push(currentPair);
        currentPair = null;
      } else {
        pairs.push({ out: event, id: event._id });
      }
    });

    if (currentPair) {
      pairs.push(currentPair);
    }

    return pairs.reverse();
  }, [records]);

  return {
    user,
    loading,
    location,
    distance,
    displayDistance: distance === null ? '---' : `${(distance / 1000).toFixed(1)} km`,
    locLoading,
    records,
    allEvents: records,
    attendancePairs,
    lastRecordType,
    actionLoading,
    branchRadius,
    branchLocation,
    mySchedule,
    isClockedIn,
    isClockedOut,
    isInRange,
    handleClockAction,
    handleDeleteRecord,
    submitCorrection,
    updateLocation,
  };
}

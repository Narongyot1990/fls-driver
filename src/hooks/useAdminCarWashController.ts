'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import type { ProfileUser } from '@/components/ProfileModal';
import type { CarWashActivity as Activity, CarWashUser as UserInfo } from '@/components/AdminCarWashActivityCard';
import { usePusher } from '@/hooks/usePusher';

dayjs.extend(isoWeek);
dayjs.extend(relativeTime);
dayjs.locale('th');

export interface DriverOption {
  _id: string;
  lineDisplayName: string;
  name?: string;
  surname?: string;
}

interface ControllerUser {
  id: string;
  name?: string;
}

export function useAdminCarWashController(user: ControllerUser | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [selectedDriver, setSelectedDriver] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterActivityType, setFilterActivityType] = useState('');

  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [saving, setSaving] = useState(false);

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [likesPopupData, setLikesPopupData] = useState<Activity['likes']>([]);
  const [showLikesPopup, setShowLikesPopup] = useState(false);

  const openProfile = useCallback((userInfo?: UserInfo) => {
    if (!userInfo) return;
    setProfileUser(userInfo as unknown as ProfileUser);
    setShowProfile(true);
  }, []);

  const closeProfile = useCallback(() => {
    setShowProfile(false);
  }, []);

  const openLikesPopup = useCallback((likes: Activity['likes']) => {
    setLikesPopupData(likes);
    setShowLikesPopup(true);
  }, []);

  const closeLikesPopup = useCallback(() => {
    setShowLikesPopup(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/users?status=active')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setDrivers(data.users || []);
      })
      .catch(console.error);
  }, [user]);

  const fetchActivities = useCallback(async (page: number, append = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (selectedDriver) params.set('userId', selectedDriver);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (filterActivityType) params.set('activityType', filterActivityType);

      const response = await fetch(`/api/car-wash?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setActivities((previous) => append ? [...previous, ...(data.activities || [])] : (data.activities || []));
        setHasMore(data.hasMore ?? false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedDriver, startDate, endDate, filterActivityType]);

  useEffect(() => {
    if (!user) return;
    pageRef.current = 1;
    fetchActivities(1);
  }, [user, selectedDriver, startDate, endDate, filterActivityType, fetchActivities]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        const nextPage = pageRef.current + 1;
        pageRef.current = nextPage;
        fetchActivities(nextPage, true);
      }
    }, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, fetchActivities]);

  const updateActivity = useCallback((updated: Activity) => {
    setActivities((previous) => previous.map((activity) => (activity._id === updated._id ? updated : activity)));
  }, []);

  const handlePusherNew = useCallback(async (data: { activityId: string }) => {
    try {
      const response = await fetch(`/api/car-wash/${data.activityId}`);
      const result = await response.json();
      if (!result.success) return;
      const activity = result.activity as Activity;
      setActivities((previous) => {
        if (previous.some((item) => item._id === activity._id)) return previous;
        return [activity, ...previous];
      });
    } catch {
      // ignore
    }
  }, []);

  const handlePusherUpdate = useCallback(async (data: { activityId: string }) => {
    try {
      const response = await fetch(`/api/car-wash/${data.activityId}`);
      const result = await response.json();
      if (!result.success) return;
      setActivities((previous) => previous.map((activity) => (activity._id === data.activityId ? result.activity : activity)));
    } catch {
      // ignore
    }
  }, []);

  const handlePusherDelete = useCallback((data: { activityId: string }) => {
    setActivities((previous) => previous.filter((activity) => activity._id !== data.activityId));
  }, []);

  usePusher('car-wash-feed', [
    { event: 'new-activity', callback: handlePusherNew },
    { event: 'update-activity', callback: handlePusherUpdate },
    { event: 'delete-activity', callback: handlePusherDelete },
  ], !!user);

  const today = dayjs().startOf('day');
  const weekStart = dayjs().startOf('isoWeek');
  const monthStart = dayjs().startOf('month');
  const todayCount = activities.filter((activity) => dayjs(activity.activityDate).isSame(today, 'day')).length;
  const weekCount = activities.filter((activity) => dayjs(activity.activityDate).isAfter(weekStart.subtract(1, 'day'))).length;
  const monthCount = activities.filter((activity) => dayjs(activity.activityDate).isAfter(monthStart.subtract(1, 'day'))).length;
  const markedCount = activities.filter((activity) => activity.marked).length;

  const clearFilters = useCallback(() => {
    setSelectedDriver('');
    setStartDate('');
    setEndDate('');
  }, []);

  const hasFilters = selectedDriver || startDate || endDate;

  const handleLike = useCallback(async (activityId: string) => {
    if (!user) return;
    setActivities((previous) =>
      previous.map((activity) => {
        if (activity._id !== activityId) return activity;
        const alreadyLiked = activity.likes.some(
          (like: any) => (like._id || like.id || like) === user.id,
        );
        return {
          ...activity,
          likes: alreadyLiked
            ? activity.likes.filter((like: any) => (like._id || like) !== user.id)
            : [...activity.likes, { _id: user.id, lineDisplayName: user.name || 'Admin' } as any],
        };
      }),
    );
    try {
      const response = await fetch(`/api/car-wash/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', visitorId: user.id }),
      });
      const data = await response.json();
      if (data.success) updateActivity(data.activity);
    } catch {
      try {
        const response = await fetch(`/api/car-wash/${activityId}`);
        const data = await response.json();
        if (data.success) updateActivity(data.activity);
      } catch {
        // ignore
      }
    }
  }, [updateActivity, user]);

  const handleComment = useCallback(async (activityId: string) => {
    if (!user || !commentText.trim()) return;
    setSendingComment(true);
    try {
      const response = await fetch(`/api/car-wash/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', visitorId: user.id, text: commentText.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        updateActivity(data.activity);
        setCommentText('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSendingComment(false);
    }
  }, [commentText, updateActivity, user]);

  const handleDeleteComment = useCallback(async (activityId: string, commentId: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/car-wash/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteComment', commentId, visitorId: user.id }),
      });
      const data = await response.json();
      if (data.success) updateActivity(data.activity);
    } catch (error) {
      console.error(error);
    }
  }, [updateActivity, user]);

  const handleMark = useCallback(async (activityId: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/car-wash/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark', leaderId: user.id }),
      });
      const data = await response.json();
      if (data.success) updateActivity(data.activity);
    } catch (error) {
      console.error(error);
    }
  }, [updateActivity, user]);

  const handleDelete = useCallback(async (activityId: string) => {
    if (!user || !confirm('เธ•เนเธญเธเธเธฒเธฃเธฅเธเธเธดเธเธเธฃเธฃเธกเธเธตเน?')) return;
    try {
      const response = await fetch(`/api/car-wash/${activityId}?visitorId=${user.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) setActivities((previous) => previous.filter((activity) => activity._id !== activityId));
    } catch (error) {
      console.error(error);
    }
    setMenuOpen(null);
  }, [user]);

  const handleEditSave = useCallback(async () => {
    if (!user || !editActivity) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/car-wash/${editActivity._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: user.id, caption: editCaption }),
      });
      const data = await response.json();
      if (data.success) {
        updateActivity(data.activity);
        setEditActivity(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }, [editActivity, editCaption, updateActivity, user]);

  const openEdit = useCallback((activity: Activity) => {
    setEditCaption(activity.caption);
    setEditActivity(activity);
    setMenuOpen(null);
  }, []);

  const closeEdit = useCallback(() => {
    setEditActivity(null);
  }, []);

  const openGallery = useCallback((images: string[], startIndex: number) => {
    setGalleryImages(images);
    setGalleryIndex(startIndex);
  }, []);

  const closeGallery = useCallback(() => {
    setGalleryImages([]);
  }, []);

  const prevGallery = useCallback(() => {
    setGalleryIndex((previous) => previous - 1);
  }, []);

  const nextGallery = useCallback(() => {
    setGalleryIndex((previous) => previous + 1);
  }, []);

  const toggleComments = useCallback((activityId: string) => {
    if (commentingOn === activityId) {
      setCommentingOn(null);
    } else {
      setCommentingOn(activityId);
      setCommentText('');
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  }, [commentingOn]);

  const isLiked = useCallback((activity: Activity) => {
    return user ? activity.likes.some((likeId: any) => (likeId._id || likeId) === user.id) : false;
  }, [user]);

  const toggleMenu = useCallback((activityId: string) => {
    setMenuOpen((previous) => (previous === activityId ? null : activityId));
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters((previous) => !previous);
  }, []);

  return {
    activities,
    drivers,
    loading,
    loadingMore,
    hasMore,
    sentinelRef,
    selectedDriver,
    setSelectedDriver,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showFilters,
    toggleFilters,
    filterActivityType,
    setFilterActivityType,
    commentingOn,
    commentText,
    setCommentText,
    sendingComment,
    commentInputRef,
    menuOpen,
    toggleMenu,
    editActivity,
    editCaption,
    setEditCaption,
    saving,
    galleryImages,
    galleryIndex,
    setGalleryIndex,
    profileUser,
    showProfile,
    closeProfile,
    likesPopupData,
    showLikesPopup,
    openLikesPopup,
    closeLikesPopup,
    openProfile,
    todayCount,
    weekCount,
    monthCount,
    markedCount,
    hasFilters: Boolean(hasFilters),
    clearFilters,
    handleLike,
    handleComment,
    handleDeleteComment,
    handleMark,
    handleDelete,
    handleEditSave,
    openEdit,
    closeEdit,
    openGallery,
    closeGallery,
    prevGallery,
    nextGallery,
    toggleComments,
    isLiked,
  };
}

export default useAdminCarWashController;

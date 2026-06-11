"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  BellRing,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { Notification, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";

const ICON_CONFIG: Record<
  NotificationType,
  { bg: string; color: string; Icon: React.ElementType }
> = {
  new_join:  { bg: "bg-green-50",    color: "text-green-500",   Icon: UserPlus },
  left:      { bg: "bg-red-50",      color: "text-red-500",     Icon: UserMinus },
  reminder:  { bg: "bg-orange-50",   color: "text-orange-500",  Icon: BellRing },
  full:      { bg: "bg-primary-100", color: "text-primary-600", Icon: CheckCircle },
  cancelled: { bg: "bg-red-50",      color: "text-red-500",     Icon: XCircle },
};

const formatTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const groupByDate = (
  items: Notification[],
): { group: string; items: Notification[] }[] => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const today = items.filter((n) => new Date(n.created_at) >= todayStart);
  const yesterday = items.filter((n) => {
    const d = new Date(n.created_at);
    return d >= yesterdayStart && d < todayStart;
  });
  const earlier = items.filter((n) => new Date(n.created_at) < yesterdayStart);

  const groups: { group: string; items: Notification[] }[] = [];
  if (today.length) groups.push({ group: "오늘", items: today });
  if (yesterday.length) groups.push({ group: "어제", items: yesterday });
  if (earlier.length) groups.push({ group: "이전", items: earlier });
  return groups;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    notificationService
      .getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const groups = useMemo(() => groupByDate(notifications), [notifications]);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    await notificationService.markRead(id).catch(console.error);
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.is_read) await markRead(notif.id);
    if (notif.post_id) router.push(`/post/${notif.post_id}`);
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await notificationService.markAllRead().catch(console.error);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="top-bar">
        <button
          onClick={() => router.back()}
          className="bar-btn"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-[22px] h-[22px] text-grey-700" />
        </button>
        <span className="bar-title">알림</span>
        {unreadCount > 0 ? (
          <button onClick={markAllRead} className="bar-action">
            모두 읽음
          </button>
        ) : (
          <div className="w-[44px]" />
        )}
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar bg-grey-50">
        {isLoading ? (
          <div className="py-20 text-center text-grey-400 text-sm font-medium">
            알림을 불러오는 중...
          </div>
        ) : groups.length === 0 ? (
          <div className="py-20 text-center text-grey-400 text-sm font-medium">
            새로운 알림이 없어요
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.group}>
              <div className="notif-group-header">
                <span>{group.group}</span>
              </div>
              <div>
                {group.items.map((notif) => {
                  const { bg, color, Icon } = ICON_CONFIG[notif.type];
                  return (
                    <div
                      key={notif.id}
                      className={cn("notif-row", !notif.is_read && "unread")}
                      onClick={() => handleClick(notif)}
                    >
                      <div className={cn("notif-icon", bg)}>
                        <Icon className={cn("w-5 h-5", color)} />
                      </div>
                      <div className="notif-body">
                        <div className="notif-title">{notif.message}</div>
                        {notif.sub_message && (
                          <div className="notif-desc">{notif.sub_message}</div>
                        )}
                        <div className="notif-time">
                          {formatTime(notif.created_at)}
                        </div>
                      </div>
                      <div className="notif-right">
                        {!notif.is_read && <div className="unread-dot" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div className="h-6" />
      </main>
    </div>
  );
}

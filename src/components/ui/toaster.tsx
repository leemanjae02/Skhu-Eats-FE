"use client";

import { useEffect, useState } from "react";
import { registerToastHandlers } from "@/lib/toast";

interface ToastItem {
  id: number;
  msg: string;
  type: "error" | "success";
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let next = 0;
    const add = (type: ToastItem["type"]) => (msg: string) => {
      const id = next++;
      setItems((prev) => [...prev, { id, msg, type }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3000);
    };
    registerToastHandlers({ error: add("error"), success: add("success") });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-[calc(100%-40px)] max-w-[440px]">
      {items.map((item) => (
        <div
          key={item.id}
          className="w-full px-4 py-3 rounded-2xl text-[14px] font-semibold text-grey-900 shadow-md animate-fade-slide-up bg-primary-200 border border-primary-300"
        >
          {item.msg}
        </div>
      ))}
    </div>
  );
}

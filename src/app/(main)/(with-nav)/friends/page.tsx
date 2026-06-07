"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FriendsPage() {
  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        showLogo
        rightAction={<button className="text-[14px] font-medium text-grey-600 px-4">필터</button>}
      />
      <div className="flex bg-white border-b border-grey-200 shrink-0">
        <div className="flex-1 text-center py-3.5 text-[16px] font-bold text-grey-900 border-b-2 border-primary-600">
          내가 만든
        </div>
        <div className="flex-1 text-center py-3.5 text-[16px] font-semibold text-grey-500">
          참여 중
        </div>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar bg-grey-50 p-5 space-y-2.5">
        {[
          { date: "MAR 30", menu: "부대찌개 + 공기밥", place: "학생회관", time: "12:15", count: "3/4", status: "active", label: "모집중" },
          { date: "MAR 31", menu: "스시로 런치세트", place: "정문 스시로", time: "13:00", count: "2/4", status: "urgent", label: "마감임박" },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-grey-200 rounded-2xl p-4 flex gap-3.5">
            <div className="flex flex-col items-center w-10 bg-primary-100 rounded-xl py-1.5 shrink-0">
              <span className="text-[10px] font-bold text-primary-700 tracking-wider">
                {item.date.split(" ")[0]}
              </span>
              <span className="text-[22px] font-bold text-primary-700 leading-none">
                {item.date.split(" ")[1]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-bold text-grey-900 truncate mb-1">{item.menu}</h3>
              <p className="text-[13px] font-medium text-grey-600 mb-2.5">
                {item.place} · {item.time}
              </p>
              <div className="text-[13px] font-medium text-grey-500 mb-2.5">{item.count}명 참여</div>
              <div className="flex gap-2">
                <button className="h-[30px] px-3.5 rounded-full bg-grey-100 text-[13px] font-bold text-grey-700">
                  수정
                </button>
                <button className="h-[30px] px-3.5 rounded-full bg-red-50 text-[13px] font-bold text-red-500">
                  취소
                </button>
              </div>
            </div>
            <div className="shrink-0">
              <Badge variant={item.status as any}>{item.label}</Badge>
            </div>
          </div>
        ))}

        <div className="opacity-60 grayscale">
          <div className="bg-white border border-grey-200 rounded-2xl p-4 flex gap-3.5">
            <div className="flex flex-col items-center w-10 bg-grey-100 rounded-xl py-1.5 shrink-0">
              <span className="text-[10px] font-bold text-grey-500 tracking-wider">MAR</span>
              <span className="text-[22px] font-bold text-grey-500 leading-none">25</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-bold text-grey-900 truncate mb-1">김치찌개 + 공기밥</h3>
              <p className="text-[13px] font-medium text-grey-600">학생회관 · 12:00</p>
            </div>
            <div className="shrink-0">
              <Badge variant="closed">종료</Badge>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

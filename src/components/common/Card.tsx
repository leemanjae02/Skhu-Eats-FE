import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps {
  thumbnail: string;
  category: string;
  status: "urgent" | "active" | "closed";
  time: string;
  title: string;
  location: string;
  currentParticipants: number;
  maxParticipants: number;
  avatars?: string[];
  className?: string;
}

export function Card({
  thumbnail,
  category,
  status,
  time,
  title,
  location,
  currentParticipants,
  maxParticipants,
  avatars = [],
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-cream-50 border border-grey-200 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform",
        status === "urgent" && "border-l-[3px] border-l-red-500",
        className
      )}
    >
      <div className="flex items-start gap-3.5 p-4 pb-3.5">
        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-[26px] shrink-0">
          {thumbnail}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-1.5 mb-1.5 flex-wrap">
            <Badge variant={status === "urgent" ? "urgent" : "food"}>
              {category}
            </Badge>
            {status === "urgent" && (
              <Badge variant="urgent">마감임박</Badge>
            )}
            {status === "active" && (
              <Badge variant="active">모집중</Badge>
            )}
          </div>
          <div className="text-[16px] font-bold text-grey-900 truncate mb-0.5 tracking-[-0.3px]">
            {title}
          </div>
          <div className="text-[12px] font-medium text-grey-600">
            {location} · {time}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-grey-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-2">
            {avatars.slice(0, 3).map((av, i) => (
              <Avatar key={i} className="w-7 h-7 border-2 border-white">
                <AvatarImage src={av} />
                <AvatarFallback className="bg-primary-200 text-primary-700 text-[10px] font-bold">
                  {String.fromCharCode(65 + i)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {avatars.length > 3 && (
            <span className="text-[11px] font-bold text-grey-700 bg-grey-200 h-[22px] px-2 rounded-full flex items-center">
              +{avatars.length - 3}
            </span>
          )}
          <span className="text-[13px] font-semibold text-grey-700 ml-1">
            {currentParticipants}/{maxParticipants}명
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-[13px] font-bold text-primary-600">
          참여하기 <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

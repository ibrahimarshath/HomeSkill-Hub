import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiFetch } from "@/context/AuthContext";

type Props = {
  userId: number;
  compact?: boolean;
};

export function UserRatingBadge({ userId, compact }: Props) {
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch(`/api/users/${userId}/summary`, { method: "GET" });
        if (!cancelled) {
          setAvg(typeof data.avgRating === "number" ? data.avgRating : null);
          setCount(data.ratingCount ?? 0);
        }
      } catch {
        if (!cancelled) {
          setAvg(null);
          setCount(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (avg == null || count === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        New helper
      </span>
    );
  }

  const rounded = Math.round(avg * 10) / 10;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <Star className="h-3 w-3 fill-accent text-accent" />
        <span>{rounded}</span>
        <span className="text-muted-foreground">({count})</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 text-sm">
      <Star className="h-4 w-4 fill-accent text-accent" />
      <span className="font-medium">{rounded}</span>
      <span className="text-xs text-muted-foreground">({count} reviews)</span>
    </div>
  );
}

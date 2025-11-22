import { useEffect, useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, User, MessageCircle } from "lucide-react";
import { apiFetch, useAuth } from "@/context/AuthContext";

interface UserSummary {
  id: number;
  name: string;
  email: string;
  avgRating: number | null;
  ratingCount: number;
}

interface Review {
  id: number;
  fromUserId: number;
  toUserId: number;
  comment: string;
  score: number;
  createdAt: string;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const { user } = useAuth();

  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, r] = await Promise.all([
          apiFetch(`/api/users/${userId}/summary`, { method: "GET" }),
          apiFetch(`/api/users/${userId}/reviews`, { method: "GET" }),
        ]);
        setSummary(s);
        setReviews(r || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const onSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !userId) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/ratings", {
        method: "POST",
        body: JSON.stringify({ toUserId: userId, score, comment }),
      });
      setComment("");
      // reload summary + reviews
      const [s, r] = await Promise.all([
        apiFetch(`/api/users/${userId}/summary`, { method: "GET" }),
        apiFetch(`/api/users/${userId}/reviews`, { method: "GET" }),
      ]);
      setSummary(s);
      setReviews(r || []);
    } catch (err: any) {
      setError(err?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userId) {
    return <p className="p-8">Invalid user ID.</p>;
  }

  if (loading) {
    return <p className="p-8">Loading profile...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  if (!summary) {
    return <p className="p-8">User not found.</p>;
  }

  const hasRatings = summary.avgRating != null && summary.ratingCount > 0;
  const rounded = hasRatings ? Math.round((summary.avgRating as number) * 10) / 10 : null;

  const canReview = user && user.id !== summary.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container px-4 md:px-8 max-w-3xl space-y-8">
        {/* Header */}
        <Card className="p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{summary.name}</h1>
            <p className="text-sm text-muted-foreground">{summary.email}</p>
            <div className="mt-2 flex items-center gap-3">
              {hasRatings ? (
                <>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">{rounded}</span>
                    <span className="text-xs text-muted-foreground">({summary.ratingCount} reviews)</span>
                  </span>
                </>
              ) : (
                <Badge variant="outline">New helper</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Reviews list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Reviews
          </h2>
          {reviews.length === 0 && (
            <Card className="p-4 text-sm text-muted-foreground">No reviews yet.</Card>
          )}
          {reviews.map((rev) => (
            <Card key={rev.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {[...Array(rev.score)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{rev.comment}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(rev.createdAt).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>

        {/* Leave a review */}
        {canReview && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Leave a review
            </h2>
            <form className="space-y-4" onSubmit={onSubmitReview}>
              <div>
                <label className="text-sm font-medium mb-1 block">Rating (1-5)</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value) || 5)}
                  className="w-24"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Comment</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience working with this helper"
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit review"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, User, MessageCircle, Copy, AlertCircle, LogOut } from "lucide-react";
import { apiFetch, useAuth } from "@/context/AuthContext";

interface UserProfile {
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
  reviewerName?: string;
}

export default function MyProfile() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileData, reviewsData] = await Promise.all([
          apiFetch(`/api/users/${user.id}/summary`, { method: "GET" }),
          apiFetch(`/api/users/${user.id}/reviews`, { method: "GET" }),
        ]);
        setProfile(profileData);
        setReviews(reviewsData || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load profile";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      alert("Logout failed: " + message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?.email || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container px-4 md:px-8 max-w-3xl">
          <p className="text-center text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container px-4 md:px-8 max-w-3xl">
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  const hasRatings = profile?.avgRating != null && profile?.ratingCount > 0;
  const rounded = hasRatings ? Math.round((profile?.avgRating as number) * 10) / 10 : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container px-4 md:px-8 max-w-3xl space-y-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">My Profile</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="p-6 space-y-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0">
              <User className="h-10 w-10 text-primary" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{profile?.name}</h2>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{profile?.email}</span>
                  <button
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Copy email"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  {copied && (
                    <span className="text-xs text-green-600">Copied!</span>
                  )}
                </div>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-4">
                {hasRatings ? (
                  <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(rounded as number)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-sm">{rounded} stars</span>
                    <span className="text-xs text-muted-foreground">
                      ({profile?.ratingCount} {profile?.ratingCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-muted">
                    No reviews yet
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{profile?.ratingCount || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Reviews Received</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-secondary">
              {hasRatings ? (rounded as number).toFixed(1) : "—"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-accent">
              {reviews.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Comments</p>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Reviews & Feedback</h2>
          </div>

          {reviews.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No reviews yet. Complete some tasks to get reviews from task owners!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const reviewDate = new Date(review.createdAt);
                return (
                  <Card key={review.id} className="p-4 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.score
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-semibold text-muted-foreground ml-2">
                            {review.score} star{review.score !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {reviewDate.toLocaleDateString()} at {reviewDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Task Completed
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-900">
            💡 <strong>Tip:</strong> Your profile is visible to task owners. Build your reputation by completing tasks and receiving positive reviews. Higher ratings help you get more task opportunities!
          </p>
        </Card>
      </div>
    </div>
  );
}

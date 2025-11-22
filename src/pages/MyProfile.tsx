import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, User, MessageCircle, Copy, AlertCircle, LogOut, Edit2, Save, X, Camera, Image as ImageIcon } from "lucide-react";
import { apiFetch, useAuth } from "@/context/AuthContext";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  profilePhoto?: string | null;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const startEditing = () => {
    if (profile) {
      setEditingProfile({ ...profile });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingProfile(null);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await apiFetch("/api/users/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (editingProfile) {
        setEditingProfile({ ...editingProfile, profilePhoto: response.url });
      }
      alert("Photo uploaded successfully!");
    } catch (err: any) {
      alert(err?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const saveProfile = async () => {
    if (!editingProfile) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          firstName: editingProfile.firstName,
          lastName: editingProfile.lastName,
          gender: editingProfile.gender,
          phoneNumber: editingProfile.phoneNumber,
          profilePhoto: editingProfile.profilePhoto,
        }),
      });
      setProfile(updated);
      setIsEditing(false);
      setEditingProfile(null);
      alert("Profile updated successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
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
            {/* Profile Photo */}
            <div className="relative flex-shrink-0">
              {isEditing ? (
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    {editingProfile?.profilePhoto ? (
                      <img
                        src={`http://localhost:4001${editingProfile.profilePhoto}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : profile?.profilePhoto ? (
                      <img
                        src={`http://localhost:4001${profile.profilePhoto}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  {profile?.profilePhoto ? (
                    <img
                      src={`http://localhost:4001${profile.profilePhoto}`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                {isEditing ? (
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editingProfile?.firstName || ""}
                          onChange={(e) => setEditingProfile({ ...editingProfile!, firstName: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editingProfile?.lastName || ""}
                          onChange={(e) => setEditingProfile({ ...editingProfile!, lastName: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={editingProfile?.gender || ""}
                        onValueChange={(value) => setEditingProfile({ ...editingProfile!, gender: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={editingProfile?.phoneNumber || ""}
                        onChange={(e) => setEditingProfile({ ...editingProfile!, phoneNumber: e.target.value })}
                        placeholder="+91 1234567890"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="mt-2 bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {profile?.firstName && profile?.lastName 
                          ? `${profile.firstName} ${profile.lastName}`
                          : profile?.name}
                      </h2>

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
                        {profile?.phoneNumber && (
                          <div className="text-sm text-muted-foreground">
                            📞 {profile.phoneNumber}
                          </div>
                        )}
                        {profile?.gender && (
                          <div className="text-sm text-muted-foreground">
                            {profile.gender === "male" ? "👨" : profile.gender === "female" ? "👩" : "👤"} {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startEditing}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}

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

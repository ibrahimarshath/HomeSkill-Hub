import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, MapPin, Clock, Star, Shield, AlertCircle, Briefcase, Home, Wrench, BookOpen, Palette, Heart } from "lucide-react";
import { apiFetch, useAuth } from "@/context/AuthContext";
import { UserRatingBadge } from "@/components/UserRatingBadge";
import { Link } from "react-router-dom";

type UiTask = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: string;
  womenSafe: boolean;
  price: string;
  poster: string;
  posterId: number | null;
  rating: number;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
  latitude?: number | null;
  longitude?: number | null;
  deadline?: string | null;
  images?: string[];
};

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "home":
      return Home;
    case "professional":
      return Briefcase;
    case "teaching":
      return BookOpen;
    case "care":
      return Heart;
    case "creative":
      return Palette;
    case "repair":
      return Wrench;
    default:
      return Briefcase;
  }
}

function getTimeRemaining(deadline: string | null | undefined) {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  
  if (diff < 0) return null; // Expired
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else {
    return `${minutes}m left`;
  }
}

function formatDeadlineDateTime(deadline: string | null | undefined) {
  if (!deadline) return null;
  const date = new Date(deadline);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BrowseTasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [tasks, setTasks] = useState<UiTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [womenSafeOnly, setWomenSafeOnly] = useState(false);
  const [useNearby, setUseNearby] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<UiTask | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { user } = useAuth();

  const nearbyRanges = [2, 5, 10, 20];

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch("/api/tasks", { method: "GET" });
        const mapped: UiTask[] = (data || []).map((t: any) => {
          const Icon = getCategoryIcon(t.category);
          return {
            id: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            location: t.location,
            urgency: t.urgency,
            womenSafe: !!t.womenSafe,
            price: t.budget || "Not specified",
            poster: `User ${t.posterId ?? ""}`,
            posterId: typeof t.posterId === "number" ? t.posterId : null,
            rating: 5,
            status: t.status || "open",
            icon: Icon,
            latitude: typeof t.latitude === "number" ? t.latitude : null,
            longitude: typeof t.longitude === "number" ? t.longitude : null,
            deadline: t.deadline || null,
            images: Array.isArray(t.images) ? t.images : [],
          };
        });
        setTasks(mapped);
      } catch (err: any) {
        setError(err?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || task.category === category;
    const matchesUrgency = urgency === "all" || task.urgency === urgency;
    const matchesWomenSafe = !womenSafeOnly || task.womenSafe;

    let matchesNearby = true;
    if (useNearby && userLat != null && userLng != null) {
      if (task.latitude != null && task.longitude != null) {
        const d = distanceKm(userLat, userLng, task.latitude, task.longitude);
        matchesNearby = d <= radiusKm;
      } else {
        matchesNearby = false;
      }
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesUrgency &&
      matchesWomenSafe &&
      matchesNearby
    );
  });

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-urgent/10 text-urgent border-urgent/20";
      case "medium":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case "high":
        return "Urgent";
      case "medium":
        return "Moderate";
      default:
        return "Flexible";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Tasks</h1>
          <p className="text-lg text-muted-foreground">
            Find tasks that match your skills or post your own
          </p>
        </div>

        {/* Location summary pill */}
        <Card className="mb-6 flex items-center justify-between gap-4 px-4 py-3 shadow-sm bg-muted/40 border-none rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {useNearby && userLat != null && userLng != null
                  ? "Using your current location"
                  : "Location not set"}
              </span>
              <span className="text-xs text-muted-foreground">
                {useNearby && userLat != null && userLng != null
                  ? `Searching within ${radiusKm} km`
                  : "Turn on nearby filter to see closest tasks"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100"
          >
            Viewing as Helper
          </Button>
        </Card>

        {/* Filters */}
        <Card className="p-6 mb-8 shadow-medium">
          <div className="grid md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
                <SelectItem value="professional">Professional Services</SelectItem>
                <SelectItem value="teaching">Teaching & Tutoring</SelectItem>
                <SelectItem value="care">Care & Support</SelectItem>
                <SelectItem value="creative">Creative Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency Levels</SelectItem>
                <SelectItem value="high">Urgent</SelectItem>
                <SelectItem value="medium">Moderate</SelectItem>
                <SelectItem value="low">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Switch
                id="women-safe-only"
                checked={womenSafeOnly}
                onCheckedChange={setWomenSafeOnly}
              />
              <Label htmlFor="women-safe-only" className="text-sm flex items-center gap-1">
                <Shield className="h-4 w-4 text-safe" />
                Women safety verified tasks only
              </Label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Switch
                id="nearby"
                checked={useNearby}
                onCheckedChange={(val) => {
                  if (val && navigator.geolocation && userLat == null && userLng == null) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setUserLat(pos.coords.latitude);
                        setUserLng(pos.coords.longitude);
                      },
                      () => {
                        // If geolocation fails, turn off nearby filter
                        setUseNearby(false);
                      }
                    );
                  }
                  setUseNearby(val);
                }}
              />
              <Label htmlFor="nearby" className="text-sm flex items-center gap-1">
                Nearby tasks (within {radiusKm} km)
              </Label>
              <div className="flex flex-wrap gap-2">
                {nearbyRanges.map((r) => (
                  <Button
                    key={r}
                    type="button"
                    size="sm"
                    variant={radiusKm === r ? "default" : "outline"}
                    className="h-8 rounded-full px-3"
                    onClick={() => setRadiusKm(r)}
                  >
                    {r} km
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <p className="text-muted-foreground col-span-full">Loading tasks...</p>
          )}
          {error && !loading && (
            <p className="text-sm text-red-500 col-span-full flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}
          {!loading && !error && filteredTasks.length === 0 && (
            <p className="text-muted-foreground col-span-full">No tasks found.</p>
          )}
          {!loading && !error &&
            filteredTasks.map((task) => (
            <Card key={task.id} className="p-6 hover:shadow-large transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <task.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex gap-2">
                  <Badge className={getUrgencyColor(task.urgency)}>
                    <Clock className="h-3 w-3 mr-1" />
                    {getUrgencyLabel(task.urgency)}
                  </Badge>
                  {task.womenSafe && (
                    <Badge className="bg-safe/10 text-safe border-safe/20">
                      <Shield className="h-3 w-3 mr-1" />
                      Safe
                    </Badge>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {task.title}
              </h3>
              {task.images && task.images.length > 0 && (
                <div className="mb-3">
                  <img
                    src={`http://localhost:4001${task.images[0]}`}
                    alt={task.title}
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">{task.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {task.location}
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-primary">{task.price}</span>
                </div>
                {task.deadline && (
                  <div className="flex items-center text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 w-fit">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDeadlineDateTime(task.deadline)} ({getTimeRemaining(task.deadline) || "Expired"})
                  </div>
                )}
                {task.status === "pending_approval" && (
                  <div className="flex items-center text-xs">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      Waiting for owner
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-semibold">
                    {task.poster[0]}
                  </div>
                  <span className="text-sm font-medium">{task.poster}</span>
                </div>
                <div className="flex items-center gap-1">
                  {task.posterId != null ? (
                    <UserRatingBadge userId={task.posterId} compact />
                  ) : (
                    <>
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-semibold">{task.rating}</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                type="button"
                onClick={() => {
                  setSelectedTask(task);
                  setDetailsOpen(true);
                }}
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {/* Task Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            {selectedTask && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTask.title}</DialogTitle>
                  <DialogDescription>
                    Posted by {selectedTask.poster}
                    {selectedTask.posterId != null && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <UserRatingBadge userId={selectedTask.posterId} />
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {selectedTask.images && selectedTask.images.length > 0 && (
                    <div className="space-y-2">
                      {selectedTask.images.length === 1 ? (
                        <img
                          src={`http://localhost:4001${selectedTask.images[0]}`}
                          alt={selectedTask.title}
                          className="w-full h-64 object-cover rounded-lg border border-border"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedTask.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:4001${img}`}
                              alt={`${selectedTask.title} - Image ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Badge className={getUrgencyColor(selectedTask.urgency)}>
                        {getUrgencyLabel(selectedTask.urgency)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedTask.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{selectedTask.price}</span>
                    </div>
                    {selectedTask.deadline && (
                      <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 text-xs">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Expires: {formatDeadlineDateTime(selectedTask.deadline)} ({getTimeRemaining(selectedTask.deadline) || "Expired"})</span>
                      </div>
                    )}
                    {selectedTask.womenSafe && (
                      <div className="flex items-center gap-2 text-safe text-xs">
                        <Shield className="h-4 w-4" /> Women safety verified
                      </div>
                    )}
                  </div>
                  {selectedTask.posterId != null && (
                    <div className="flex flex-col gap-3 pt-4 border-t mt-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-semibold">
                            {selectedTask.poster[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{selectedTask.poster}</span>
                            <UserRatingBadge userId={selectedTask.posterId} compact />
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/users/${selectedTask.posterId}`}>
                            View helper profile
                          </Link>
                        </Button>
                      </div>
                      {/* Accept/apply button */}
                      {user ? (
                        user.id === selectedTask.posterId ? (
                          <p className="text-xs text-muted-foreground">
                            You posted this task.
                          </p>
                        ) : selectedTask.status === "assigned" || selectedTask.status === "completed" ? (
                          <p className="text-xs text-muted-foreground">
                            This task is already {selectedTask.status === "assigned" ? "assigned" : "completed"}.
                          </p>
                        ) : (
                          <Button
                            size="sm"
                            className="self-start bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                            onClick={async () => {
                              try {
                                const updated = await apiFetch(`/api/tasks/${selectedTask.id}/accept`, {
                                  method: "POST",
                                });
                                setSelectedTask({ ...selectedTask, status: updated.status });
                                alert("Task accepted! Waiting for owner to assign you.");
                              } catch (err: any) {
                                // Simple inline error state
                                alert(err?.message || "Failed to accept task");
                              }
                            }}
                          >
                            Accept this task
                          </Button>
                        )
                      ) : (
                        <Button asChild size="sm" variant="outline" className="self-start">
                          <Link to="/login">Log in to accept this task</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Load More Tasks
          </Button>
        </div>
      </div>
    </div>
  );
}

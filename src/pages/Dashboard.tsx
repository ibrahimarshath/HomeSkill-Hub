import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, MapPin, CheckCircle2, ListChecks, AlertCircle, User, CheckCheck, Star, MessageSquare, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/context/AuthContext";
import { UserRatingBadge } from "@/components/UserRatingBadge";

type Task = {
  id: number;
  title: string;
  status: string;
  urgency: string;
  location: string;
  posterId?: number;
  assignedToUserId?: number;
  acceptances?: Array<{ userId: number; acceptedAt: string }>;
  deadline?: string | null;
  images?: string[];
};

type HelperInfo = {
  userId: number;
  userName: string;
  acceptedAt: string;
};

const statusLabel: Record<string, string> = {
  open: "Open",
  pending_approval: "Pending Approval",
  assigned: "In Progress",
  completed: "Completed",
  accepted: "In Progress",
  closed: "Closed",
};

const statusColor: Record<string, string> = {
  open: "bg-secondary/10 text-secondary border-secondary/20",
  pending_approval: "bg-amber-100 text-amber-800 border-amber-200",
  assigned: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-safe/10 text-safe border-safe/20",
  accepted: "bg-accent/10 text-accent border-accent/20",
};

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

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<Task | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [helpers, setHelpers] = useState<HelperInfo[]>([]);
  const [helperDetails, setHelperDetails] = useState<Record<number, any>>({});
  const [assigningHelper, setAssigningHelper] = useState<number | null>(null);
  
  // Review state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [taskForReview, setTaskForReview] = useState<Task | null>(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingTask, setDeletingTask] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [mine, accepted] = await Promise.all([
          apiFetch("/api/tasks/mine", { method: "GET" }),
          apiFetch("/api/tasks/accepted", { method: "GET" }),
        ]);
        setPostedTasks(mine || []);
        setAcceptedTasks(accepted || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const handleAssignTask = async (task: Task) => {
    if (!task.acceptances || task.acceptances.length === 0) return;
    
    setSelectedTaskForAssignment(task);
    
    // Fetch helper details for each acceptance
    const helperInfoList: HelperInfo[] = task.acceptances.map((a) => ({
      userId: a.userId,
      userName: `Helper ${a.userId}`,
      acceptedAt: a.acceptedAt,
    }));
    
    setHelpers(helperInfoList);
    
    // Fetch user details from the database
    for (const acceptance of task.acceptances) {
      try {
        const userInfo = await apiFetch(`/api/users/${acceptance.userId}`, { method: "GET" });
        setHelperDetails(prev => ({
          ...prev,
          [acceptance.userId]: userInfo
        }));
      } catch (err) {
        console.error(`Failed to fetch user ${acceptance.userId}:`, err);
      }
    }
    
    setAssignmentDialogOpen(true);
  };

  const assignToHelper = async (userId: number) => {
    if (!selectedTaskForAssignment) return;
    
    setAssigningHelper(userId);
    try {
      const updated = await apiFetch(`/api/tasks/${selectedTaskForAssignment.id}/assign`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      
      // Update local state
      setPostedTasks(postedTasks.map(t => t.id === updated.id ? updated : t));
      setAssignmentDialogOpen(false);
      setSelectedTaskForAssignment(null);
      setHelpers([]);
      setHelperDetails({});
    } catch (err: any) {
      alert(err?.message || "Failed to assign task");
    } finally {
      setAssigningHelper(null);
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      const updated = await apiFetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
      });
      
      // Update local state
      setAcceptedTasks(acceptedTasks.map(t => t.id === updated.id ? updated : t));
      setPostedTasks(postedTasks.map(t => t.id === updated.id ? updated : t));
    } catch (err: any) {
      alert(err?.message || "Failed to complete task");
    }
  };

  const openReviewDialog = (task: Task) => {
    setTaskForReview(task);
    setReviewScore(5);
    setReviewComment("");
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!taskForReview || !taskForReview.assignedToUserId) return;
    
    setSubmittingReview(true);
    try {
      await apiFetch("/api/ratings", {
        method: "POST",
        body: JSON.stringify({
          toUserId: taskForReview.assignedToUserId,
          score: reviewScore,
          comment: reviewComment,
          taskId: taskForReview.id,
        }),
      });
      
      setReviewDialogOpen(false);
      setTaskForReview(null);
      alert("Review submitted successfully!");
      
      // Reload tasks
      const [mine, accepted] = await Promise.all([
        apiFetch("/api/tasks/mine", { method: "GET" }),
        apiFetch("/api/tasks/accepted", { method: "GET" }),
      ]);
      setPostedTasks(mine || []);
      setAcceptedTasks(accepted || []);
    } catch (err: any) {
      alert(err?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container px-4 md:px-8 max-w-5xl">
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your posted tasks and track the ones you've accepted.
            </p>
          </div>
          <Button asChild>
            <Link to="/post-task">Post New Task</Link>
          </Button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading && <p className="text-muted-foreground mb-4">Loading your tasks...</p>}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Posted Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your Posted Tasks</h2>
            </div>
            {postedTasks.length === 0 && !loading && (
              <Card className="p-4 text-sm text-muted-foreground">
                You haven't posted any tasks yet. <Link to="/post-task" className="text-primary underline">Post your first task</Link>.
              </Card>
            )}
            <div className="space-y-4 mt-2">
              {postedTasks.map((task) => (
                <Card key={task.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <Badge className={statusColor[task.status] || statusColor.open}>
                      {statusLabel[task.status] || statusLabel.open}
                    </Badge>
                  </div>
                  {task.images && task.images.length > 0 && (
                    <div>
                      <img
                        src={`http://localhost:4001${task.images[0]}`}
                        alt={task.title}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{task.urgency === "high" ? "Urgent" : task.urgency === "medium" ? "Moderate" : "Flexible"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{task.location}</span>
                  </div>
                  {task.deadline && (
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 w-fit">
                      <Clock className="h-3 w-3" />
                      <span>{formatDeadlineDateTime(task.deadline)} ({getTimeRemaining(task.deadline) || "Expired"})</span>
                    </div>
                  )}
                  
                  {/* Show acceptances and assignment UI */}
                  {task.status === "pending_approval" && task.acceptances && task.acceptances.length > 0 && (
                    <div className="pt-3 border-t mt-2">
                      <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-xs font-semibold text-amber-900">
                          {task.acceptances.length} helper{task.acceptances.length !== 1 ? "s" : ""} interested in this task!
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                        onClick={() => handleAssignTask(task)}
                      >
                        <User className="h-3 w-3 mr-1" />
                        Review & Select a Helper
                      </Button>
                    </div>
                  )}

                  {task.status === "assigned" && (
                    <div className="pt-3 border-t mt-2 text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                      <p>✓ Helper assigned and working on this task</p>
                    </div>
                  )}

                  {task.status === "completed" && (
                    <div className="pt-3 border-t mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-safe/20 text-safe border-safe/30">
                          <CheckCheck className="h-3 w-3 mr-1" />
                          Task Completed
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => openReviewDialog(task)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Leave a Review
                      </Button>
                    </div>
                  )}

                  {/* Status Toggle and Delete for Task Owner */}
                  <div className="pt-3 border-t mt-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">Status:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={task.status === "open" ? "default" : "outline"}
                          onClick={async () => {
                            try {
                              const updated = await apiFetch(`/api/tasks/${task.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ status: "open" }),
                              });
                              setPostedTasks(postedTasks.map(t => t.id === updated.id ? updated : t));
                            } catch (err: any) {
                              alert(err?.message || "Failed to update status");
                            }
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant={task.status === "completed" ? "default" : "outline"}
                          onClick={async () => {
                            try {
                              const updated = await apiFetch(`/api/tasks/${task.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ status: "completed" }),
                              });
                              setPostedTasks(postedTasks.map(t => t.id === updated.id ? updated : t));
                            } catch (err: any) {
                              alert(err?.message || "Failed to update status");
                            }
                          }}
                        >
                          Completed
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                          return;
                        }
                        setDeletingTask(task.id);
                        try {
                          await apiFetch(`/api/tasks/${task.id}`, {
                            method: "DELETE",
                          });
                          setPostedTasks(postedTasks.filter(t => t.id !== task.id));
                          alert("Task deleted successfully");
                        } catch (err: any) {
                          alert(err?.message || "Failed to delete task");
                        } finally {
                          setDeletingTask(null);
                        }
                      }}
                      disabled={deletingTask === task.id}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {deletingTask === task.id ? "Deleting..." : "Delete Task"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Accepted Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <h2 className="text-xl font-semibold">Tasks You've Accepted</h2>
            </div>
            {acceptedTasks.length === 0 && !loading && (
              <Card className="p-4 text-sm text-muted-foreground">
                You haven't accepted any tasks yet.
              </Card>
            )}
            <div className="space-y-4 mt-2">
              {acceptedTasks.map((task) => (
                <Card key={task.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <Badge className={statusColor[task.status] || statusColor.assigned}>
                      {statusLabel[task.status] || statusLabel.assigned}
                    </Badge>
                  </div>
                  {task.images && task.images.length > 0 && (
                    <div>
                      <img
                        src={`http://localhost:4001${task.images[0]}`}
                        alt={task.title}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{task.urgency === "high" ? "Urgent" : task.urgency === "medium" ? "Moderate" : "Flexible"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{task.location}</span>
                  </div>
                  {task.deadline && (
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 w-fit">
                      <Clock className="h-3 w-3" />
                      <span>{formatDeadlineDateTime(task.deadline)} ({getTimeRemaining(task.deadline) || "Expired"})</span>
                    </div>
                  )}

                  {/* Show completion button if assigned to current user */}
                  {task.status === "assigned" && (
                    <div className="pt-3 border-t mt-2">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-safe to-safe/80 hover:opacity-90"
                        onClick={() => completeTask(task.id)}
                      >
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Mark as Completed
                      </Button>
                    </div>
                  )}

                  {task.status === "completed" && (
                    <div className="pt-3 border-t mt-2">
                      <Badge className="bg-safe/20 text-safe border-safe/30">
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Completed ✓
                      </Badge>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Helper Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Review & Select a Helper</DialogTitle>
            <DialogDescription>
              Click on a helper to assign them to this task. They'll be notified and can start working immediately.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTaskForAssignment && (
            <div className="flex flex-col gap-4 overflow-y-auto flex-1">
              {/* Task Info Card */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-lg">
                <h3 className="font-semibold text-base">{selectedTaskForAssignment.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTaskForAssignment.urgency === "high" ? "🔴 Urgent" : selectedTaskForAssignment.urgency === "medium" ? "🟡 Moderate" : "🟢 Flexible"}
                </p>
              </div>

              {/* Helpers List */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Available Helpers
                </p>
                
                {helpers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Loading helpers...</p>
                ) : (
                  <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                    {helpers.map((helper, idx) => {
                      const details = helperDetails[helper.userId];
                      const acceptDate = new Date(helper.acceptedAt);
                      
                      return (
                        <div key={helper.userId} className="flex gap-2 items-stretch">
                          <Button
                            variant="outline"
                            className="justify-start h-auto py-3 px-4 border-2 hover:border-primary hover:bg-primary/5 transition-all flex-1"
                            onClick={() => assignToHelper(helper.userId)}
                            disabled={assigningHelper === helper.userId}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">
                                    {details?.name || `Helper ${idx + 1}`}
                                  </p>
                                  {details?.id && (
                                    <UserRatingBadge userId={details.id} compact />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Accepted {acceptDate.toLocaleDateString()} at {acceptDate.toLocaleTimeString()}
                                </p>
                              </div>
                              {assigningHelper === helper.userId && (
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-semibold text-primary">Assigning...</p>
                                </div>
                              )}
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0"
                            asChild
                          >
                            <Link to={`/users/${helper.userId}`}>
                              View Profile
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="pt-3 border-t text-xs text-muted-foreground bg-blue-50 p-3 rounded">
                <p>💡 <strong>Tip:</strong> Click on any helper above to assign them to your task. They will receive a notification and can begin work immediately.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience working with this helper
            </DialogDescription>
          </DialogHeader>

          {taskForReview && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm">{taskForReview.title}</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Rating (1-5 stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setReviewScore(num)}
                        className={`transition-all ${
                          num <= reviewScore
                            ? "text-accent scale-110"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Star
                          className="h-6 w-6"
                          fill={num <= reviewScore ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Comments (optional)</label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="How was your experience? What could be improved?"
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

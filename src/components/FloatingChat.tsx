import { useState, useEffect } from "react";
import { TaskChat } from "./TaskChat";
import { Button } from "@/components/ui/button";
import { X, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FloatingChatProps {
  taskId: number | null;
  otherUserId: number | null;
  otherUserName: string;
  taskTitle?: string;
  position?: "left" | "right";
}

export function FloatingChat({ 
  taskId, 
  otherUserId, 
  otherUserName, 
  taskTitle,
  position = "right" 
}: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Auto-open if taskId is provided
    if (taskId && otherUserId) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [taskId, otherUserId]);

  if (!taskId || !otherUserId) {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button - Floating */}
      {!isOpen && (
        <Button
          className={`fixed ${position === "right" ? "right-6" : "left-6"} bottom-6 h-14 w-14 rounded-full shadow-lg z-40 bg-gradient-to-r from-primary to-secondary hover:opacity-90`}
          size="icon"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className={`fixed ${position === "right" ? "right-0" : "left-0"} top-0 h-full w-full md:w-[400px] z-50 bg-background border-l ${position === "right" ? "border-l" : "border-r"} shadow-2xl flex flex-col`}
        >
          <Card className="flex-1 flex flex-col m-4 mb-0 rounded-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{otherUserName}</h3>
                  {taskTitle && (
                    <p className="text-xs text-muted-foreground truncate">{taskTitle}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <TaskChat
                taskId={taskId}
                otherUserId={otherUserId}
                otherUserName={otherUserName}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}


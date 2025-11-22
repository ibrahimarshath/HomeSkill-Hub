import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Image as ImageIcon, Video, X } from "lucide-react";
import { apiFetch, useAuth } from "@/context/AuthContext";

interface Message {
  id: number;
  taskId: number;
  fromUserId: number;
  toUserId: number;
  message: string;
  createdAt: string;
  fromUserName?: string;
  mediaType?: "image" | "video";
  mediaUrl?: string;
}

interface TaskChatProps {
  taskId: number;
  otherUserId: number;
  otherUserName: string;
}

export function TaskChat({ taskId, otherUserId, otherUserName }: TaskChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/chat/${taskId}`, { method: "GET" });
        setMessages(data || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [taskId, user]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Please select an image or video file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setSelectedMedia(file);
    setMediaType(isImage ? "image" : "video");

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedMedia) || !user) return;

    setSending(true);
    try {
      let mediaUrl = null;
      let finalMediaType = null;

      // Upload media if selected
      if (selectedMedia) {
        const formData = new FormData();
        formData.append("file", selectedMedia);
        formData.append("type", mediaType || "");

        const uploadResponse = await apiFetch("/api/chat/upload", {
          method: "POST",
          body: formData,
          headers: {},
        });
        mediaUrl = uploadResponse.url;
        finalMediaType = mediaType;
      }

      const message = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          taskId,
          toUserId: otherUserId,
          message: newMessage.trim() || "",
          mediaType: finalMediaType,
          mediaUrl: mediaUrl,
        }),
      });
      setMessages([...messages, message]);
      setNewMessage("");
      removeMedia();
    } catch (err: any) {
      alert(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please log in to chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {loading && messages.length === 0 ? (
          <p className="text-center text-muted-foreground">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.fromUserId === user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.mediaUrl && (
                    <div className="mb-2">
                      {msg.mediaType === "image" ? (
                        <img
                          src={`http://localhost:4001${msg.mediaUrl}`}
                          alt="Shared image"
                          className="max-w-full rounded-lg cursor-pointer"
                          onClick={() => window.open(`http://localhost:4001${msg.mediaUrl}`, "_blank")}
                        />
                      ) : (
                        <video
                          src={`http://localhost:4001${msg.mediaUrl}`}
                          controls
                          className="max-w-full rounded-lg"
                        />
                      )}
                    </div>
                  )}
                  {msg.message && <p className="text-sm">{msg.message}</p>}
                  <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        {mediaPreview && (
          <div className="mb-2 relative inline-block">
            {mediaType === "image" ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg border"
              />
            ) : (
              <video
                src={mediaPreview}
                className="h-20 w-20 object-cover rounded-lg border"
              />
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={removeMedia}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleMediaSelect}
            className="hidden"
            id="chat-media-input"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={sending || (!newMessage.trim() && !selectedMedia)}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


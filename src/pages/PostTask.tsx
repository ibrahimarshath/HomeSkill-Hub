import { FormEvent, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Shield, MapPin, Image as ImageIcon, X } from "lucide-react";
import { apiFetch } from "@/context/AuthContext";
import { RupeeIcon } from "@/components/RupeeIcon";

export default function PostTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [womenSafe, setWomenSafe] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleGoogleMapsLinkChange = (link: string) => {
    setGoogleMapsLink(link);
    // Try to extract coordinates from Google Maps link if it's a share link
    // Format: https://www.google.com/maps?q=lat,lng or https://maps.google.com/?q=lat,lng
    const match = link.match(/[?&]q=([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setLatitude(lat);
        setLongitude(lng);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > 5) {
      setError("You can upload a maximum of 5 images.");
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) {
        setError(`${file.name} is not a valid image file.`);
        return false;
      }
      if (!isValidSize) {
        setError(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    setSelectedImages([...selectedImages, ...validFiles]);
    
    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const formData = new FormData();
    selectedImages.forEach((file) => {
      formData.append("images", file);
    });

    const response = await apiFetch("/api/tasks/upload-images", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    return response.imageUrls || [];
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description || !category || !urgency || !location || !deadline) {
      setError("Please fill in all required fields including deadline.");
      return;
    }

    if (category === "other" && !customCategory.trim()) {
      setError("Please enter a custom category.");
      return;
    }

    // Validate deadline is in future
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      setError("Deadline must be in the future.");
      return;
    }

    setLoading(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          category: category === "other" ? customCategory : category,
          urgency,
          location,
          budget: budget || null,
          womenSafe,
          deadline: deadlineDate.toISOString(),
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          images: imageUrls,
          googleMapsLink: googleMapsLink || null,
        }),
      });
      setSuccess("Task posted successfully.");
      // Clear form
      setTitle("");
      setDescription("");
      setCategory("");
      setCustomCategory("");
      setUrgency("");
      setLocation("");
      setBudget("");
      setDeadline("");
      setWomenSafe(false);
      setLatitude(null);
      setLongitude(null);
      setGoogleMapsLink("");
      setSelectedImages([]);
      setImagePreviews([]);
      setUploadedImageUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Navigate to dashboard to view posted tasks
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Failed to post task";
      setError(msg);
      if (msg === "Not authenticated") {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container px-4 md:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Post a Task</h1>
          <p className="text-lg text-muted-foreground">
            Tell us what you need help with and connect with skilled community members
          </p>
        </div>

        {/* Form */}
        <Card className="p-8 shadow-large">
          <form className="space-y-8" onSubmit={onSubmit}>
            {/* Basic Info */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Need help with plumbing repair"
                  className="mt-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about what you need..."
                  className="mt-2 min-h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="images" className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Photos (Optional - up to 5 images)
                </Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Add photos to help helpers understand the task better. Max 5 images, 5MB each.
                </p>
                
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-base">Category *</Label>
                  <Select value={category} onValueChange={(value) => {
                    setCategory(value);
                    if (value !== "other") {
                      setCustomCategory("");
                    }
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="professional">Professional Services</SelectItem>
                      <SelectItem value="teaching">Teaching & Tutoring</SelectItem>
                      <SelectItem value="repair">Repair & Maintenance</SelectItem>
                      <SelectItem value="care">Care & Support</SelectItem>
                      <SelectItem value="creative">Creative Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {category === "other" && (
                    <Input
                      id="customCategory"
                      placeholder="Enter your category"
                      className="mt-2"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      required
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="urgency" className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Urgency Level *
                  </Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-secondary/10 text-secondary">Flexible</Badge>
                          <span>- No rush</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-accent/10 text-accent">Moderate</Badge>
                          <span>- Within a week</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-urgent/10 text-urgent">Urgent</Badge>
                          <span>- ASAP</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deadline" className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Deadline (Task Expiry) *
                  </Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    className="mt-2"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Task will be removed from listings after this date
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Budget */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location & Price
              </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location" className="text-base">Location *</Label>
                <Input
                  id="location"
                  placeholder="Enter your area/neighborhood"
                  className="mt-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="googleMapsLink" className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Google Maps Link (Optional)
                </Label>
                <Input
                  id="googleMapsLink"
                  placeholder="Paste Google Maps link here (e.g., https://maps.google.com/?q=12.9716,77.5946)"
                  className="mt-2"
                  value={googleMapsLink}
                  onChange={(e) => handleGoogleMapsLinkChange(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Paste a Google Maps share link to help helpers find your location easily
                </p>
                {latitude && longitude && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Coordinates extracted: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                  <Label htmlFor="budget" className="text-base flex items-center gap-2">
                    <RupeeIcon className="h-4 w-4" />
                    Fixed Price
                  </Label>
                  <Input
                    id="budget"
                    placeholder="e.g., ₹500"
                    className="mt-2"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter the fixed price in rupees you're willing to pay for this task
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Options */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-safe" />
                Safety Preferences
              </h3>

              <Card className="p-6 bg-safe/5 border-safe/20">
                <div className="flex items-start gap-4">
                  <Shield className="h-5 w-5 text-safe mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="women-safe" className="text-base font-semibold">
                        Women Safety Verified Only
                      </Label>
                      <Switch
                        id="women-safe"
                        checked={womenSafe}
                        onCheckedChange={setWomenSafe}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only show this task to verified women providers or allow women-only applications.
                      This helps ensure a safer environment for female task posters.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post Task"}
              </Button>
              <Button type="button" size="lg" variant="outline" className="text-lg" disabled={loading}>
                Save Draft
              </Button>
            </div>
          </form>
        </Card>

        {/* Tips Card */}
        <Card className="p-6 mt-8 bg-accent/5 border-accent/20">
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-accent" />
            Tips for a Great Task Post
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Be specific about what you need - clear descriptions get better responses</li>
            <li>• Set a fair fixed price based on the complexity of the task</li>
            <li>• Use urgency levels appropriately to attract the right helpers</li>
            <li>• Enable safety features if working with sensitive situations</li>
            <li>• Respond promptly to applications to keep community trust high</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

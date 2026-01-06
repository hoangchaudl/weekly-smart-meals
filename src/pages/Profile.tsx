import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";

export default function Profile() {
  const { session } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (session?.user) {
      const { user_metadata, email } = session.user;
      setFullName(user_metadata.full_name || "");
      setAvatarUrl(user_metadata.avatar_url || null);
    }
  }, [session]);

  // Handle Image Upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${session?.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 3. Update Local State immediately for preview
      setAvatarUrl(data.publicUrl);

      toast({
        title: "Image uploaded!",
        description: "Don't forget to save changes.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle Text Profile Updates
  const updateProfile = async () => {
    try {
      setLoading(true);

      // Update Supabase Auth User
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl, // Save the new image URL
        },
      });

      if (error) throw error;
      toast({ title: "Success", description: "Profile updated successfully!" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Account Info" subtitle="Manage your profile details">
      <div className="max-w-xl mx-auto space-y-8 bg-card p-8 rounded-2xl shadow-sm border border-border mt-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background shadow-md">
              <AvatarImage src={avatarUrl || ""} objectFit="cover" />
              <AvatarFallback className="text-4xl bg-secondary">
                {fullName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Overlay Upload Button */}
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-medium"
            >
              {uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </div>
          <p className="text-sm text-muted-foreground">Click image to change</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              value={session?.user.email || ""}
              disabled
              className="bg-muted text-muted-foreground"
            />
            <p className="text-[10px] text-muted-foreground">
              Email cannot be changed securely here.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value="kp567839012"
              disabled
              className="bg-muted text-muted-foreground font-mono tracking-widest"
            />
            <p className="text-[10px] text-muted-foreground">
              Passwords are encrypted and hidden for your security.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <Button
            onClick={updateProfile}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}

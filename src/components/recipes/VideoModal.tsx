import { X } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

export function VideoModal({ open, url, onClose }: VideoModalProps) {
  if (!open || !url) return null;

  const getEmbedUrl = (raw: string) => {
    if (raw.includes("youtube.com") || raw.includes("youtu.be")) {
      const id =
        raw.split("v=")[1]?.split("&")[0] ||
        raw.split("youtu.be/")[1]?.split("?")[0] ||
        raw.split("shorts/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return raw;
  };

  const embedUrl = getEmbedUrl(url);
  const isVideoFile = embedUrl.endsWith(".mp4") || embedUrl.endsWith(".webm");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative bg-card rounded-3xl shadow-float w-full max-w-3xl aspect-video overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {isVideoFile ? (
          <video
            src={embedUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

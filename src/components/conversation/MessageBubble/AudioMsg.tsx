import { AudioMsgProps } from "./types";
import { Play, Pause } from "lucide-react";
import { memo, useState, useEffect, useCallback } from "react";

export const AudioMsg = memo(function AudioMsg({ url, isOwn }: AudioMsgProps) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => setCurrent(audio.currentTime));
    audio.addEventListener("ended", () => {
      setPlaying(false);
      setCurrent(0);
    });
    setAudioElement(audio);
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [url]);

  const toggle = useCallback(() => {
    if (!audioElement) return;
    if (playing) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setPlaying(!playing);
  }, [audioElement, playing]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  if (!url) return null;

  const waveformBars = 30;
  const bars = Array.from({ length: waveformBars }).map((_, i) => {
    const progress = duration > 0 ? current / duration : 0;
    const height = 15 + Math.sin(i * 0.5 + 2) * 35 + Math.random() * 20;
    const isActive = i / waveformBars <= progress;
    return { height: Math.max(8, height), isActive };
  });

  return (
    <div className={`flex items-center gap-3 py-3 px-2 rounded cursor-pointer active:scale-[0.98] transition-transform ${isOwn ? "bg-[#d9fdd3] hover:bg-[#cff5c5]" : "bg-[#f0f2f5] hover:bg-[#e4e6e9]"}`} onClick={toggle} role="button" aria-label={playing ? "Pause audio" : "Play audio"}>
      <button className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOwn ? "bg-[#00a884] hover:bg-[#008f6d]" : "bg-[#54656f] hover:bg-[#3d4a51]"}`}>
        {playing ? (
          <Pause size={18} className="text-white" fill="white" />
        ) : (
          <Play size={18} className="text-white ml-0.5" fill="white" />
        )}
      </button>

      {/* Waveform */}
      <div className="flex-1 h-10 flex items-center gap-0.5">
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              bar.isActive
                ? isOwn
                  ? "bg-[#00a884]"
                  : "bg-[#54656f]"
                : isOwn
                ? "bg-[#00a884]/40"
                : "bg-[#54656f]/40"
            }`}
            style={{ height: `${bar.height}%`, minHeight: "4px" }}
          />
        ))}
      </div>

      <span className="text-xs text-[#667781] shrink-0 tabular-nums">{fmt(current || 0)} / {fmt(duration || 0)}</span>
    </div>
  );
});

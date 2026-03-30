import { memo } from "react";
import { TextMsgProps } from "./types";

export const TextMsg = memo(function TextMsg({ text }: TextMsgProps) {
  if (!text) return null;
  return (
    <span className="text-[15.4px] text-[#111921] dark:text-[#e9ecef] whitespace-pre-wrap wrap-break-word leading-relaxed">{text}</span>
  );
});

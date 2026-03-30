import { memo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { TaskListMsgProps } from "./types";

export const TaskListMsg = memo(function TaskListMsg({ taskList, taskTitle, isOwn }: TaskListMsgProps) {
  if (!taskList || taskList.length === 0) return null;

  return (
    <div className={`min-w-48 md:min-w-56 rounded-lg p-1.5 md:p-2`}>
      {taskTitle && (
        <div className="text-xs md:text-sm font-medium text-[#111921] dark:text-[#e9ecef] mb-1.5 md:mb-2 pb-1.5 md:pb-2 border-b border-[#667781]">{taskTitle}</div>
      )}
      {taskList.map((task) => (
        <div key={task.sortOrder} className="flex items-start gap-1.5 md:gap-2 py-1 md:py-1.5 border-b last:border-b-0 border-[#667781]">
          {task.isCompleted ? (
            <CheckCircle2 size={16} className="text-[#00a884] shrink-0 mt-0.5" />
          ) : (
            <Circle size={16} className="text-[#667781] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] md:text-[14px] ${task.isCompleted ? "text-[#667781] line-through" : "text-[#111921] dark:text-[#e9ecef]"}`}>{task.title}</p>
            {task.status && (
              <span className={`text-[10px] md:text-[11px] text-[#00a884]`}>{task.status}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

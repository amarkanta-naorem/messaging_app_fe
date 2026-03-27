import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { SendHorizontal, Paperclip, X, File, Video, Mic, Plus, ListTodo } from "lucide-react";

interface FileAttachment {
  file: File;
  preview?: string;
  type: "image" | "video" | "audio" | "document";
}

interface TaskItem {
  id?: string;
  title: string;
  status: string;
  sortOrder?: number;
  isCompleted?: boolean;
}

interface MessageInputProps {
  onSend: (text: string, attachments?: FileAttachment[], contentType?: string, taskList?: TaskItem[], taskTitle?: string) => void;
  onFileUpload?: (file: File) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
}

function getFileType(mimeType: string): FileAttachment["type"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

// Status options for the dropdown
const STATUS_OPTIONS = [
  { value: "In Progress", label: "In Progress", color: "blue", bgColor: "bg-(--color-info)/10", borderColor: "border-(--color-info)/30", textColor: "text-(--color-info)" },
  { value: "On Hold", label: "On Hold", color: "amber", bgColor: "bg-(--color-warning)/10", borderColor: "border-(--color-warning)/30", textColor: "text-(--color-warning)" },
  { value: "Completed", label: "Completed", color: "emerald", bgColor: "bg-(--color-success)/10", borderColor: "border-(--color-success)/30", textColor: "text-(--color-success)" },
];

interface StatusDropdownProps {
  value: string;
  onChange: (status: string) => void;
  index?: number;
}

function StatusDropdown({ value, onChange, index = 0}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === value) || STATUS_OPTIONS[0];

  const filteredOptions = STATUS_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(inputValue.toLowerCase()));

  // Smart positioning: First 3 items (index 0,1,2) → dropdown downward, 4th and beyond (index >= 3) → upward
  const shouldOpenUpward = index >= 3;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInputValue("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setInputValue("");
  };

  const handleCustomInput = () => {
    if (inputValue.trim()) {
      onChange(inputValue.trim());
      setIsOpen(false);
      setInputValue("");
    }
  };

  const statusColors: Record<string, string> = {
    "In Progress": "bg-(--color-info)",
    "On Hold": "bg-(--color-warning)",
    Completed: "bg-(--color-success)",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8 px-2.5 pr-8 text-xs font-medium rounded-lg border 
          ${currentOption.borderColor} ${currentOption.bgColor} ${currentOption.textColor} 
          flex items-center gap-2 hover:opacity-90 transition-all duration-200 min-w-27`}
      >
        <span className={`w-2 h-2 rounded-full ${statusColors[value] || "bg-(--text-muted)"} shrink-0`} />
        <span className="truncate">{currentOption.label}</span>
        
        <svg
          className={`absolute right-2.5 w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-100 w-full min-w-35 bg-(--bg-card) 
            rounded-xl shadow-xl border border-(--border-primary) 
            overflow-hidden animate-in fade-in duration-200
            ${shouldOpenUpward ? "bottom-full mb-1 slide-in-from-bottom-2" : "top-full mt-1 slide-in-from-top-2"}
          `}
          style={{
            // Prevent clipping by ensuring it's not constrained by parent overflow
            transformOrigin: shouldOpenUpward ? "bottom center" : "top center",
          }}
        >
          {/* Custom input field */}
          <div className="p-2 border-b border-(--border-primary)">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type custom status..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCustomInput();
                }
                if (e.key === "Escape") {
                  setIsOpen(false);
                  setInputValue("");
                }
              }}
              className="w-full h-8 px-3 text-xs bg-(--bg-input) 
                border border-(--border-secondary) rounded-lg 
                text-(--text-primary) placeholder:text-(--text-muted) 
                outline-none focus:border-(--accent-primary) focus:ring-1 focus:ring-(--accent-glow)"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 
                    hover:bg-(--bg-hover) transition-colors
                    ${value === option.value 
                      ? "bg-(--accent-muted) text-(--accent-primary)" 
                      : "text-(--text-primary)"
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusColors[option.value]}`} />
                  <span>{option.label}</span>
                  {value === option.value && (
                    <svg className="w-3 h-3 ml-auto text-(--color-success)" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-center text-(--text-muted)">
                Press Enter to add "{inputValue}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MessageInput({ onSend, onFileUpload, placeholder = "Type a message...", disabled = false, isSending = false }: MessageInputProps) {
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([{ id: "1", title: "", status: "In Progress" }]);
  const [taskTitle, setTaskTitle] = useState("");
  const taskModalRef = useRef<HTMLDivElement>(null);
  const taskInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close task modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (taskModalRef.current && !taskModalRef.current.contains(event.target as Node)) {
        setIsTaskModalOpen(false);
      }
    };

    if (isTaskModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTaskModalOpen]);

  // Focus on the last task input when the task modal opens
  useEffect(() => {
    if (isTaskModalOpen && taskInputRefs.current.length > 0) {
      const lastInput = taskInputRefs.current[taskInputRefs.current.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, [isTaskModalOpen]);

  const handleSend = () => {
    const text = inputText.trim();
    if ((!text && attachments.length === 0) || disabled || isSending) return;
    
    onSend(text, attachments.length > 0 ? attachments : undefined);
    setInputText("");
    setAttachments([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 2MB as per API)
      if (file.size > 2 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 2MB.`);
        continue;
      }

      const attachment: FileAttachment = {
        file,
        type: getFileType(file.type),
      };

      // Create preview for images
      if (attachment.type === "image") {
        attachment.preview = URL.createObjectURL(file);
      }

      newAttachments.push(attachment);
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    const attachment = attachments[index];
    if (attachment.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Task handler functions
  const addTask = () => {
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: "",
      status: "In Progress",
    };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    
    // Focus on the newly added task input (last one)
    setTimeout(() => {
      const lastIndex = newTasks.length - 1;
      const lastInput = taskInputRefs.current[lastIndex];
      if (lastInput) {
        lastInput.focus();
      }
    }, 0);
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  const updateTaskTitle = (id: string, title: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, title } : task)));
  };

  const updateTaskStatus = (id: string, status: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)));
  };

  const sendTaskMessage = () => {
    const validTasks = tasks.filter((task) => task.title.trim() !== "");
    if (validTasks.length === 0) return;

    const taskListData = validTasks.map((task, index) => ({
      sortOrder: index + 1,
      title: task.title,
      isCompleted: false,
      status: task.status,
    }));

    onSend("", [], "task", taskListData, taskTitle || undefined);
    setTasks([{ id: "1", title: "", status: "In Progress" }]);
    setTaskTitle("");
    setIsTaskModalOpen(false);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative bg-(--header-bg) theme-header-bg px-4 py-2 shrink-0">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative group shrink-0">
                {attachment.type === "image" && attachment.preview ? (
                  <div className="relative">
                    <img src={attachment.preview} alt={attachment.file.name} className="w-20 h-20 object-cover rounded-lg"/>
                    <button type="button" onClick={() => removeAttachment(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-(--bg-input) px-3 py-2 rounded-lg">
                    {attachment.type === "video" ? (
                      <Video size={16} className="text-purple-500" />
                    ) : attachment.type === "audio" ? (
                      <Mic size={16} className="text-blue-500" />
                    ) : (
                      <File size={16} className="text-gray-500" />
                    )}
                    <span className="text-xs text-(--text-primary) max-w-24 truncate">
                      {attachment.file.name}
                    </span>
                    <button type="button" onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-center gap-2">
          <button onClick={() => setIsOpen(!isOpen)} className="absolute left-5 cursor-pointer text-(--text-muted) hover:text-(--text-primary) p-1 rounded-full hover:bg-(--bg-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus size={18} />
          </button>
          {/* Text Input */}
          <input 
            ref={inputRef}
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="flex-1 h-9 pl-8 pr-10 rounded-lg bg-(--bg-input) border border-gray-500 text-[14px] outline-none focus:ring-1 focus:ring-emerald-500/20 text-(--text-primary) placeholder:text-(--text-muted)"
          />
          
          {/* Send Button */}
          <button 
            onClick={handleSend} 
            disabled={disabled || isSending || (!inputText.trim() && attachments.length === 0)}
            className="absolute right-5 text-(--accent-secondary) p-1.5 hover:bg-(--bg-hover) rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-(--accent-secondary) border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendHorizontal size={22} />
            )}
          </button>
        </div>
      </div>
      {/* Modal */}
      {isOpen && (
        <div className="absolute left-4 bottom-14 z-50 w-30" ref={modalRef}>
          <div className="theme-header-bg w-full rounded-lg p-2 shadow-lg">
            <div>
              {/* File Attachment Button */}
              <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"/>
              <button
                type="button"
                onClick={openFilePicker}
                disabled={disabled || isSending}
                className="flex items-center gap-1 w-full cursor-pointer text-(--text-secondary) hover:text-(--text-primary) p-1.5 rounded-lg hover:bg-(--bg-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Attach file"
              >
                <Paperclip size={14} />
                <span>File</span>
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-1 w-full cursor-pointer text-(--text-secondary) hover:text-(--text-primary) p-1.5 rounded-lg hover:bg-(--bg-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Tasks"
              >
                <ListTodo size={14} />
                <span>Tasks</span>
              </button>
            </div>
          </div>
        </div>
      )}

    {isTaskModalOpen && (
      <div className="absolute left-0 right-0 bottom-14 z-50 px-4 animate-in slide-in-from-bottom-2 fade-in duration-200" ref={taskModalRef}>
        <div className="theme-header-bg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm overflow-visible h-112">
          
          {/* Content */}
          <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar overflow-x-visible h-95">
            
            {/* Task List Title Input */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-(--text-muted)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task list title (e.g., Project Tasks, Daily Goals)"
                className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-(--bg-input) text-(--text-primary) placeholder:text-(--text-muted) outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200"
              />
            </div>

            {/* Tasks List */}
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="group/task relative flex items-center gap-2 p-2 rounded-xl bg-(--bg-secondary) hover:bg-(--bg-hover) transition-all duration-200"
                >
                  {/* Status indicator dot */}
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    task.status === 'Completed' ? 'bg-emerald-500' :
                    task.status === 'In Progress' ? 'bg-blue-500' :
                    task.status === 'On Hold' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                  
                  <input
                    ref={(el) => { taskInputRefs.current[index] = el; }}
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTaskTitle(task.id!, e.target.value)}
                    placeholder="Task title"
                    className="flex-1 h-8 px-2 text-sm rounded-lg border border-(--border-secondary) bg-(--bg-input) text-(--text-primary) placeholder:text-(--text-muted) outline-none focus:border-(--accent-primary) focus:ring-2 focus:ring-(--accent-glow) transition-all duration-200"
                  />
                  
                  {/* Enhanced Status Dropdown */}
                  <StatusDropdown
                    value={task.status}
                    onChange={(status) => updateTaskStatus(task.id!, status)}
                    index={index}
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeTask(task.id!)}
                    disabled={tasks.length === 1}
                    className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--color-error) hover:bg-(--bg-hover) disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t  dark:border-gray-700/50">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={addTask}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Task</span>
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setTasks([{ id: "1", title: "", status: "In Progress" }]);
                    setTaskTitle("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover) rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sendTaskMessage}
                  disabled={tasks.every((t) => !t.title.trim())}
                  className="relative px-5 py-2 text-sm font-medium text-white bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden group"
                >
                  <span className="relative z-10">Send Tasks</span>
                  <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-linear-to-r from-emerald-600 to-emerald-700"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default MessageInput;

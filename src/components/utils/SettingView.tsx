interface SettingViewProps {
  isDark: boolean;
  toggle: () => void;
  onClose: () => void;
}

export default function SettingView ({ isDark, toggle, onClose}: SettingViewProps) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-(--bg-card)">
        {/* Header */}
        <div className="px-4 h-14 flex items-center gap-3 shrink-0 border-b border-gray-400">
          <button onClick={onClose} className="text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h3 className="font-semibold text-xl text-(--text-secondary)">Settings</h3>
        </div>
        {/* Theme Toggle */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="bg-(--bg-secondary) rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-(--text-primary) text-[16px] font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              <button 
                onClick={toggle}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isDark ? 'bg-(--bg-tertiary)' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDark ? 'left-7' : 'left-1'}`}></span>
              </button>
            </div>
            <p className="text-(--text-muted) text-[13px]">{isDark ? 'Switch to light mode for a brighter interface.' : 'Switch to dark mode for a better experience in low light.'}</p>
          </div>
        </div>
      </div>
    );
}
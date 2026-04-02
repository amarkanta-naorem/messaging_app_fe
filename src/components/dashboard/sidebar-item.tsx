import Link from "next/link";
import { SidebarContext } from "./sidebar";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { ReactNode, useContext, useEffect, useRef, useState, useCallback, type KeyboardEvent } from "react";

export interface SubMenuItem {
  label: string;
  href: string;
}

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  href?: string
  subItems?: SubMenuItem[];
}

export default function SidebarItem({ icon, text, active, alert, href = "#", subItems }: SidebarItemProps) {
  const { expanded } = useContext(SidebarContext);
  const pathname = usePathname();
  const hasSubItems = subItems && subItems.length > 0;

  if (hasSubItems) {
    return (
      <SidebarItemWithDropdown icon={icon} text={text} active={active} alert={alert} href={href} subItems={subItems} expanded={expanded} pathname={pathname}/>
    );
  }

  return (
    <Link href={href}>
      <li className={`relative flex items-center py-2.5 px-3 my-2 font-medium rounded-xl cursor-pointer transition-all duration-200 group ${ active ? "bg-(--bg-hover) text-(--accent-primary) shadow-sm" : "hover:bg-(--bg-hover) text-(--text-secondary)"} ${expanded ? "" : "justify-center"}`}>
        <div className={`transition-colors duration-200 ${active ? "text-(--accent-primary)" : "text-(--text-muted) group-hover:text-(--accent-primary)"}`}>{icon}</div>
        <span className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${expanded ? "w-28 ml-3 opacity-100" : "w-0 opacity-0"}`}>{text}</span>

        {alert && (
          <div className={`absolute right-2 w-2 h-2 rounded-full bg-(--accent-primary) ${!expanded && "top-2"}`}/>
        )}
      </li>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Dropdown variant                                                    */
/* ------------------------------------------------------------------ */

interface DropdownProps extends SidebarItemProps {
  expanded: boolean;
  pathname: string;
  subItems: SubMenuItem[];
}

function SidebarItemWithDropdown({ icon, text, active, alert, subItems, expanded, pathname }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const isSubItemActive = subItems.some((s) => pathname === s.href);
  const isExpanded = isOpen;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (focusedIndex < 0 || !dropdownRef.current) return;
    const items = dropdownRef.current.querySelectorAll<HTMLElement>("[data-dropdown-item]");
    items[focusedIndex]?.focus();
  }, [focusedIndex]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setFocusedIndex(-1);
      } else {
        setFocusedIndex(0);
      }
      return !prev;
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(subItems.length - 1);
          }
          break;
        case "Escape":
          if (isOpen) {
            e.preventDefault();
            close();
          }
          break;
      }
    },
    [isOpen, close, subItems.length]
  );

  const handleDropdownKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % subItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex(
            (prev) => (prev - 1 + subItems.length) % subItems.length
          );
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(subItems.length - 1);
          break;
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "Tab":
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    },
    [subItems.length, close]
  );

  return (
    <li className="relative my-2">
      <button
        ref={triggerRef}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isExpanded}
        aria-haspopup="listbox"
        aria-controls="settings-submenu"
        className={`relative flex items-center w-full py-2.5 px-3 font-medium rounded-xl cursor-pointer transition-all duration-200 group ${active || isSubItemActive ? "bg-(--bg-hover) text-(--accent-primary) shadow-sm" : "hover:bg-(--bg-hover) text-(--text-secondary)"} ${expanded ? "" : "justify-center"}`}
      >
        <div className={`transition-colors duration-200 ${active || isSubItemActive ? "text-(--accent-primary)" : "text-(--text-muted) group-hover:text-(--accent-primary)"}`}>{icon}</div>
        <span className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${expanded ? "w-27 ml-3 opacity-100" : "w-0 opacity-0"}`}>{text}</span>

        {expanded && (
          <ChevronDown size={16} className={`ml-auto shrink-0 transition-transform duration-200 text-(--text-muted) ${isExpanded ? "rotate-180" : ""}`}/>
        )}

        {alert && (
          <div className={`absolute right-8 w-2 h-2 rounded-full bg-(--accent-primary) ${!expanded && "top-2 right-2"}`}/>
        )}
      </button>

      {/* Dropdown sub-menu */}
      {isExpanded && expanded && (
        <ul
          ref={dropdownRef}
          id="settings-submenu"
          role="listbox"
          aria-label={`${text} sub-menu`}
          onKeyDown={handleDropdownKeyDown}
          className="ml-4 mt-1 mb-2 space-y-0.5 border-l-2 border-(--border-primary) pl-2"
        >
          {subItems.map((item, index) => {
            const isItemActive = pathname === item.href;
            return (
              <li key={item.href} role="option" aria-selected={isItemActive}>
                <Link
                  href={item.href}
                  data-dropdown-item
                  tabIndex={focusedIndex === index ? 0 : -1}
                  onClick={() => {
                    setIsOpen(false);
                    setFocusedIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsOpen(false);
                      setFocusedIndex(-1);
                    }
                  }}
                  className={`block w-full py-2 px-3 text-sm rounded-lg transition-all duration-150 ${isItemActive ? "bg-(--accent-primary)/10 text-(--accent-primary) font-medium" : "text-(--text-secondary) hover:bg-(--bg-hover) hover:text-(--accent-primary)"}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  ariaLabel?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  ariaLabel = "Toggle service status",
}: ToggleSwitchProps) {
  const isSm = size === "sm";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isSm ? "h-4 w-7" : "h-5 w-9"
      } ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span
        className={`pointer-events-none inline-block rounded-full bg-white shadow-xs transform transition duration-200 ease-in-out ${
          isSm ? "h-3 w-3" : "h-4 w-4"
        } ${
          checked
            ? isSm
              ? "translate-x-3.5"
              : "translate-x-4.5"
            : "translate-x-0.5"
        }`}
      />
    </button>
  );
}


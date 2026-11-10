import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

/**
 * `<select>` native bergaya modern.
 *
 * Sengaja memakai elemen native (bukan Radix Select) karena:
 *  - tidak ada JS tambahan/portal/popper yang perlu di-hydrate
 *    (ringan untuk laptop tua),
 *  - di ponsel tetap membuka pemilih bawaan OS (jauh lebih nyaman),
 *  - tetap bisa bekerja tanpa JavaScript sama sekali.
 *
 * `forwardRef` dipakai agar bisa dipasangkan `register()` dari
 * react-hook-form.
 */
export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function NativeSelect({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-9 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
});

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  hint?: string;
}

/** Kolom filter berlabel yang memakai `<select>` native. */
export function SelectField({
  label,
  id,
  hint,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <NativeSelect id={id} className={className} {...props}>
        {children}
      </NativeSelect>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/app/theme-provider";
import { Laptop, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Ikuti sistem", icon: Laptop },
] as const;

/**
 * Deteksi apakah komponen sudah ter-mount di browser.
 *
 * Dipakai supaya ikon tema yang dirender server (Ikon "Ikuti sistem")
 * sama dengan hasil render pertama di browser. Tanpa ini, React akan
 * melaporkan perbedaan markup (hydration mismatch).
 */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Pengalih tema terang/gelap.
 *
 * Ikon yang ditampilkan ditentukan setelah komponen ter-mount supaya
 * markup server dan client sama (menghindari hydration mismatch).
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[2];
  // Sebelum komponen ter-mount, ikon selalu "Ikuti sistem" supaya markup
  // server dan client identik (menghindari hydration mismatch).
  const Icon = mounted ? current.icon : Laptop;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ubah tema tampilan"
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon className="size-4.5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Tema tampilan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          const active = mounted && theme === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setTheme(option.value)}
              className={active ? "bg-accent text-accent-foreground" : undefined}
            >
              <OptionIcon className="size-4" aria-hidden />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

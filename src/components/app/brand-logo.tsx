import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Muat lebih awal untuk logo di atas lipatan (mis. halaman masuk). */
  preload?: boolean;
}

/**
 * Logo resmi Karang Taruna Dusun Tagog (public/logo.png).
 * Berkas asli sudah dipangkas margin transparannya agar selalu pas di badge.
 */
export function BrandLogo({ className, preload = false }: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Logo Karang Taruna Dusun Tagog"
      width={834}
      height={834}
      sizes="64px"
      preload={preload}
      className={cn("size-full object-contain", className)}
    />
  );
}

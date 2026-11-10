import type { ReactNode } from "react";

/**
 * Template di dalam route group (app).
 *
 * Berbeda dengan layout, template di-mount ulang setiap navigasi. Ini yang
 * membuat animasi masuk halaman selalu terulang, sekaligus memberi
 * feedback visual bahwa konten sedang berganti.
 */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { AgendaCard } from "@/components/public/agenda-card";
import { PublicLinkButton } from "@/components/public/public-button";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { listPublicActivities } from "@/features/public/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda",
  description:
    "Agenda kegiatan Karang Taruna Dusun Tagog yang akan datang dan yang sudah berlangsung.",
};

export default async function AgendaPage() {
  const [upcoming, past] = await Promise.all([
    listPublicActivities({ upcoming: true }),
    listPublicActivities({ past: true, limit: 24 }),
  ]);

  return (
    <>
      <PublicPageHero
        eyebrow="Agenda kegiatan"
        title="Apa yang sedang kami siapkan."
        description="Semua kegiatan yang dipublikasikan pengurus, dari gotong royong hingga acara pemuda. Jadwal dapat berubah; pantau halaman ini untuk informasi terbaru."
      >
        <div className="flex flex-wrap gap-3">
          <PublicLinkButton href="#mendatang" variant="secondary">
            <CalendarDays className="size-4" />
            Agenda mendatang
          </PublicLinkButton>
          <PublicLinkButton href="#sudah-berlangsung" variant="ghost">
            Lihat yang sudah berlangsung
          </PublicLinkButton>
        </div>
      </PublicPageHero>

      <section
        id="mendatang"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <SectionHeading
          eyebrow="Mendatang"
          title="Agenda terdekat"
          description="Catat tanggalnya dan ajak warga lain untuk ikut serta."
        />

        <div className="mt-8">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-public-forest/20 bg-white/40 px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-public-forest/10 text-public-forest">
                <CalendarDays className="size-5" />
              </span>
              <p className="mt-3 font-medium text-public-ink">
                Belum ada agenda mendatang
              </p>
              <p className="mt-1 max-w-md text-sm text-public-muted">
                Pengurus belum mempublikasikan kegiatan baru. Silakan kembali
                lagi atau lihat agenda yang sudah berlangsung di bawah.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((activity, index) => (
                <AgendaCard
                  key={activity.id}
                  activity={activity}
                  featured={index === 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        id="sudah-berlangsung"
        className="scroll-mt-24 border-y border-public-forest/10 bg-public-sand/50"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Jejak kegiatan"
            title="Yang sudah berlangsung"
            description="Dokumentasi agenda yang telah selesai."
          />

          <div className="mt-8">
            {past.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-public-forest/20 bg-white/40 px-6 py-10 text-center text-sm text-public-muted">
                Belum ada agenda yang sudah berlangsung.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {past.map((activity) => (
                  <AgendaCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>

          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-public-muted">
            Halaman ini hanya menampilkan agenda yang ditandai publik oleh
            pengurus. Agenda internal organisasi tetap tersimpan di sistem
            pengurus.
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-public-ink">
            Punya ide kegiatan untuk dusun?
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-public-muted">
            Sampaikan kepada pengurus. Agenda yang baik sering dimulai dari
            usulan warga.
          </p>
        </div>
        <PublicLinkButton href="/kontak" variant="secondary">
          Hubungi pengurus
        </PublicLinkButton>
      </section>
    </>
  );
}

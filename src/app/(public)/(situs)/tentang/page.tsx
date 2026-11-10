import type { Metadata } from "next";
import {
  ArrowRight,
  HeartHandshake,
  ListChecks,
  MapPin,
  Quote,
  ShieldCheck,
  Sprout,
  Target,
  Users,
} from "lucide-react";
import { PublicLinkButton } from "@/components/public/public-button";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { getOrganizationProfile } from "@/features/public/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Cerita, visi, dan misi Karang Taruna Dusun Tagog.",
};

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Gotong royong",
    text: "Kegiatan disiapkan bersama warga. Setiap tenaga dan gagasan punya tempat.",
  },
  {
    icon: ShieldCheck,
    title: "Keterbukaan",
    text: "Agenda dan laporan kas dapat dibaca publik. Kepercayaan dijaga dengan catatan yang rapi.",
  },
  {
    icon: Users,
    title: "Kolaborasi",
    text: "Kami bekerja lintas usia dan lintas RT, bukan hanya di kalangan pemuda.",
  },
];

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function missionItems(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((item) => item.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export default async function TentangPage() {
  const org = await getOrganizationProfile();
  const orgName = org?.org_name ?? "Karang Taruna";
  const dusunName = org?.dusun_name ?? "Dusun Tagog";
  const about =
    org?.about_text?.trim() ||
    "Karang Taruna Dusun Tagog adalah wadah kepemudaan yang tumbuh dari semangat gotong royong warga. Kami bergerak di bidang sosial, budaya, olahraga, dan pemberdayaan pemuda.";
  const vision =
    org?.vision?.trim() ||
    "Menjadi organisasi kepemudaan yang aktif, kolaboratif, dan terbuka, serta ikut membangun dusun yang maju dan rukun.";
  const missions = missionItems(org?.mission);

  return (
    <>
      <PublicPageHero
        eyebrow="Tentang kami"
        title="Tumbuh dari gotong royong warga."
        description={
          org?.tagline?.trim() ||
          "Bersama membangun dusun, terbuka dalam mengelola."
        }
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Cerita kami"
              title={`${orgName} di ${dusunName}`}
            />
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-public-muted sm:text-base">
              {paragraphs(about).map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
              ))}
              <p>
                Lewat situs ini, kami ingin membuka pintu lebih lebar: warga
                dapat melihat agenda yang sedang disiapkan dan membaca laporan
                kas tanpa harus datang ke sekretariat atau meminta akses
                khusus.
              </p>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] bg-public-forest p-6 text-public-cream shadow-xl shadow-public-forest/15 sm:p-8">
            <div
              aria-hidden
              className="absolute -right-12 -top-12 size-40 rounded-full bg-public-amber/20 blur-2xl"
            />
            <Quote className="size-8 text-public-amber" />
            <p className="relative mt-4 font-heading text-xl font-medium leading-relaxed sm:text-2xl">
              {org?.tagline?.trim() ||
                "Bersama membangun dusun, terbuka dalam mengelola."}
            </p>
            <div className="relative mt-6 border-t border-public-cream/15 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-public-cream/55">
                Cara kami bekerja
              </p>
              <p className="mt-1.5 text-sm text-public-cream/80">
                Mencatat dengan rapi, menjelaskan dengan terbuka, dan melibatkan
                warga dalam setiap kegiatan.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-public-forest/10 bg-public-sand/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Nilai kami"
            title="Tiga hal yang kami jaga"
            description="Nilai ini menjadi pegangan saat menyiapkan kegiatan maupun mengelola keuangan organisasi."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="rounded-3xl border border-public-forest/10 bg-white/70 p-6"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-public-forest/10 text-public-forest">
                  <value.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-public-ink">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-public-muted">
                  {value.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-public-forest/10 bg-white/70 p-6 sm:p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-public-amber/25 text-public-ink">
              <Target className="size-5" />
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-public-ink">
              Visi
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-public-muted sm:text-base">
              {vision}
            </p>
          </div>

          <div className="rounded-3xl border border-public-forest/10 bg-white/70 p-6 sm:p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-public-leaf/15 text-public-forest">
              <ListChecks className="size-5" />
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-public-ink">
              Misi
            </h2>
            {missions.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {missions.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm leading-relaxed text-public-muted"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-public-leaf" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-public-muted">
                Poin misi organisasi akan dilengkapi oleh pengurus.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-public-forest/10 bg-public-sand/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-public-leaf">
              <MapPin className="size-3.5" />
              {dusunName}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-public-ink">
              Ingin tahu lebih dekat atau ikut berkegiatan?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-public-muted">
              {org?.address?.trim() ||
                "Sampaikan pertanyaan atau minat Anda kepada pengurus Karang Taruna setempat."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PublicLinkButton href="/kontak">
              Hubungi kami
              <ArrowRight className="size-4" />
            </PublicLinkButton>
            <PublicLinkButton href="/agenda" variant="secondary">
              <Sprout className="size-4" />
              Lihat agenda
            </PublicLinkButton>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sprout,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { AgendaCard } from "@/components/public/agenda-card";
import { HeroIllustration } from "@/components/public/hero-illustration";
import { PublicLinkButton } from "@/components/public/public-button";
import { PublicStat } from "@/components/public/public-stat";
import { SectionHeading } from "@/components/public/section-heading";
import { TransparencyChart } from "@/components/public/transparency-chart";
import { formatTanggalWaktuJakarta } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import {
  getOrganizationProfile,
  getPublicPeriodTotals,
  listPublicActivities,
  listPublicPeriods,
  listPublicRecapRows,
} from "@/features/public/queries";
import { buildPublicRecap } from "@/features/public/recap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Kegiatan dan laporan kas Karang Taruna Dusun Tagog, terbuka untuk warga.",
};

const PILLARS = [
  {
    icon: HeartHandshake,
    title: "Kegiatan sosial",
    description:
      "Gotong royong, bakti sosial, dan kegiatan yang menjaga kebersamaan warga dusun.",
  },
  {
    icon: Trophy,
    title: "Olahraga & budaya",
    description:
      "Turnamen antar-RT, pentas seni, dan ruang kreatif untuk pemuda Dusun Tagog.",
  },
  {
    icon: Sprout,
    title: "Pemberdayaan pemuda",
    description:
      "Pelatihan, diskusi, dan pendampingan agar pemuda tumbuh dan ikut membangun dusun.",
  },
];

export default async function PublicHomePage() {
  const [org, periods, upcomingActivities] = await Promise.all([
    getOrganizationProfile(),
    listPublicPeriods(),
    listPublicActivities({ upcoming: true, limit: 3 }),
  ]);

  const period =
    periods.find((item) => item.status === "active") ?? periods[0] ?? null;

  const [totals, recapRows] = period
    ? await Promise.all([
        getPublicPeriodTotals(period.id),
        listPublicRecapRows(period.id),
      ])
    : [
        { income: 0, expense: 0, balance: 0 },
        [] as Awaited<ReturnType<typeof listPublicRecapRows>>,
      ];

  const recap = buildPublicRecap(recapRows);
  const nextActivity = upcomingActivities[0] ?? null;
  const orgName = org?.org_name ?? "Karang Taruna";
  const dusunName = org?.dusun_name ?? "Dusun Tagog";

  const aboutText =
    org?.about_text?.trim() ||
    "Karang Taruna Dusun Tagog adalah wadah kepemudaan yang tumbuh dari semangat gotong royong warga. Kami bergerak di bidang sosial, budaya, olahraga, dan pemberdayaan pemuda.";
  const aboutFirstParagraph =
    aboutText.split(/\n\s*\n/)[0]?.trim() || aboutText;
  const aboutPreview =
    aboutFirstParagraph.length > 360
      ? `${aboutFirstParagraph.slice(0, 360).trimEnd()}…`
      : aboutFirstParagraph;

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-20 -top-24 size-96 rounded-full bg-public-amber/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-24 top-1/3 size-96 rounded-full bg-public-leaf/10 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-24 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-public-forest/10 bg-white/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-public-forest backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-public-amber" />
              {orgName} &middot; {dusunName}
            </span>

            <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-public-ink sm:text-5xl lg:text-[3.6rem]">
              Pemuda bergerak,
              <br />
              <span className="text-public-forest">dusun tumbuh bersama.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-public-muted sm:text-lg">
              {org?.tagline?.trim() ||
                "Bersama membangun dusun, terbuka dalam mengelola."}{" "}
              Di sini warga bisa mengikuti agenda kegiatan dan membaca laporan
              kas kami kapan saja.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PublicLinkButton href="/transparansi">
                Lihat laporan kas
                <ArrowRight className="size-4" />
              </PublicLinkButton>
              <PublicLinkButton href="/agenda" variant="secondary">
                <CalendarDays className="size-4" />
                Agenda kegiatan
              </PublicLinkButton>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-public-muted">
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-public-forest" />
                Laporan kas terbuka
              </li>
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-public-forest" />
                Agenda diperbarui pengurus
              </li>
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-public-forest" />
                Data pribadi tetap privat
              </li>
            </ul>
          </div>

          <HeroIllustration
            className="aspect-[4/3] lg:aspect-auto lg:h-[34rem]"
            nextActivityTitle={nextActivity?.title}
            nextActivityDate={
              nextActivity
                ? formatTanggalWaktuJakarta(nextActivity.starts_at)
                : null
            }
          />
        </div>
      </section>

      {/* ================= STATISTIK ================= */}
      <section
        aria-label="Ringkasan kas publik"
        className="relative z-10 mx-auto -mt-6 w-full max-w-6xl px-4 sm:px-6 lg:-mt-10 lg:px-8"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <PublicStat
            label="Saldo kas"
            value={formatRupiah(totals.balance)}
            hint={period ? `Periode ${period.name}` : "Belum ada periode kas"}
            icon={Wallet}
            tone="forest"
          />
          <PublicStat
            label="Pemasukan"
            value={formatRupiah(totals.income)}
            hint="Iuran, donasi, dan sumber dana lain"
            icon={ArrowUpCircle}
            tone="leaf"
          />
          <PublicStat
            label="Pengeluaran"
            value={formatRupiah(totals.expense)}
            hint="Kegiatan dan kebutuhan organisasi"
            icon={ArrowDownCircle}
            tone="amber"
          />
        </div>
      </section>

      {/* ================= PILAR KEGIATAN ================= */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading
          eyebrow="Yang kami kerjakan"
          title="Ruang bergerak untuk pemuda dan warga"
          description="Karang Taruna bukan hanya organisasi di atas kertas. Kegiatannya dekat dengan keseharian warga Dusun Tagog."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="group rounded-3xl border border-public-forest/10 bg-white/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-public-forest/8"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-public-forest/10 text-public-forest transition-colors group-hover:bg-public-forest group-hover:text-public-cream">
                <pillar.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-public-ink">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-public-muted">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ================= TENTANG ================= */}
      <section className="border-y border-public-forest/10 bg-public-sand/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <SectionHeading
              eyebrow="Tentang kami"
              title="Dari warga, oleh pemuda, untuk Dusun Tagog."
              description={aboutPreview}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <PublicLinkButton href="/tentang" variant="secondary">
                Kenali kami lebih dekat
                <ArrowRight className="size-4" />
              </PublicLinkButton>
              <Link
                href="/kontak"
                className="inline-flex h-11 items-center gap-1.5 px-2 text-sm font-semibold text-public-forest transition-colors hover:text-public-leaf"
              >
                Hubungi pengurus
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              {
                icon: HeartHandshake,
                title: "Gotong royong",
                text: "Kegiatan lahir dari kebutuhan warga, bukan sekadar program.",
              },
              {
                icon: ShieldCheck,
                title: "Terbuka",
                text: "Kas dan agenda dapat dibaca publik tanpa perlu membuat akun.",
              },
              {
                icon: Users,
                title: "Kolaboratif",
                text: "Pemuda, warga, dan RT bekerja bersama menyiapkan kegiatan.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="flex gap-3.5 rounded-3xl border border-public-forest/10 bg-white/70 p-4"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-public-forest/10 text-public-forest">
                  <value.icon className="size-4.5" />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold text-public-ink">
                    {value.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-public-muted">
                    {value.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= AGENDA ================= */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading
          eyebrow="Agenda"
          title="Yang sedang kami siapkan"
          description="Ikuti kegiatan terdekat dan lihat apa saja yang sedang direncanakan pengurus."
          action={
            <PublicLinkButton href="/agenda" variant="secondary">
              Semua agenda
              <ArrowRight className="size-4" />
            </PublicLinkButton>
          }
        />

        <div className="mt-8">
          {upcomingActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-public-forest/20 bg-white/40 px-6 py-12 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-public-forest/10 text-public-forest">
                <CalendarDays className="size-5" />
              </span>
              <p className="mt-3 font-medium text-public-ink">
                Belum ada agenda mendatang
              </p>
              <p className="mt-1 max-w-md text-sm text-public-muted">
                Pengurus akan menambahkan kegiatan baru di sini. Sementara itu,
                Anda tetap bisa membaca agenda yang sudah berlalu.
              </p>
              <PublicLinkButton
                href="/agenda"
                variant="secondary"
                className="mt-5"
              >
                Lihat agenda
              </PublicLinkButton>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingActivities.map((activity) => (
                <AgendaCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= TRANSPARANSI ================= */}
      <section className="border-y border-public-forest/10 bg-public-sand/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <SectionHeading
              eyebrow="Transparansi"
              title="Kas kami, bisa Anda baca."
              description="Setiap pemasukan dan pengeluaran dicatat dengan tanggal, kategori, dan nominal. Totalnya dihitung otomatis, bukan dirangkum manual."
            />

            <ul className="mt-6 space-y-3 text-sm text-public-muted">
              {[
                "Rincian transaksi publik tanpa nama anggota atau pencatat.",
                "Rekap bulanan dan per kategori untuk memudahkan pemeriksaan.",
                "Bukti nota dan dokumen internal tetap disimpan terbatas.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-public-forest" />
                  {item}
                </li>
              ))}
            </ul>

            <PublicLinkButton href="/transparansi" className="mt-6">
              Buka laporan lengkap
              <ArrowRight className="size-4" />
            </PublicLinkButton>
          </div>

          <TransparencyChart monthly={recap.monthly} />
        </div>
      </section>

      {/* ================= AJAKAN ================= */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-public-forest px-6 py-12 text-public-cream shadow-2xl shadow-public-forest/20 sm:px-10 lg:px-14">
          <div
            aria-hidden
            className="absolute -right-16 -top-20 size-72 rounded-full bg-public-amber/20 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-public-leaf/20 blur-3xl"
          />
          <div className="relative max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-public-cream/60">
              <MapPin className="size-3.5 text-public-amber" />
              {dusunName}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Ingin ikut kegiatan atau punya pertanyaan?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-public-cream/70 sm:text-base">
              Pintu kami terbuka untuk warga yang ingin berkolaborasi, memberi
              masukan, atau sekadar mengetahui kegiatan pemuda di dusun.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <PublicLinkButton href="/kontak" variant="amber">
                Hubungi kami
                <ArrowRight className="size-4" />
              </PublicLinkButton>
              <PublicLinkButton
                href="/agenda"
                variant="secondary"
                className="border-public-cream/20 bg-public-cream/10 text-public-cream hover:bg-public-cream/15"
              >
                Lihat agenda
              </PublicLinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

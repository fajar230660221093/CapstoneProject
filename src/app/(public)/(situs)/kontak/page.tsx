import type { Metadata } from "next";
import {
  ArrowRight,
  Camera,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { PublicLinkButton } from "@/components/public/public-button";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { getOrganizationProfile } from "@/features/public/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Karang Taruna Dusun Tagog untuk pertanyaan, usulan kegiatan, atau kolaborasi.",
};

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;
  return `https://wa.me/${normalized}`;
}

export default async function KontakPage() {
  const org = await getOrganizationProfile();
  const orgName = org?.org_name ?? "Karang Taruna";
  const dusunName = org?.dusun_name ?? "Dusun Tagog";

  return (
    <>
      <PublicPageHero
        eyebrow="Kontak"
        title="Mari terhubung."
        description="Punya pertanyaan tentang kegiatan, ingin mengusulkan program, atau hendak berkolaborasi? Sampaikan kepada pengurus kami."
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Sekretariat"
              title={`${orgName} · ${dusunName}`}
              description="Gunakan kontak resmi berikut untuk pertanyaan, usulan kegiatan, atau kolaborasi. Silakan hubungi pengurus sebelum datang ke sekretariat."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-public-forest/10 bg-white/70 p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-public-forest/10 text-public-forest">
                  <MapPin className="size-5" />
                </span>
                <h3 className="mt-3 font-heading text-sm font-semibold text-public-ink">
                  Alamat
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-public-muted">
                  {org?.address?.trim() ||
                    "Alamat sekretariat belum diisi pengurus."}
                </p>
                {org?.maps_url ? (
                  <a
                    href={org.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-public-forest transition-colors hover:text-public-leaf"
                  >
                    Buka di Google Maps
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>

              <div className="rounded-3xl border border-public-forest/10 bg-white/70 p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-public-leaf/15 text-public-forest">
                  <Phone className="size-5" />
                </span>
                <h3 className="mt-3 font-heading text-sm font-semibold text-public-ink">
                  Telepon / WhatsApp
                </h3>
                {org?.contact_phone ? (
                  <a
                    href={whatsappHref(org.contact_phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-public-muted transition-colors hover:text-public-forest"
                  >
                    {org.contact_phone}
                    <MessageCircle className="size-4" />
                  </a>
                ) : (
                  <p className="mt-1.5 text-sm text-public-muted">
                    Belum diisi pengurus.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-public-forest/10 bg-white/70 p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-public-amber/25 text-public-ink">
                  <Mail className="size-5" />
                </span>
                <h3 className="mt-3 font-heading text-sm font-semibold text-public-ink">
                  Email
                </h3>
                {org?.contact_email ? (
                  <a
                    href={`mailto:${org.contact_email}`}
                    className="mt-1.5 break-all text-sm text-public-muted transition-colors hover:text-public-forest"
                  >
                    {org.contact_email}
                  </a>
                ) : (
                  <p className="mt-1.5 text-sm text-public-muted">
                    Belum diisi pengurus.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-public-forest/10 bg-white/70 p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-public-forest/10 text-public-forest">
                  <Share2 className="size-5" />
                </span>
                <h3 className="mt-3 font-heading text-sm font-semibold text-public-ink">
                  Media sosial
                </h3>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  {org?.instagram_url ? (
                    <a
                      href={org.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-public-muted transition-colors hover:text-public-forest"
                    >
                      <Camera className="size-4" />
                      Instagram
                    </a>
                  ) : null}
                  {org?.facebook_url ? (
                    <a
                      href={org.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-public-muted transition-colors hover:text-public-forest"
                    >
                      <ThumbsUp className="size-4" />
                      Facebook
                    </a>
                  ) : null}
                  {!org?.instagram_url && !org?.facebook_url ? (
                    <p className="text-sm text-public-muted">
                      Belum ada tautan media sosial.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] bg-public-forest p-6 text-public-cream shadow-xl shadow-public-forest/15 sm:p-8">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 size-48 rounded-full bg-public-amber/20 blur-2xl"
            />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-public-cream/55">
                Ikut berkegiatan
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold sm:text-3xl">
                Warga dan pemuda dusun selalu punya tempat.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-public-cream/70">
                Tidak perlu menunggu acara besar. Mulai dari membantu gotong
                royong, menjadi relawan, atau mengusulkan ide kegiatan.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <PublicLinkButton href="/agenda" variant="amber">
                  Lihat agenda terdekat
                  <ArrowRight className="size-4" />
                </PublicLinkButton>
                <PublicLinkButton
                  href="/transparansi"
                  variant="secondary"
                  className="border-public-cream/20 bg-public-cream/10 text-public-cream hover:bg-public-cream/15"
                >
                  Baca laporan kas
                </PublicLinkButton>
              </div>

              <div className="mt-8 border-t border-public-cream/15 pt-5 text-xs leading-relaxed text-public-cream/55">
                <p className="font-semibold text-public-cream/75">
                  Catatan kecil
                </p>
                <p className="mt-1">
                  Halaman kontak ini dikelola oleh pengurus. Mohon gunakan
                  kontak resmi di samping untuk keperluan organisasi.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-public-forest/10 bg-public-sand/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-public-ink">
              Ada pertanyaan tentang laporan kas?
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-public-muted">
              Kami terbuka untuk masukan. Sampaikan pertanyaan kepada pengurus
              agar bisa ditindaklanjuti.
            </p>
          </div>
          <PublicLinkButton href="/transparansi" variant="secondary">
            Lihat transparansi
            <ArrowRight className="size-4" />
          </PublicLinkButton>
        </div>
      </section>
    </>
  );
}

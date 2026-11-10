import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  Mail,
  MapPin,
  Phone,
  ThumbsUp,
} from "lucide-react";
import { BrandLogo } from "@/components/app/brand-logo";
import type { OrganizationProfileRow } from "@/types/database";

const QUICK_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/agenda", label: "Agenda Kegiatan" },
  { href: "/transparansi", label: "Transparansi Kas" },
  { href: "/kontak", label: "Kontak" },
];

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;
  return `https://wa.me/${normalized}`;
}

export function PublicFooter({
  org,
}: {
  org: OrganizationProfileRow | null;
}) {
  const orgName = org?.org_name ?? "Karang Taruna";
  const dusunName = org?.dusun_name ?? "Dusun Tagog";
  const tagline =
    org?.tagline?.trim() ||
    "Bersama membangun dusun, terbuka dalam mengelola.";
  const year = new Date().getFullYear();

  const socialLinks = [
    org?.instagram_url
      ? {
          href: org.instagram_url,
          label: "Instagram",
          Icon: Camera,
        }
      : null,
    org?.facebook_url
      ? { href: org.facebook_url, label: "Facebook", Icon: ThumbsUp }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <footer className="mt-auto bg-public-forest text-public-cream">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-public-cream/10 p-2 ring-1 ring-public-cream/15">
                <BrandLogo />
              </span>
              <div>
                <p className="font-heading text-lg font-semibold">{orgName}</p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-public-cream/60">
                  {dusunName}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-public-cream/70">
              {tagline}
            </p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-public-cream/50">
              Situs ini memuat agenda dan laporan kas yang dapat dibaca siapa
              saja. Data pribadi anggota, bukti nota, dan catatan internal tetap
              disimpan secara terbatas.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-public-cream/50">
              Jelajahi
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-public-cream/75 transition-colors hover:text-public-cream"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-public-cream/50">
              Kontak
            </p>
            <ul className="mt-4 space-y-3 text-sm text-public-cream/75">
              {org?.address ? (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-public-amber" />
                  <span>{org.address}</span>
                </li>
              ) : (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-public-amber" />
                  <span>{dusunName}</span>
                </li>
              )}
              {org?.contact_phone ? (
                <li>
                  <a
                    href={whatsappHref(org.contact_phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 transition-colors hover:text-public-cream"
                  >
                    <Phone className="size-4 shrink-0 text-public-amber" />
                    {org.contact_phone}
                  </a>
                </li>
              ) : null}
              {org?.contact_email ? (
                <li>
                  <a
                    href={`mailto:${org.contact_email}`}
                    className="flex items-center gap-2.5 break-all transition-colors hover:text-public-cream"
                  >
                    <Mail className="size-4 shrink-0 text-public-amber" />
                    {org.contact_email}
                  </a>
                </li>
              ) : null}
            </ul>

            {socialLinks.length > 0 ? (
              <div className="mt-5 flex items-center gap-2">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-public-cream/10 text-public-cream/80 transition-colors hover:bg-public-amber hover:text-public-ink"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-public-cream/10 pt-6 text-xs text-public-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {orgName}. Dibuat untuk keterbukaan bersama.
          </p>
          <Link
            href="/masuk"
            className="font-medium text-public-cream/65 transition-colors hover:text-public-cream"
          >
            Masuk pengurus
          </Link>
        </div>
      </div>
    </footer>
  );
}

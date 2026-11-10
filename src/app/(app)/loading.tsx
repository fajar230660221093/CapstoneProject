import { SkeletonPage } from "@/components/app/skeletons";

/**
 * Tampilan selagi data dimuat.
 *
 * Tanpa file ini, navigasi antar menu menampilkan halaman lama yang beku
 * tanpa indikator apa pun - itulah yang terasa seperti "nge-lag".
 * Dengan skeleton, perpindahan halaman selalu kelihatan progresif.
 */
export default function AppLoading() {
  return <SkeletonPage />;
}

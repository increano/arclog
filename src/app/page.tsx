import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/ui/brand-header";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/server";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBroSOoPXgr4dVDxlz1uSUeV35nW0pengsZJMApByUVH5EZQMeqFndfjSFmX9oYdjLbks6qisIJCrHRfWqYhsW1R5QvYzB1MLIIuC2yvBdXUK-nW93JpVpmYNsMTTypvrxymMFeiQohsOcTFzQrTgWDX_4M1HYkmQ8rj8Q6vyocwMtSXsVmvMPQ0cVlXKowd2aExl0yLhDQKqGpwcu7JfxQKny865IWi7jWnYolxCntvuVQSn8yfS4S";

const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBig5ll7BWNSZTPjWsrOpcIQRpUtIkn395oKq-2ykmA507t9Ija3rL8FuRtgn8_nB88EkvDq1HB9jk18w32le3DLjr6FB-D1SUoUbjoV3HSnopMcK45Bkj5sDMicFZOzEBSK8V9s6R24Yw9watM5w3OVbdre9Qmgx318mzn_CerLo-8xPiha5Xz8ab1Jsra0py-Ye5jj4f1ds4EzaFDsm_nNvJKcFlUfgnDiZv25uQjeYruKFADCSbL",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDu0qFh1yurKym-R-fZQ4CuqYh4KEL-FJmABKZHzpRFgujNdOHLB3sprgMtwicLxMlUrRrJ7X4mzJ3Fi5Ew8bXa9IJvRkFo2XLDPgdc65I8jbMdiX_WKN0G9tD5bSu5QTMp7xxHhBTg-VnDLHlBlo4IactqnD4Fv1QW2pKERU5ZX4a5Au9JFcp_Sl8iaQmIMqro9ApQ25UMMBjO6Qmf9CqMRKr8Nt2Vz51JQevpR3qj-5cLcthzin8G",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCKhUvA7VHDYrxjDmw8JQvdlMBP6NhcaK84wAmTbBlVKC_XDa2hT79ovJoHZWb8fVsTVj-JvmI3XdT_FJ7q12jyezWbuvYMJF1QC0p7dBQjw3Noq64qv9qSbelfUzdsuBhZkVgi5-2oeaYhWTnbxCpYN0u3Ge83aAV5CY02Z6buYubUsfsU0L-WWUr41fuU0n5hW17GHzc4VfYbnulA0wYtFLRd6_zRB5Qfz03w4fPoWEWmOj9ewruG",
];

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/me");

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-surface text-on-surface">
      <BrandHeader showLanguage />
      <main className="flex w-full max-w-[1200px] flex-grow flex-col items-center justify-center px-margin-mobile pb-12 pt-24">
        <div className="relative mb-8 flex aspect-square w-full max-w-md items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary-container opacity-20 blur-[80px]" />
          <div className="relative z-10 h-full w-full p-8">
            <div className="animate-float flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-outline-variant bg-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMG}
                alt="A learner reading a glowing book under a sunrise"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mb-16 max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-on-background md:text-5xl md:leading-[1.15]">
            Learn the Bible,{" "}
            <br className="hidden md:block" />
            <span className="italic text-primary">One Verse</span> at a Time.
          </h1>
          <p className="px-4 text-base font-medium text-on-surface-variant">
            Join <span className="font-bold text-on-surface">100,000+ disciples</span>{" "}
            on an engaging, gamified journey through the scriptures. Build a
            lasting spiritual habit with daily rewards and community streaks.
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col items-center space-y-4">
          <Link
            href="/onboarding/why"
            className="btn-primary-tactile group flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-on-primary"
          >
            Get Started
            <Icon
              name="arrow_forward"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-lg py-3 font-bold text-primary hover:bg-surface-container-low"
          >
            I already have an account
          </Link>

          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {AVATARS.map((src) => (
                <div
                  key={src.slice(-12)}
                  className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-surface-variant"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-container text-[10px] font-bold text-white">
                +99k
              </div>
            </div>
            <p className="text-xs font-medium text-outline">
              Rated 4.9/5 by our community
            </p>
          </div>
        </div>
      </main>

      <div className="pointer-events-none fixed top-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-secondary-container opacity-10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-tertiary-fixed opacity-10 blur-[120px]" />
    </div>
  );
}

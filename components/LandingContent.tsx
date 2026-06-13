'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, BarChart3, Globe, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';

const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), {
  ssr: false,
  loading: () => null,
});

export default function LandingContent() {
  const { t } = useTranslation();

  const features = [
    { icon: Layers, title: t.landing.multiIssuer, desc: t.landing.multiIssuerDesc },
    { icon: Globe, title: t.landing.globalMapping, desc: t.landing.globalMappingDesc },
    { icon: ShieldCheck, title: t.landing.serverless, desc: t.landing.serverlessDesc },
  ];

  const stats = [
    { value: '4+', label: t.landing.statIssuers },
    { value: '1000s', label: t.landing.statHoldings },
    { value: '100%', label: t.landing.statClientSide },
    { value: '3D', label: t.landing.statVisualization },
  ];

  return (
    <main className="relative w-full overflow-hidden bg-background text-foreground">
      {/* ===================== HERO ===================== */}
      <section className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        {/* 3D canvas layer */}
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>

        {/* Readability + fade overlays (theme-aware via the background token) */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-radial from-transparent via-background/50 to-background/90" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-background to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {t.landing.badge}
          </div>

          <h1 className="text-pretty text-5xl font-black uppercase leading-[0.95] tracking-tighter sm:text-6xl md:text-8xl">
            {t.landing.unveil}{' '}
            <span className="text-primary drop-shadow-[0_0_25px_var(--primary)]">
              {t.landing.exposure}
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-pretty text-lg font-light leading-relaxed tracking-wide text-muted-foreground md:text-2xl">
            {t.landing.subtitle}
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              render={<Link href="/analyzer" />}
              nativeButton={false}
              size="lg"
              className="group h-auto px-10 py-7 text-base font-bold uppercase tracking-widest shadow-[0_0_30px_color-mix(in_oklch,var(--primary),transparent_70%)] transition-shadow hover:shadow-[0_0_45px_color-mix(in_oklch,var(--primary),transparent_45%)]"
            >
              {t.landing.launchSystem}
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              render={<Link href="/about" />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="h-auto px-10 py-7 text-base font-bold uppercase tracking-widest backdrop-blur-sm"
            >
              {t.navbar.about}
            </Button>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-foreground/30 p-1">
            <span className="h-2 w-1 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/40"
              >
                {/* hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="relative mb-3 text-xl font-bold uppercase tracking-wider text-foreground">
                  {f.title}
                </h3>
                <p className="relative font-light leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* stats band */}
        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center bg-card px-4 py-10 text-center"
            >
              <span className="text-4xl font-black tracking-tighter text-primary md:text-5xl">
                {s.value}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* final CTA */}
        <div className="relative mt-20 overflow-hidden rounded-3xl border border-primary/20 bg-card/40 px-6 py-16 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
          <BarChart3 className="relative mx-auto mb-6 h-10 w-10 text-primary" />
          <h2 className="relative text-balance text-3xl font-black uppercase tracking-tighter text-foreground md:text-5xl">
            {t.landing.unveil} <span className="text-primary">{t.landing.exposure}</span>
          </h2>
          <div className="relative mt-8 flex justify-center">
            <Button
              render={<Link href="/analyzer" />}
              nativeButton={false}
              size="lg"
              className="group h-auto px-10 py-7 text-base font-bold uppercase tracking-widest shadow-[0_0_30px_color-mix(in_oklch,var(--primary),transparent_70%)] transition-shadow hover:shadow-[0_0_45px_color-mix(in_oklch,var(--primary),transparent_45%)]"
            >
              {t.landing.launchSystem}
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

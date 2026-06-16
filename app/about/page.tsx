'use client';

import { ShieldCheck, Layers, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-card/20 border-b border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-28 text-center relative z-10 w-full flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-widest uppercase mb-6 text-foreground drop-shadow-md">
            {t.pages.about.empowering}{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              {t.pages.about.investors}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light tracking-wide">
            {t.pages.about.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-10 w-full">
          <Card className="border border-border shadow-lg bg-card/40 backdrop-blur-md overflow-hidden hover:border-primary/40 transition-colors">
            <div className="h-1 bg-gradient-to-r from-primary to-blue-600 w-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            <CardHeader className="pb-4 pt-8">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Layers className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>
              <CardTitle className="text-3xl font-black tracking-widest uppercase text-foreground">
                {t.pages.about.overlapProblem}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-lg leading-relaxed space-y-6 font-light">
              <p>{t.pages.about.overlapP1}</p>
              <p>{t.pages.about.overlapP2}</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-lg bg-card/40 backdrop-blur-md overflow-hidden hover:border-emerald-500/40 transition-colors">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-600 w-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
            <CardHeader className="pb-4 pt-8">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>
              <CardTitle className="text-3xl font-black tracking-widest uppercase text-foreground">
                {t.pages.about.privacyFirst}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-lg leading-relaxed space-y-6 font-light">
              <p>
                {t.pages.about.privacyP1Start}{' '}
                <strong className="text-emerald-400">{t.pages.about.privacyClientSide}</strong>
                {t.pages.about.privacyP1End}
              </p>
              <p>{t.pages.about.privacyP2}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 w-full">
          <Card className="bg-card border border-border shadow-2xl relative overflow-hidden">
            {/* Abstract background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

            <CardHeader className="relative z-10 p-10 pb-4">
              <div className="w-16 h-16 bg-white/5 border border-border flex items-center justify-center mb-6 backdrop-blur-md">
                <Rocket className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-black tracking-widest uppercase text-foreground">
                {t.pages.about.futureRoadmap}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 px-10 pb-10">
              <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl font-light">
                {t.pages.about.roadmapDescStart}{' '}
                <strong className="text-primary">{t.pages.about.threeJs}</strong>{' '}
                {t.pages.about.roadmapDescEnd}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

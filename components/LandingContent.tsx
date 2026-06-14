'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Globe, Layers, Zap, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';
import Landing3DBackground from './Landing3DBackground';

export default function LandingContent() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const features = [
    {
      icon: <Layers className="w-8 h-8 text-blue-500" />,
      title: t.landing.multiIssuer,
      desc: t.landing.multiIssuerDesc,
      gradient: 'from-blue-500/20 to-blue-500/5',
      border: 'hover:border-blue-500/50',
    },
    {
      icon: <Globe className="w-8 h-8 text-emerald-500" />,
      title: t.landing.globalMapping,
      desc: t.landing.globalMappingDesc,
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      border: 'hover:border-emerald-500/50',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-violet-500" />,
      title: t.landing.serverless,
      desc: t.landing.serverlessDesc,
      gradient: 'from-violet-500/20 to-violet-500/5',
      border: 'hover:border-violet-500/50',
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      title: t.landing.realtimeAnalytics,
      desc: t.landing.realtimeAnalyticsDesc,
      gradient: 'from-amber-500/20 to-amber-500/5',
      border: 'hover:border-amber-500/50',
    },
    {
      icon: <Shield className="w-8 h-8 text-rose-500" />,
      title: t.landing.privacyFirst,
      desc: t.landing.privacyFirstDesc,
      gradient: 'from-rose-500/20 to-rose-500/5',
      border: 'hover:border-rose-500/50',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-cyan-500" />,
      title: t.landing.immersive3D,
      desc: t.landing.immersive3DDesc,
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      border: 'hover:border-cyan-500/50',
    },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden relative flex flex-col justify-center items-center w-full">
      {/* 3D Background */}
      <Landing3DBackground />

      {/* Abstract Glowing Background layer for depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 bg-primary/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-16 pb-20 lg:pb-32 relative z-10 w-full flex flex-col items-center">
        <motion.div
          className="text-center max-w-4xl mx-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              {t.landing.nextGen}
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-foreground uppercase leading-tight"
          >
            {t.landing.unveil}{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-blue-500 to-violet-500 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
              {t.landing.exposure}
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-3xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light tracking-wide leading-relaxed"
          >
            {t.landing.subtitle}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full"
          >
            <Button
              render={<Link href="/analyzer" />}
              nativeButton={false}
              size="lg"
              className="px-12 py-8 text-lg font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_45px_rgba(34,211,238,0.6)] transition-all duration-300 scale-100 hover:scale-105"
            >
              {t.landing.launchSystem} <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <Button
              render={<Link href="https://github.com" target="_blank" />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="px-12 py-8 text-lg font-bold uppercase tracking-widest border-2 hover:bg-muted/50 transition-all duration-300 scale-100 hover:scale-105 backdrop-blur-sm"
            >
              {t.landing.viewSource}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-32 w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`bg-card/40 backdrop-blur-md border border-border/50 p-8 flex flex-col items-start text-left transition-all duration-300 rounded-2xl shadow-xl overflow-hidden relative group ${feature.border}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-background border border-border flex items-center justify-center mb-6 rounded-xl shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light text-sm">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}

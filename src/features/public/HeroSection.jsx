import { motion } from 'framer-motion';
import { ArrowRight, Clock3 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { scrollToSection } from '../../lib/utils';

/**
 * Font setup (add once, e.g. in layout.js via next/font/google):
 *
 *   import { Fraunces, Work_Sans, IBM_Plex_Mono } from 'next/font/google';
 *   const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
 *   const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans' });
 *   const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500','600'], variable: '--font-plex-mono' });
 *
 * Then add `${fraunces.variable} ${workSans.variable} ${plexMono.variable}` to your <body> className.
 * The inline fontFamily fallbacks below mean this component works even before that's wired up.
 */

const FONT_DISPLAY = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const FONT_BODY = "var(--font-work-sans), 'Work Sans', system-ui, sans-serif";
const FONT_MONO = "var(--font-plex-mono), 'IBM Plex Mono', monospace";

const INK = '#16332E';
const PAPER = '#FAF6EF';
const CLAY = '#B85C38';
const MARIGOLD = '#E8A33D';
const SAGE = '#7FA593';

const DARK_INK = '#E7F2ED';
const DARK_PAPER = '#071512';
const DARK_CLAY = '#F39A72';
const DARK_MARIGOLD = '#F4B95A';
const DARK_SAGE = '#8FC7AD';

const HeroSection = () => {
  const { settings } = useSettings();
  const { isDark } = useTheme();
  const { hero } = settings;

  // Repurpose settings.hero.stats (if present) as a compact "care team today" line
  // instead of a floating stat-card grid.
  const availability = (hero?.stats || []).slice(0, 3);
  const palette = isDark
    ? {
        ink: DARK_INK,
        paper: DARK_PAPER,
        clay: DARK_CLAY,
        marigold: DARK_MARIGOLD,
        sage: DARK_SAGE,
        mutedInk: '#A7BBB4',
        card: '#0D211D',
        secondaryHover: 'rgba(255, 255, 255, 0.06)',
        texture: '#E7F2ED',
        statusText: '#BCE6D2',
      }
    : {
        ink: INK,
        paper: PAPER,
        clay: CLAY,
        marigold: MARIGOLD,
        sage: SAGE,
        mutedInk: `${INK}99`,
        card: '#FFFFFF',
        secondaryHover: 'rgba(0, 0, 0, 0.03)',
        texture: INK,
        statusText: '#3F6656',
      };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: palette.paper, fontFamily: FONT_BODY }}
    >
      {/* Faint paper texture / warmth, not a gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            `radial-gradient(circle at 1px 1px, ${palette.texture} 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 xl:gap-20 items-center">
          {/* ---------- LEFT: copy ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 mb-7 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: FONT_MONO, color: palette.clay }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: palette.sage }}
              />
              {settings.tagline || 'Mechi Clinic · Open Today'}
            </motion.span>

            <h1
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] tracking-tight mb-6"
              style={{ fontFamily: FONT_DISPLAY, color: palette.ink }}
            >
              {hero?.title || 'Care that keeps its promises.'}
            </h1>

            <p
              className="text-lg leading-relaxed mb-9"
              style={{ color: palette.mutedInk }}
            >
              {hero?.subtitle ||
                'Same-day visits, honest diagnoses, and a team that remembers your name — comprehensive family medicine, done properly.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="#appointment"
                onClick={(e) => { e.preventDefault(); scrollToSection('#appointment'); }}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: palette.clay, boxShadow: `0 10px 24px -8px ${palette.clay}80` }}
              >
                {hero?.ctaPrimary || 'Book an appointment'}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-lg font-semibold border-2 transition-colors"
                style={{ borderColor: `${palette.ink}33`, color: palette.ink }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = palette.secondaryHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {hero?.ctaSecondary || 'Meet the doctors'}
              </a>
            </div>

            {/* hairline divider — separates promise from the practical facts */}
            <div className="h-px w-full mb-6" style={{ backgroundColor: `${palette.ink}22` }} />

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <span
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: palette.ink }}
              >
                <Clock3 className="h-4 w-4" style={{ color: palette.sage }} />
                24/7 emergency line
              </span>
              {availability.length > 0 &&
                availability.map((stat) => (
                  <span
                    key={stat.label}
                    className="text-sm"
                    style={{ color: palette.mutedInk }}
                  >
                    <strong style={{ color: palette.ink, fontFamily: FONT_MONO }}>
                      {stat.value}
                    </strong>{' '}
                    {stat.label}
                  </span>
                ))}
            </div>
          </motion.div>

          {/* ---------- RIGHT: photo + signature token slip ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto max-w-md">
              {/* Photo card — sits back, no gradient caption overlay */}
              <div
                className="overflow-hidden rounded-2xl shadow-xl"
                style={{ boxShadow: `0 24px 48px -20px ${isDark ? '#000000AA' : `${INK}55`}` }}
              >
                <img
                  src={
                    hero?.imageUrl ||
                    'https://images.unsplash.com/photo-1629909613654-28e37737a7fe?w=800&auto=format&fit=crop'
                  }
                  alt="Doctor at Mechi Clinic"
                  className="h-[440px] w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop';
                  }}
                />
              </div>

              {/* Signature element: the appointment token slip */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
                whileHover={{ rotate: -3, scale: 1.02 }}
                className="ticket absolute -bottom-10 -left-10 w-60 rounded-md transition-colors duration-300"
                style={{
                  backgroundColor: palette.card,
                  boxShadow: `0 18px 32px -12px ${isDark ? '#000000CC' : `${INK}66`}`,
                  fontFamily: FONT_MONO,
                  '--ticket-paper': palette.paper,
                  '--ticket-perf': `${palette.ink}2a`,
                }}
              >
                <div className="px-5 pt-5 pb-6">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: palette.mutedInk }}
                  >
                    Mechi Clinic — Token
                  </p>
                  <p
                    className="mt-1 text-3xl font-bold"
                    style={{ color: palette.clay }}
                  >
                    No. 014
                  </p>
                </div>

                <div className="ticket-perf" />

                <div className="px-5 pt-6 pb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: palette.ink }}>
                      Dr. R. Sharma
                    </p>
                    <p className="text-[10px]" style={{ color: palette.mutedInk }}>
                      Today · 10:30 AM
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${palette.sage}26`, color: palette.statusText }}
                  >
                    On time
                  </span>
                </div>
              </motion.div>

              {/* Small marigold accent chip, quiet counterweight to the ticket */}
              <div
                className="absolute -top-5 -right-5 h-14 w-14 rounded-full"
                style={{ backgroundColor: palette.marigold, opacity: 0.9 }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .ticket {
          position: relative;
        }
        .ticket::before,
        .ticket::after {
          content: '';
          position: absolute;
          top: 78px;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: var(--ticket-paper);
        }
        .ticket::before {
          left: -9px;
        }
        .ticket::after {
          right: -9px;
        }
        .ticket-perf {
          position: absolute;
          top: 87px;
          left: 12px;
          right: 12px;
          border-top: 2px dashed var(--ticket-perf);
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

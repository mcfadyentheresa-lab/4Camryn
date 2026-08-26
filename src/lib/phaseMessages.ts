export const PHASE_MESSAGES: Record<number, { heading: string; body: string; proofs: string[]; nextTeaser: string }> = {
  1: {
    heading: 'Foundation phase complete.',
    body: "You've proven five of the highest-leverage habits in the protocol. Sleep, hydration, gut health, fiber, and daily check-in — these are not beginner habits. They're the infrastructure that makes everything else possible.",
    proofs: [
      'Fixed sleep/wake time held for 21 days',
      'Morning hydration for 14 consecutive days',
      'Fiber goal met for 2 weeks',
      'Fermented food daily for 14 days',
      '14 days of daily check-ins',
    ],
    nextTeaser: 'Phase 2 — Ignition builds on this foundation with structured nutrition, movement, and skin + hair consistency. Your body is ready.',
  },
  2: {
    heading: 'Ignition phase complete.',
    body: "Six weeks of structured nutrition, daily movement, and consistent skincare. You built the habits that most people skip because they feel too slow. They're not slow — they're compound.",
    proofs: [
      'Protein target hit 5/7 days for 3 weeks',
      'Eating window maintained for 14 days',
      'Daily walks completed for 30 days',
      'Strength 2×/week held for 4 weeks',
      'Skincare routine for 30 days',
    ],
    nextTeaser: 'Phase 3 — Build is where visible change compounds. Body composition, hormone tuning, and joint health. This is what the first 12 weeks were preparing you for.',
  },
  3: {
    heading: 'Build phase complete.',
    body: "Ten weeks of progressive strength, hormone support, and joint care. Your body isn't just healthier now — it's structurally different. You've built the physical infrastructure that the rest of the protocol will maintain and refine.",
    proofs: [
      'Cycle-adapted training sustained for 6 weeks',
      'Joint mobility practiced daily for 30 days',
      'Omega-3 taken consistently for 42 days',
      'Hormone support stack maintained for 42 days',
      'Hormone bloodwork completed',
    ],
    nextTeaser: 'Phase 4 — Integrate shifts from physical to psychological. Identity, stress mastery, relationships, and environment. This is where temporary habits become permanent.',
  },
  4: {
    heading: 'Integrate phase complete.',
    body: "You've moved beyond doing healthy things to becoming someone who does them. Breathwork, cold exposure, identity journaling, and stress mastery aren't tasks you check off anymore — they're part of how you respond to life.",
    proofs: [
      'Daily breathwork for 30 days',
      'Cold exposure 3×/week for 6 weeks',
      'Weekly identity journal for 8 weeks',
      'Stress recovery under 5 minutes on 3 occasions',
      'Full protocol sustained through one hard week',
    ],
    nextTeaser: 'Phase 5 — Sustain builds the systems that make this last for decades. Longevity, purpose, resilience through disruption, and maintenance protocols that survive real life.',
  },
  5: {
    heading: 'Sustain phase complete.',
    body: "You've proven your protocol works under real conditions — travel, stress, disruption, imperfection. Zone 2 cardio, bone-loading, and purpose-driven motivation are now part of your baseline. This isn't a health kick anymore. It's how you live.",
    proofs: [
      'Zone 2 cardio 2×/week for 8 weeks',
      'Protocol held through one disrupted week',
      'Annual bloodwork completed and reviewed',
      'Bone-loading movement weekly for 8 weeks',
      'Protocol maintained at ≥80% for 12 weeks',
    ],
    nextTeaser: 'Phase 6 — Thrive is the culmination of Arc 1. Full integration review, expansion, sharing what you\'ve learned, and preparing the foundation for Arc 2. You are no longer becoming — you are being.',
  },
  6: {
    heading: 'Thrive phase complete.',
    body: "Arc 1 is done. Fifty-two weeks of protocol — from sleep and hydration to strength, hormones, identity, and purpose. You've reviewed your transformation, mentored someone else, and built a vision for what comes next. This isn't the end. It's the platform.",
    proofs: [
      'Arc 1 review written and reviewed',
      'All Phase 6 modules completed',
      'Someone meaningfully supported in their health',
      'Arc 2 vision and top 3 priorities defined',
      '52 weeks of at least partial protocol adherence',
    ],
    nextTeaser: 'Arc 2 begins. The habits are maintained; the focus shifts to performance, legacy, and mastery across all life domains. Arc 1 built the body. Arc 2 builds the life.',
  },
};

import { CYCLE_PHASES } from '../lib/protocol';

const CYCLE_EDUCATION: Record<string, any> = {
  Menstruation: {
    days: 'Days 1–6',
    intro: 'Estrogen and progesterone are at their lowest. Your body is doing real physiological work — rest, warmth, and iron-rich nutrition is the correct response.',
    cards: [
      { title: 'Hormones', body: 'Estrogen and progesterone drop sharply, triggering the bleed. FSH begins to rise slowly toward the end, signalling the start of follicle recruitment.' },
      { title: 'Energy & training', body: 'Strength and endurance are at their lowest. Gentle movement — walking, yoga, stretching — supports circulation without adding inflammatory stress.' },
      { title: 'What your body needs', body: 'Iron-rich foods (lentils, leafy greens, red meat), anti-inflammatory foods (turmeric, omega-3, berries), warmth, and extra sleep.' },
    ],
  },
  Follicular: {
    days: 'Days 7–13',
    intro: 'Your rising window — energy, mood, motivation, and cognitive sharpness all increase as estrogen climbs. Best phase for new habits and hard challenges.',
    cards: [
      { title: 'Hormones', body: 'FSH stimulates follicle development. As follicles grow they produce increasing estrogen. Testosterone also rises modestly, supporting drive.' },
      { title: 'Energy & training', body: 'Your most metabolically efficient phase. Insulin sensitivity is high, recovery is faster. Ideal for progressive overload and more intense cardio.' },
      { title: 'What your body needs', body: 'Protein to support muscle adaptation, cruciferous vegetables to support estrogen metabolism, and complex carbohydrates for sustained energy.' },
    ],
  },
  Ovulation: {
    days: 'Days 14–16',
    intro: 'A short, high-performance window. Estrogen peaks, testosterone briefly surges — strength, endurance, mood, and social energy all peak.',
    cards: [
      { title: 'Hormones', body: 'An LH surge triggers egg release. Estrogen peaks just before ovulation. Testosterone rises briefly, increasing confidence and physical drive.' },
      { title: 'Energy & training', body: 'Pain tolerance is highest, strength output is highest, recovery is fastest. Ideal for personal bests and high-intensity work.' },
      { title: 'What your body needs', body: 'Zinc and antioxidants to support the ovulation process. Adequate protein to support muscle repair after hard sessions.' },
    ],
  },
  'Early luteal': {
    days: 'Days 17–24',
    intro: 'A steadier, deeper-focus window. Progesterone rises, shifting your body toward recovery, structure, and consistency.',
    cards: [
      { title: 'Hormones', body: 'The corpus luteum produces progesterone, which rises steadily. Body temperature rises by 0.2–0.5°C, increasing perceived exertion.' },
      { title: 'Energy & training', body: 'Strength is still good but endurance drops slightly. Prioritise strength over cardio and increase rest between sets.' },
      { title: 'What your body needs', body: 'More protein (progesterone increases breakdown), magnesium to support sleep and mood, complex carbs for the slight insulin resistance increase.' },
    ],
  },
  'Late luteal': {
    days: 'Days 25–28',
    intro: 'Estrogen and progesterone both drop, triggering PMS symptoms. How severe they are depends largely on what you did in the two weeks before.',
    cards: [
      { title: 'Hormones', body: 'Both estrogen and progesterone decline sharply. The progesterone drop is the primary PMS driver — mood changes, bloating, cravings, sleep disruption.' },
      { title: 'Energy & training', body: 'Energy is at its second-lowest point. Focus on mobility, walking, and lighter strength work. Pushing hard increases cortisol and worsens symptoms.' },
      { title: 'What your body needs', body: 'Magnesium glycinate, reduced sugar and alcohol, complex carbohydrates for serotonin support, and extra sleep.' },
    ],
  },
};

const ALL_PHASES = CYCLE_PHASES.filter(p => p.name !== 'Not sure').map(p => p.name);

interface CycleLearnModalProps {
  phaseName: string;
  onClose: () => void;
}

export default function CycleLearnModal({ phaseName, onClose }: CycleLearnModalProps) {
  const phase = CYCLE_EDUCATION[phaseName] || CYCLE_EDUCATION['Early luteal'];
  const activeName = CYCLE_EDUCATION[phaseName] ? phaseName : 'Early luteal';

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-sheet">
        <div className="modal-header">
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {phase.days}
            </p>
            <h3 className="modal-title">{activeName} phase</h3>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ margin: '0 0 18px', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          {phase.intro}
        </p>

        <div className="cycle-card-grid">
          {phase.cards.map((card: any, i: number) => (
            <div key={i} className="cycle-info-card">
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </div>
          ))}
        </div>

        <div className="cycle-modal-nav">
          {ALL_PHASES.map((name) => (
            <button
              key={name}
              className={`cycle-nav-btn ${name === activeName ? 'active' : ''}`}
              onClick={() => {}}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

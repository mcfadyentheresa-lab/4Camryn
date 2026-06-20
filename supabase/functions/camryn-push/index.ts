import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// ---------------------------------------------------------------------------
// Message pool — keyed by protocol phase (1-6) × cycle phase
// Each entry is an array; one is picked randomly each day.
// ---------------------------------------------------------------------------
const MESSAGES: Record<string, Record<string, string[]>> = {
  '1': {
    Menstruation: [
      "Rest is the protocol today. Warmth, iron-rich food, gentle movement — that's your Foundation work.",
      "Your body is doing its own heavy lifting right now. Hydrate, rest, and let Camryn handle the rest.",
      "Low-demand day by design. Sleep, nourishment, and showing up counts as progress.",
    ],
    Follicular: [
      "Estrogen is rising — your brain is primed for new habits. Lock in your sleep window today.",
      "Rising energy, rising focus. This is your best window to wire in the Foundation habits.",
      "Today's the day to stack a new habit. Hydrate first, then build from there.",
    ],
    Ovulation: [
      "Peak energy meets Foundation week. Use the clarity to review what's sticking.",
      "High output window. Nail your fiber goal and morning hydration — momentum compounds.",
      "Your body's at its strongest today. Use it to anchor the habits that carry you forward.",
    ],
    'Early luteal': [
      "Progesterone is steadying you. Structure helps — keep your sleep and hydration consistent.",
      "Steady effort is the protocol. Your Foundation habits thrive in this window.",
      "The work you do in Early Luteal sticks. Prioritise sleep and fermented food today.",
    ],
    'Late luteal': [
      "Wind-down mode is productive mode. Protect your screen cutoff and sleep tonight.",
      "Your nervous system needs warmth and routine right now. Foundation habits are your anchor.",
      "Lower tolerance window — reduce demands and lean into the habits that soothe, not stress.",
    ],
    'Not sure': [
      "Whatever your cycle, your Foundation habits are today's priority. Start with water.",
      "Protocol day: sleep, hydration, fiber. Small inputs, compounding outputs.",
      "Today's a protocol fundamentals day. Nail one habit and the rest follow.",
    ],
  },
  '2': {
    Menstruation: [
      "Rest-forward day — your protein goal still matters. Warm, nourishing meals count.",
      "Easy movement is movement. A gentle walk today keeps the Ignition phase on track.",
      "Your body is restoring itself. Magnesium tonight, iron-rich food today.",
    ],
    Follicular: [
      "Rising estrogen makes today your best strength day of the cycle. Don't skip it.",
      "Follicular phase + Ignition = your highest return window. Hit your protein target.",
      "Your brain and body are both peaking. Lock in your eating window today.",
    ],
    Ovulation: [
      "Peak window. This is the day to push output — add weight, extend duration.",
      "Estrogen and testosterone both high. Strength session + protein target today.",
      "Highest performance day of your cycle. Use it. SPF on, strength in.",
    ],
    'Early luteal': [
      "Maintain your structure — protein, walks, and magnesium are your anchors this week.",
      "Progesterone supports recovery. Keep your protein high and sleep protected.",
      "Steady phase, steady gains. Your skincare and movement routine pays off here.",
    ],
    'Late luteal': [
      "Lower intensity today is smart protocol, not slacking. Walk instead of pushing.",
      "Your body needs magnesium and less demand right now. Honour that.",
      "Soothing rituals over hard sessions. Electrolytes and a walk are your Ignition work today.",
    ],
    'Not sure': [
      "Protein at breakfast. Walk today. Magnesium tonight. That's your Ignition protocol.",
      "Three things: protein target, daily walk, skincare routine. Start with the first.",
      "Your Ignition phase is about consistency, not intensity. Show up small today.",
    ],
  },
  '3': {
    Menstruation: [
      "Rest is recovery. Omega-3 and collagen today — Build phase work done gently.",
      "Your body is in repair mode. Collagen, warmth, and seed cycling keep the protocol moving.",
      "Low-output day by design. Omega-3 counts. Rest counts. You're still in the Build.",
    ],
    Follicular: [
      "Follicular phase is your peak training window. Progressive overload starts today.",
      "Rising estrogen means rising capacity. Push the strength session — this is what the Build phase is for.",
      "Cycle-sync your training: hardest sessions go here. Your joints and hormones are ready.",
    ],
    Ovulation: [
      "Peak output phase. Max effort today — strength, intensity, and collagen to support it.",
      "Best performance window of your cycle. Add weight. Extend duration. Then recover well.",
      "This is the window the Build phase was designed for. Go hard, then go to bed early.",
    ],
    'Early luteal': [
      "Maintain your three sessions. Progesterone supports protein synthesis — use it.",
      "Steady gains phase. Hormone stack, omega-3, and seed cycling keep the Build on track.",
      "Deep practice window. Your body responds well to volume right now — consistent effort pays.",
    ],
    'Late luteal': [
      "Reduce intensity, maintain movement. Stress log and seed cycling are your Build work today.",
      "Your stress tolerance is lower — protect it. Omega-3 and magnesium are your protocol.",
      "Wind down the hard sessions. Mobility and collagen are the right Build tools right now.",
    ],
    'Not sure': [
      "Build phase today: strength, omega-3, collagen. Pick the one you've been skipping.",
      "Three sessions a week. Hormone stack daily. Collagen with vitamin C. That's the Build.",
      "Progressive overload doesn't stop on hard days — it just looks different. Move something today.",
    ],
  },
  '4': {
    Menstruation: [
      "Rest is regulation. Your breathwork practice is especially powerful during menstruation.",
      "Low-demand day — journal your needs, not your performance. Integrate phase work done right.",
      "Your nervous system is most sensitive now. Five minutes of breathwork changes the day.",
    ],
    Follicular: [
      "Rising estrogen lifts confidence and social ease. Today is your day for the hard conversation.",
      "Your identity work lands in Follicular phase. Journal your needs and take one brave action.",
      "Neuroplasticity peaks here. Cold exposure + identity journal = your Integrate protocol today.",
    ],
    Ovulation: [
      "Peak confidence, peak social energy. This is your window for the needs conversation.",
      "Highest output day of your cycle — use it for connection, not just output.",
      "Your voice carries most here. Say the thing you've been putting off.",
    ],
    'Early luteal': [
      "HRV and recovery are your Integrate metrics this week. Protect your sleep fiercely.",
      "Progesterone steadies your emotional baseline. Good window for environment audit work.",
      "Steady phase for steady identity work. Cycle your social calendar around your energy.",
    ],
    'Late luteal': [
      "Regulation before performance. Five-minute stress recovery practice, right now.",
      "Your Integrate work is nervous system support today — breathwork, warmth, no hard asks.",
      "Lower tolerance is data, not weakness. Rest is the protocol. Breathwork is the anchor.",
    ],
    'Not sure': [
      "Daily breathwork. One identity journal entry. That's your Integrate work today.",
      "Integrate phase: the work is internal. Five minutes of breathwork counts as progress.",
      "Your nervous system is the system. Regulate it first, then everything else follows.",
    ],
  },
  '5': {
    Menstruation: [
      "Rest is longevity work. Zone 2 waits — your Sustain protocol allows for this.",
      "Your annual bloodwork window is now. Rest today, act on the data this week.",
      "Minimum effective dose includes rest. That's your Sustain protocol today.",
    ],
    Follicular: [
      "Rising energy meets a long game. Zone 2 cardio in Follicular phase compounds over years.",
      "Best strength and endurance window of your cycle. Your bone-loading session goes here.",
      "Your Sustain phase is about playing the long game. Today, lay down a zone 2 session.",
    ],
    Ovulation: [
      "Peak window in your longest phase. Use it for the health identity act you've been postponing.",
      "Highest output of your cycle meets your highest-stakes phase. Make it count.",
      "Purpose statement review goes here — when you feel most like yourself, write it down.",
    ],
    'Early luteal': [
      "Steady effort sustains over years. Your bone-loading and zone 2 routines are the protocol.",
      "Progesterone supports recovery. This is your disruption-protocol test window.",
      "Maintenance tested under good conditions. Sustain phase is about proving the floor holds.",
    ],
    'Late luteal': [
      "Minimum effective dose is a Sustain principle. Protect the baseline, reduce the extras.",
      "Lower demand window — keep zone 2 gentle and protect your recovery protocol.",
      "Wind down without dropping off. Sustain means the floor never disappears.",
    ],
    'Not sure': [
      "Zone 2. Bone loading. Purpose. Pick one and do it today.",
      "Your Sustain phase is the longest — consistency beats intensity here every time.",
      "The protocol you maintain when life is hard is the only protocol that matters.",
    ],
  },
  '6': {
    Menstruation: [
      "Rest with intention. Review your Arc 1 written summary while you restore.",
      "Your Thrive phase includes full permission to rest. Use it to reflect on how far you've come.",
      "Restoration and review — two things the Thrive phase asks of you today.",
    ],
    Follicular: [
      "Rising energy in your final arc. What does Arc 2 look like from here?",
      "Your Arc 2 vision gets clearer in Follicular phase. Write one sentence of it today.",
      "Highest neuroplasticity of your cycle — use it to mentor, plan, or set Arc 2 priorities.",
    ],
    Ovulation: [
      "Peak energy, final arc. Today is the day to mentor someone or act on your Arc 2 plan.",
      "Your voice, your vision, your cycle peak. Make something with it today.",
      "This is what 52 weeks of protocol built. Use the peak to move toward Arc 2.",
    ],
    'Early luteal': [
      "Maintenance tested, phase modules complete. Steady work in the final stretch.",
      "Progesterone and a year of protocol behind you. Today is deep practice, not new starts.",
      "You've built the foundation. Early Luteal in Thrive phase is about protecting what works.",
    ],
    'Late luteal': [
      "Wind down well. Your year-completion review starts now — what do you want to carry forward?",
      "Late Luteal in the final arc: review, restore, and prepare. Arc 2 starts with rest.",
      "Everything you've built is tested in this phase. Trust the protocol. Rest tonight.",
    ],
    'Not sure': [
      "You've completed 52 weeks of protocol. Today's work is reflection, not striving.",
      "Arc 2 is ahead. Today, write one thing you want it to look like.",
      "Thrive phase: the work is integration. Breathe, review, and set your next horizon.",
    ],
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMessage(phase: number, cyclePhase: string): { title: string; body: string } {
  const phasePool = MESSAGES[String(phase)] ?? MESSAGES['1'];
  const cyclePool = phasePool[cyclePhase] ?? phasePool['Not sure'];
  const body = pick(cyclePool);
  return { title: 'Camryn', body };
}

// ---------------------------------------------------------------------------
// VAPID signing (manual, no external library)
// ---------------------------------------------------------------------------
async function importVapidPrivateKey(b64url: string): Promise<CryptoKey> {
  const padding = '='.repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  // Wrap raw private key scalar in PKCS8 DER for P-256
  const pkcs8 = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48,
    0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03,
    0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
    ...raw,
  ]);
  return crypto.subtle.importKey('pkcs8', pkcs8, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function makeVapidJWT(audience: string, subject: string, privateKey: CryptoKey): Promise<string> {
  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ aud: audience, exp: now + 43200, sub: subject })));
  const sigInput = new TextEncoder().encode(`${header}.${payload}`);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, sigInput);
  return `${header}.${payload}.${b64url(sig)}`;
}

// ---------------------------------------------------------------------------
// Web Push encryption (ECDH + HKDF + AES-GCM)
// ---------------------------------------------------------------------------
async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string,
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const dec = (b64: string) => {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const b = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  };

  const clientPublicKeyRaw = dec(p256dhB64);
  const authSecret = dec(authB64);

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    'raw', clientPublicKeyRaw,
    { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );

  // Generate server ephemeral key pair
  const serverPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const serverPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverPair.publicKey));

  // ECDH shared secret
  const sharedBits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: clientKey }, serverPair.privateKey, 256));

  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF to derive content encryption key and nonce
  const hkdf = async (ikm: Uint8Array, salt_: Uint8Array, info: Uint8Array, len: number) => {
    const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: salt_, info }, key, len * 8));
  };

  const prk = await hkdf(
    sharedBits,
    authSecret,
    concat(new TextEncoder().encode('Content-Encoding: auth\0'), new Uint8Array([1])),
    32
  );

  const keyInfo = concat(
    new TextEncoder().encode('Content-Encoding: aesgcm\0'),
    new Uint8Array([0x41]),
    clientPublicKeyRaw,
    new Uint8Array([0x41]),
    serverPublicKeyRaw
  );
  const nonceInfo = concat(
    new TextEncoder().encode('Content-Encoding: nonce\0'),
    new Uint8Array([0x41]),
    clientPublicKeyRaw,
    new Uint8Array([0x41]),
    serverPublicKeyRaw
  );

  const contentKey = await hkdf(prk, salt, keyInfo, 16);
  const nonce = await hkdf(prk, salt, nonceInfo, 12);

  const encKey = await crypto.subtle.importKey('raw', contentKey, 'AES-GCM', false, ['encrypt']);

  const plaintext = new TextEncoder().encode(payload);
  const padded = new Uint8Array(2 + plaintext.length);
  padded.set(plaintext, 2); // 2-byte zero padding length prefix

  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, encKey, padded));
  return { ciphertext, salt, serverPublicKey: serverPublicKeyRaw };
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

// ---------------------------------------------------------------------------
// Send a push to one subscription
// ---------------------------------------------------------------------------
async function sendPush(
  endpoint: string,
  p256dh: string,
  authKey: string,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: CryptoKey,
): Promise<void> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await makeVapidJWT(audience, 'mailto:camryn@app.com', vapidPrivateKey);

  const { ciphertext, salt, serverPublicKey } = await encryptPayload(payload, p256dh, authKey);

  const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const headers: Record<string, string> = {
    'Authorization': `WebPush ${jwt}`,
    'Crypto-Key': `dh=${b64(serverPublicKey)};p256ecdsa=${vapidPublicKey}`,
    'Encryption': `salt=${b64(salt)}`,
    'Content-Encoding': 'aesgcm',
    'Content-Type': 'application/octet-stream',
    'TTL': '86400',
  };

  await fetch(endpoint, { method: 'POST', headers, body: ciphertext });
}

// ---------------------------------------------------------------------------
// Edge function entry
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const db = createClient(supabaseUrl, serviceKey);

    // Read VAPID keys from vault
    const { data: secrets } = await db.rpc('read_vapid_secrets');
    const vapidPublic: string = secrets?.public_key ?? '';
    const vapidPrivateB64: string = secrets?.private_key ?? '';
    if (!vapidPublic || !vapidPrivateB64) throw new Error('VAPID keys not configured');

    const privateKey = await importVapidPrivateKey(vapidPrivateB64);

    // Fetch all subscriptions joined with session data
    const { data: subs, error } = await db
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth_key, user_id');

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userIds = [...new Set(subs.map((s: { user_id: string }) => s.user_id))];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const [sessionsRes, vitalsRes] = await Promise.all([
      db.from('camryn_sessions')
        .select('user_id, current_phase, cycle_phase_name, last_period_date')
        .in('user_id', userIds),
      db.from('camryn_vitals')
        .select('user_id, resting_hr, hrv_ms, sleep_hours, steps')
        .in('user_id', userIds)
        .eq('entry_date', yesterdayStr),
    ]);

    const sessionMap = new Map(
      (sessionsRes.data ?? []).map((s: { user_id: string; current_phase: number; cycle_phase_name: string }) => [s.user_id, s])
    );
    const vitalsMap = new Map(
      (vitalsRes.data ?? []).map((v: { user_id: string; resting_hr: number | null; hrv_ms: number | null; sleep_hours: number | null; steps: number | null }) => [v.user_id, v])
    );

    // Fetch 14-day HRV averages for users who have vitals
    const vitalsUserIds = [...vitalsMap.keys()];
    const hrvAvgMap = new Map<string, number | null>();
    if (vitalsUserIds.length > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);
      const { data: hrvRows } = await db
        .from('camryn_vitals')
        .select('user_id, hrv_ms')
        .in('user_id', vitalsUserIds)
        .gte('entry_date', cutoff.toISOString().split('T')[0])
        .not('hrv_ms', 'is', null);

      const grouped: Record<string, number[]> = {};
      for (const row of (hrvRows ?? [])) {
        if (!grouped[row.user_id]) grouped[row.user_id] = [];
        grouped[row.user_id].push(row.hrv_ms);
      }
      for (const [uid, vals] of Object.entries(grouped)) {
        hrvAvgMap.set(uid, vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null);
      }
    }

    let sent = 0;
    for (const sub of subs) {
      const session = sessionMap.get(sub.user_id) as { current_phase: number; cycle_phase_name: string } | undefined;
      const phase = session?.current_phase ?? 1;
      const cyclePhase = session?.cycle_phase_name ?? 'Not sure';
      const vitals = vitalsMap.get(sub.user_id);
      const hrvAvg14 = hrvAvgMap.get(sub.user_id) ?? null;

      let title = 'Camryn';
      let body: string;

      // Vitals-driven override when we have enough data for a meaningful signal
      if (vitals && hrvAvg14 != null && vitals.hrv_ms != null) {
        const deviationPct = ((vitals.hrv_ms - hrvAvg14) / hrvAvg14) * 100;
        if (deviationPct <= -15) {
          body = vitals.sleep_hours != null && vitals.sleep_hours < 6
            ? `You got ${vitals.sleep_hours.toFixed(1)} hours last night and your HRV is down. Today is a rest day — protect your recovery.`
            : `Your recovery data is low today. Lower intensity, extra water, and protect tonight's sleep.`;
        } else if (deviationPct >= 10 && (cyclePhase === 'Follicular' || cyclePhase === 'Ovulation')) {
          body = `Your HRV is above baseline and you're in ${cyclePhase} phase. This is your peak window — use it.`;
        } else if (vitals.sleep_hours != null && vitals.sleep_hours < 6) {
          body = `You were under 6 hours last night. Before anything else — acknowledge that and reduce today's demands.`;
        } else {
          const { body: msgBody } = getMessage(phase, cyclePhase);
          body = msgBody;
        }
      } else {
        const { body: msgBody } = getMessage(phase, cyclePhase);
        body = msgBody;
      }

      const payload = JSON.stringify({ title, body, url: '/' });

      try {
        await sendPush(sub.endpoint, sub.p256dh, sub.auth_key, payload, vapidPublic, privateKey);
        sent++;
      } catch {
        // Subscription likely expired — remove it
        await db.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import React, { useMemo, useState } from "react";

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const basePlayerDeck = [
  {
    id: "ai-001",
    name: "전술 분석",
    type: "AI 명령",
    cost: 0,
    text: "카드 2장을 뽑는다. 다음 공격 피해 +1.",
    effect: "draw2_buff"
  },
  {
    id: "ai-002",
    name: "표적 고정",
    type: "AI 명령",
    cost: 0,
    text: "이번 턴 다음 피해 +2.",
    effect: "damage_buff2"
  },
  {
    id: "ai-003",
    name: "냉정한 계산",
    type: "AI 명령",
    cost: 0,
    text: "동기화율 +2. 오염도 -1.",
    effect: "sync_cleanse"
  },
  {
    id: "ai-004",
    name: "방어 자세",
    type: "AI 명령",
    cost: 0,
    text: "이번 라운드 받는 체력 피해 -2.",
    effect: "shield2"
  },
  {
    id: "frag-001",
    name: "심해 촉수 전개",
    type: "파편 권능",
    cost: 0,
    text: "보스에게 피해 5. 오염도 +2.",
    effect: "damage5_corrupt2"
  },
  {
    id: "frag-002",
    name: "꿈의 침식",
    type: "파편 권능",
    cost: 0,
    text: "보스의 다음 패턴을 약화한다. 오염도 +3, 동기화율 -1.",
    effect: "weaken_boss_corrupt3"
  },
  {
    id: "frag-003",
    name: "고대 혈류 가속",
    type: "파편 권능",
    cost: 0,
    text: "카드 3장을 뽑는다. 오염도 +2.",
    effect: "draw3_corrupt2"
  },
  {
    id: "human-001",
    name: "궤도 폭격 요청",
    type: "인류 지원",
    cost: 0,
    text: "보스에게 피해 7. 인류 잔존율 -4.",
    effect: "damage7_humanity4"
  },
  {
    id: "human-002",
    name: "긴급 냉각 장치",
    type: "인류 지원",
    cost: 0,
    text: "오염도 -3. 이번 턴 다음 파편 권능 피해 -2.",
    effect: "cleanse3_fragment_weak"
  },
  {
    id: "ritual-001",
    name: "봉인 회로 연결",
    type: "의식",
    cost: 0,
    text: "의식 진행도 +6. 동기화율 -1.",
    effect: "ritual6_sync1"
  },
  {
    id: "ritual-002",
    name: "라일리예 코드 주입",
    type: "의식",
    cost: 0,
    text: "의식 진행도 +10. 오염도 +2.",
    effect: "ritual10_corrupt2"
  },
  {
    id: "ritual-003",
    name: "인간 명령 재각인",
    type: "의식",
    cost: 0,
    text: "의식 진행도 +4. 동기화율 +2.",
    effect: "ritual4_sync2"
  }
];

const bossDeckBase = [
  {
    id: "b-001",
    name: "심해의 압력",
    type: "공격",
    text: "체력 피해 3. 현현도 +4.",
    effect: "hit3_manifest4"
  },
  {
    id: "b-002",
    name: "고대의 부름",
    type: "공포",
    text: "동기화율 -2. 오염도 +1.",
    effect: "sync2_corrupt1"
  },
  {
    id: "b-003",
    name: "별들이 정렬된다",
    type: "현현",
    text: "현현도 +10.",
    effect: "manifest10"
  },
  {
    id: "b-004",
    name: "심해인 군단",
    type: "소환",
    text: "심해인 1체 소환. 이미 하수인이 있으면 현현도 +4.",
    effect: "spawn_deepone"
  },
  {
    id: "b-005",
    name: "인간 언어의 붕괴",
    type: "왜곡",
    text: "카드 1장을 버린다. 의식 진행도 -3.",
    effect: "discard1_ritual3"
  },
  {
    id: "b-006",
    name: "거짓 명령 신호",
    type: "기만",
    text: "동기화율 -1. 다음 보스 피해 +2.",
    effect: "sync1_bossbuff2"
  },
  {
    id: "b-007",
    name: "가라앉는 도시",
    type: "재앙",
    text: "인류 잔존율 -5. 현현도 +3.",
    effect: "humanity5_manifest3"
  },
  {
    id: "b-008",
    name: "신성 조직의 반응",
    type: "오염",
    text: "오염도 +2. 오염도가 8 이상이면 폭주 카드 1장을 덱에 섞는다.",
    effect: "corrupt2_maybe_madness"
  }
];

const madnessCards = [
  {
    id: "m-001",
    name: "귀환 본능",
    type: "폭주",
    text: "사용 불가. 턴 종료 시 오염도 +1.",
    effect: "dead_corrupt1"
  },
  {
    id: "m-002",
    name: "심연의 기억",
    type: "폭주",
    text: "사용 불가. 손패에 남아 있으면 동기화율 -1.",
    effect: "dead_sync1"
  },
  {
    id: "m-003",
    name: "동족 인식",
    type: "폭주",
    text: "사용 불가. 손패에 남아 있으면 보스에게 주는 피해 -1.",
    effect: "dead_damage_down"
  }
];

const initialLog = [
  "R'lyeh Protocol 기동.",
  "C-Type 무심체 01번, 전투 의식 연결 완료.",
  "목표: 현현도 100 도달 전 의식 진행도 100 달성."
];

function shuffle(arr) {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function uniqueCard(card, index) {
  return { ...card, uid: `${card.id}-${Date.now()}-${Math.random()}-${index}` };
}

function buildPlayerDeck() {
  const doubled = [...basePlayerDeck, ...basePlayerDeck].map(uniqueCard);
  return shuffle(doubled);
}

function buildBossDeck() {
  const tripled = [...bossDeckBase, ...bossDeckBase, ...bossDeckBase].map(uniqueCard);
  return shuffle(tripled);
}

const getTypeClass = (type) => {
  switch (type) {
    case "AI 명령":
      return "border-cyan-400/40 bg-cyan-950/50";
    case "파편 권능":
      return "border-violet-400/40 bg-violet-950/50";
    case "인류 지원":
      return "border-emerald-400/40 bg-emerald-950/50";
    case "의식":
      return "border-amber-400/40 bg-amber-950/50";
    case "폭주":
      return "border-red-400/60 bg-red-950/60";
    default:
      return "border-slate-600 bg-slate-900/80";
  }
};

function StatBar({ label, value, max, danger = false }) {
  const pct = clamp((value / max) * 100, 0, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${danger ? "bg-red-400" : "bg-cyan-300"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Card({ card, onPlay, disabled }) {
  return (
    <button
      onClick={onPlay}
      disabled={disabled}
      className={`group min-h-48 rounded-2xl border p-4 text-left shadow-xl transition hover:-translate-y-1 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 ${getTypeClass(card.type)}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-black/30 px-2 py-1 text-[11px] text-slate-200">{card.type}</span>
        {card.type === "폭주" && <span className="text-xs text-red-200">사용 불가</span>}
      </div>
      <h3 className="text-base font-bold text-white">{card.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{card.text}</p>
      <p className="mt-4 text-xs text-slate-500">클릭해서 사용</p>
    </button>
  );
}

export default function App() {
  const [game, setGame] = useState(() => {
    const deck = buildPlayerDeck();
    const hand = deck.splice(0, 5);
    const bossDeck = buildBossDeck();
    return {
      phase: "player",
      round: 1,
      hp: 24,
      maxHp: 24,
      sync: 10,
      maxSync: 10,
      corruption: 0,
      humanity: 100,
      manifestation: 0,
      ritual: 0,
      bossHp: 60,
      bossMaxHp: 60,
      minions: 0,
      deck,
      hand,
      discard: [],
      bossDeck,
      bossDiscard: [],
      damageBuff: 0,
      bossWeakened: false,
      shield: 0,
      nextFragmentPenalty: 0,
      nextBossDamageBuff: 0,
      log: initialLog,
      status: "playing",
      lastBossCard: null
    };
  });

  const resultText = useMemo(() => {
    if (game.status === "win") return "봉인 성공";
    if (game.status === "lose") return "인류 멸망";
    return "작전 진행 중";
  }, [game.status]);

  const addLog = (state, message) => {
    state.log = [message, ...state.log].slice(0, 12);
  };

  const drawCards = (state, count) => {
    for (let i = 0; i < count; i++) {
      if (state.deck.length === 0) {
        state.deck = shuffle(state.discard);
        state.discard = [];
        addLog(state, "버린 카드 더미를 재구성해 덱으로 되돌렸다.");
      }
      if (state.deck.length === 0) return;
      state.hand.push(state.deck.shift());
    }
  };

  const addMadnessToDeck = (state) => {
    const card = uniqueCard(madnessCards[Math.floor(Math.random() * madnessCards.length)], 0);
    state.deck = shuffle([card, ...state.deck]);
    addLog(state, `폭주 카드 '${card.name}'가 덱에 섞였다.`);
  };

  const checkEnd = (state) => {
    state.hp = clamp(state.hp, 0, state.maxHp);
    state.sync = clamp(state.sync, 0, state.maxSync);
    state.corruption = clamp(state.corruption, 0, 12);
    state.humanity = clamp(state.humanity, 0, 100);
    state.manifestation = clamp(state.manifestation, 0, 100);
    state.ritual = clamp(state.ritual, 0, 100);
    state.bossHp = clamp(state.bossHp, 0, state.bossMaxHp);

    if (state.ritual >= 100) {
      state.status = "win";
      state.phase = "ended";
      addLog(state, "의식 진행도 100. 르뤼에 회선 절단 완료.");
    } else if (state.hp <= 0) {
      state.status = "lose";
      state.phase = "ended";
      addLog(state, "무심체가 기능 정지했다. 작전 실패.");
    } else if (state.sync <= 0) {
      state.status = "lose";
      state.phase = "ended";
      addLog(state, "동기화율 0. 무심체가 고대신의 부름에 귀속되었다.");
    } else if (state.manifestation >= 100) {
      state.status = "lose";
      state.phase = "ended";
      addLog(state, "현현도 100. 고대신이 완전히 깨어났다.");
    } else if (state.humanity <= 0) {
      state.status = "lose";
      state.phase = "ended";
      addLog(state, "인류 잔존율 0. 승리할 이유가 사라졌다.");
    }
  };

  const dealDamage = (state, amount, source = "") => {
    let damage = amount + state.damageBuff;
    if (state.nextFragmentPenalty && source === "fragment") {
      damage = Math.max(0, damage - state.nextFragmentPenalty);
      state.nextFragmentPenalty = 0;
    }
    const madnessPenalty = state.hand.some((c) => c.effect === "dead_damage_down") ? 1 : 0;
    damage = Math.max(0, damage - madnessPenalty);
    state.bossHp -= damage;
    state.damageBuff = 0;
    addLog(state, `보스에게 ${damage} 피해를 주었다.`);

    if (state.bossHp <= 0) {
      state.bossHp = state.bossMaxHp;
      state.ritual += 12;
      state.manifestation += 5;
      addLog(state, "현현체를 붕괴시켰다. 의식 진행도 +12, 그러나 잔향으로 현현도 +5.");
    }
  };

  const playCard = (uid) => {
    if (game.status !== "playing" || game.phase !== "player") return;
    setGame((prev) => {
      const state = clone(prev);
      const idx = state.hand.findIndex((c) => c.uid === uid);
      if (idx < 0) return prev;
      const card = state.hand[idx];

      if (card.type === "폭주") {
        addLog(state, `'${card.name}'는 사용할 수 없다.`);
        return state;
      }

      state.hand.splice(idx, 1);
      state.discard.push(card);
      addLog(state, `'${card.name}' 사용.`);

      switch (card.effect) {
        case "draw2_buff":
          drawCards(state, 2);
          state.damageBuff += 1;
          addLog(state, "전술 분석 완료. 다음 피해 +1.");
          break;
        case "damage_buff2":
          state.damageBuff += 2;
          addLog(state, "표적이 고정되었다. 다음 피해 +2.");
          break;
        case "sync_cleanse":
          state.sync += 2;
          state.corruption -= 1;
          addLog(state, "AI 코어 안정화. 동기화율 +2, 오염도 -1.");
          break;
        case "shield2":
          state.shield += 2;
          addLog(state, "방어 자세 전개. 이번 라운드 피해 -2.");
          break;
        case "damage5_corrupt2":
          dealDamage(state, 5, "fragment");
          state.corruption += 2;
          break;
        case "weaken_boss_corrupt3":
          state.bossWeakened = true;
          state.corruption += 3;
          state.sync -= 1;
          addLog(state, "보스의 다음 패턴이 약화된다.");
          break;
        case "draw3_corrupt2":
          drawCards(state, 3);
          state.corruption += 2;
          addLog(state, "고대 혈류가 가속된다. 카드 3장 드로우.");
          break;
        case "damage7_humanity4":
          dealDamage(state, 7, "human");
          state.humanity -= 4;
          addLog(state, "궤도 폭격으로 민간 구역 일부가 소실되었다.");
          break;
        case "cleanse3_fragment_weak":
          state.corruption -= 3;
          state.nextFragmentPenalty = 2;
          addLog(state, "긴급 냉각. 오염도 -3, 다음 파편 권능 피해 -2.");
          break;
        case "ritual6_sync1":
          state.ritual += 6;
          state.sync -= 1;
          addLog(state, "봉인 회로 연결. 의식 진행도 +6.");
          break;
        case "ritual10_corrupt2":
          state.ritual += 10;
          state.corruption += 2;
          addLog(state, "라일리예 코드 주입. 의식 진행도 +10.");
          break;
        case "ritual4_sync2":
          state.ritual += 4;
          state.sync += 2;
          addLog(state, "인간 명령 재각인. 의식 진행도 +4, 동기화율 +2.");
          break;
        default:
          break;
      }

      if (state.corruption >= 8 && Math.random() < 0.35) {
        addMadnessToDeck(state);
      }

      checkEnd(state);
      return state;
    });
  };

  const bossAction = (state) => {
    if (state.bossDeck.length === 0) {
      state.bossDeck = shuffle(state.bossDiscard);
      state.bossDiscard = [];
      addLog(state, "보스 패턴 덱이 재구성되었다.");
    }
    const card = state.bossDeck.shift();
    state.bossDiscard.push(card);
    state.lastBossCard = card;

    const weakened = state.bossWeakened;
    state.bossWeakened = false;

    const reduce = (amount) => (weakened ? Math.max(0, amount - 2) : amount);
    const incomingDamage = (amount) => Math.max(0, reduce(amount + state.nextBossDamageBuff) - state.shield);

    addLog(state, `보스 패턴 '${card.name}' 발동.`);
    if (weakened) addLog(state, "꿈의 침식으로 보스 패턴 수치가 약화되었다.");

    switch (card.effect) {
      case "hit3_manifest4": {
        const dmg = incomingDamage(3);
        state.hp -= dmg;
        state.manifestation += reduce(4);
        addLog(state, `체력 피해 ${dmg}, 현현도 +${reduce(4)}.`);
        break;
      }
      case "sync2_corrupt1":
        state.sync -= reduce(2);
        state.corruption += reduce(1);
        addLog(state, `동기화율 -${reduce(2)}, 오염도 +${reduce(1)}.`);
        break;
      case "manifest10":
        state.manifestation += reduce(10);
        addLog(state, `현현도 +${reduce(10)}.`);
        break;
      case "spawn_deepone":
        if (state.minions > 0) {
          state.manifestation += reduce(4);
          addLog(state, `하수인이 이미 존재한다. 현현도 +${reduce(4)}.`);
        }
        state.minions += 1;
        addLog(state, "심해인 하수인 1체 출현.");
        break;
      case "discard1_ritual3":
        if (state.hand.length > 0) {
          const discarded = state.hand.shift();
          state.discard.push(discarded);
          addLog(state, `손패에서 '${discarded.name}'가 붕괴했다.`);
        }
        state.ritual -= reduce(3);
        addLog(state, `의식 진행도 -${reduce(3)}.`);
        break;
      case "sync1_bossbuff2":
        state.sync -= reduce(1);
        state.nextBossDamageBuff += 2;
        addLog(state, "거짓 명령 신호 감지. 다음 보스 피해 +2.");
        break;
      case "humanity5_manifest3":
        state.humanity -= reduce(5);
        state.manifestation += reduce(3);
        addLog(state, `인류 잔존율 -${reduce(5)}, 현현도 +${reduce(3)}.`);
        break;
      case "corrupt2_maybe_madness":
        state.corruption += reduce(2);
        addLog(state, `오염도 +${reduce(2)}.`);
        if (state.corruption >= 8) addMadnessToDeck(state);
        break;
      default:
        break;
    }

    state.shield = 0;
    state.nextBossDamageBuff = 0;

    if (state.minions > 0) {
      const dmg = Math.max(0, state.minions - state.shield);
      state.hp -= dmg;
      state.manifestation += state.minions;
      addLog(state, `심해인 ${state.minions}체가 압박한다. 체력 피해 ${dmg}, 현현도 +${state.minions}.`);
    }
  };

  const endTurn = () => {
    if (game.status !== "playing" || game.phase !== "player") return;
    setGame((prev) => {
      const state = clone(prev);
      state.phase = "boss";

      state.hand.forEach((card) => {
        if (card.effect === "dead_corrupt1") {
          state.corruption += 1;
          addLog(state, "귀환 본능이 오염도를 +1 증가시켰다.");
        }
        if (card.effect === "dead_sync1") {
          state.sync -= 1;
          addLog(state, "심연의 기억이 동기화율을 -1 감소시켰다.");
        }
      });

      bossAction(state);
      checkEnd(state);

      if (state.status === "playing") {
        state.round += 1;
        state.phase = "player";
        drawCards(state, 2);
        if (state.hand.length > 8) {
          const overflow = state.hand.splice(0, state.hand.length - 8);
          state.discard.push(...overflow);
          addLog(state, "손패 제한 초과. 가장 오래된 카드들을 버렸다.");
        }
        addLog(state, `${state.round}라운드 시작. 카드 2장 드로우.`);
      }

      checkEnd(state);
      return state;
    });
  };

  const attackMinion = () => {
    if (game.status !== "playing" || game.phase !== "player") return;
    setGame((prev) => {
      const state = clone(prev);
      if (state.minions <= 0) {
        addLog(state, "제거할 하수인이 없다.");
        return state;
      }
      state.minions -= 1;
      state.corruption += 1;
      addLog(state, "심해인 1체를 제거했다. 근접 접촉으로 오염도 +1.");
      checkEnd(state);
      return state;
    });
  };

  const resetGame = () => {
    const deck = buildPlayerDeck();
    const hand = deck.splice(0, 5);
    const bossDeck = buildBossDeck();
    setGame({
      phase: "player",
      round: 1,
      hp: 24,
      maxHp: 24,
      sync: 10,
      maxSync: 10,
      corruption: 0,
      humanity: 100,
      manifestation: 0,
      ritual: 0,
      bossHp: 60,
      bossMaxHp: 60,
      minions: 0,
      deck,
      hand,
      discard: [],
      bossDeck,
      bossDiscard: [],
      damageBuff: 0,
      bossWeakened: false,
      shield: 0,
      nextFragmentPenalty: 0,
      nextBossDamageBuff: 0,
      log: initialLog,
      status: "playing",
      lastBossCard: null
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#12343b_0%,#071017_42%,#020409_100%)] p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-black/40 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">R'lyeh Protocol</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">무심체 보스레이드 카드게임</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                크툴루의 무의식 신성 생체조직에 AI를 이식한 C-Type 무심체가 고대신의 현현을 막기 위해 출격한다.
                의식 진행도 100을 달성하면 승리, 현현도 100·동기화율 0·인류 잔존율 0이면 패배한다.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-950/40 px-5 py-4 text-right">
              <p className="text-xs text-cyan-200">작전 상태</p>
              <p className={`mt-1 text-2xl font-black ${game.status === "win" ? "text-emerald-300" : game.status === "lose" ? "text-red-300" : "text-white"}`}>{resultText}</p>
              <p className="mt-1 text-sm text-slate-400">Round {game.round}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5 shadow-xl lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">무심체 01</h2>
                <p className="text-sm text-slate-400">AI 코어와 신성 조직의 제어 상태</p>
              </div>
              <button
                onClick={resetGame}
                className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                재시작
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <StatBar label="체력" value={game.hp} max={game.maxHp} danger={game.hp <= 8} />
              <StatBar label="동기화율" value={game.sync} max={game.maxSync} danger={game.sync <= 3} />
              <StatBar label="오염도" value={game.corruption} max={12} danger={game.corruption >= 8} />
              <StatBar label="인류 잔존율" value={game.humanity} max={100} danger={game.humanity <= 30} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-black/30 p-4">
                <p className="text-xs text-slate-400">덱</p>
                <p className="text-2xl font-black">{game.deck.length}</p>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <p className="text-xs text-slate-400">손패</p>
                <p className="text-2xl font-black">{game.hand.length}</p>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <p className="text-xs text-slate-400">버린 카드</p>
                <p className="text-2xl font-black">{game.discard.length}</p>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <p className="text-xs text-slate-400">하수인</p>
                <p className="text-2xl font-black">{game.minions}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-red-400/20 bg-red-950/20 p-5 shadow-xl">
            <h2 className="text-xl font-bold text-white">초기 보스: 심해인 대주교</h2>
            <p className="mt-1 text-sm text-slate-400">다곤 교단의 고위 사제. 본격적인 그레이트 올드 원 전투 전의 튜토리얼 보스.</p>
            <div className="mt-5 space-y-4">
              <StatBar label="현현체 내구" value={game.bossHp} max={game.bossMaxHp} danger={false} />
              <StatBar label="현현도" value={game.manifestation} max={100} danger={game.manifestation >= 70} />
              <StatBar label="의식 진행도" value={game.ritual} max={100} danger={false} />
            </div>
            {game.lastBossCard && (
              <div className="mt-5 rounded-2xl border border-red-300/20 bg-black/30 p-4">
                <p className="text-xs text-red-200">마지막 보스 패턴</p>
                <p className="mt-1 font-bold text-white">{game.lastBossCard.name}</p>
                <p className="mt-2 text-sm text-slate-300">{game.lastBossCard.text}</p>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5 shadow-xl">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-white">손패</h2>
                <p className="text-sm text-slate-400">카드를 사용해 보스 현현을 늦추고 봉인 의식을 완성하라.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={attackMinion}
                  disabled={game.status !== "playing" || game.phase !== "player"}
                  className="rounded-full bg-slate-200 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-white disabled:opacity-40"
                >
                  하수인 제거
                </button>
                <button
                  onClick={endTurn}
                  disabled={game.status !== "playing" || game.phase !== "player"}
                  className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-40"
                >
                  턴 종료 / 보스 단계
                </button>
              </div>
            </div>

            {game.hand.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-600 p-10 text-center text-slate-400">손패가 없다. 턴을 종료해 카드를 뽑아야 한다.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {game.hand.map((card) => (
                  <Card key={card.uid} card={card} onPlay={() => playCard(card.uid)} disabled={game.status !== "playing" || game.phase !== "player"} />
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-slate-700/80 bg-black/50 p-5 shadow-xl">
            <h2 className="text-xl font-bold text-white">전투 로그</h2>
            <div className="mt-4 max-h-[580px] space-y-3 overflow-y-auto pr-1">
              {game.log.map((line, index) => (
                <div key={`${line}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm leading-5 text-slate-300">
                  {line}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-cyan-300/10 bg-black/30 p-5 text-sm leading-6 text-slate-300">
          <h2 className="text-lg font-bold text-white">현재 MVP 규칙</h2>
          <p className="mt-2">
            의식 진행도 100이 승리 조건이다. 보스 내구를 0으로 만들면 처치가 아니라 현현체 붕괴로 처리되어 의식 진행도가 오른다.
            오염도 8 이상부터 폭주 카드가 덱에 섞이기 시작하며, 동기화율이 0이 되면 무심체가 고대신에게 귀속되어 패배한다.
          </p>
        </section>
      </div>
    </div>
  );
}

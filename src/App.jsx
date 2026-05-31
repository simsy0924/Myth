import React, { useMemo, useState } from "react";

const clone = (obj) => JSON.parse(JSON.stringify(obj));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const UNITS = [
  { id: "aegis", code: "C-01", name: "심연 파수병", role: "방어", hp: 34, sync: 11, atk: 4, rit: 3, skill: "barrier", skillName: "라일리예 장벽", skillText: "모든 아군 보호막 +3. 오염도 +1." },
  { id: "seal", code: "C-02", name: "봉인 연산체", role: "의식", hp: 24, sync: 13, atk: 2, rit: 8, skill: "ritualPlus", skillName: "삼중 봉인식", skillText: "의식 진행도 +12. 동기화율 -1." },
  { id: "orbital", code: "C-03", name: "궤도 지휘체", role: "화력 지원", hp: 26, sync: 10, atk: 7, rit: 2, skill: "mark", skillName: "좌표 고정", skillText: "이번 라운드 다음 대미지 +4. 인류 잔존율 -2." },
  { id: "coolant", code: "C-04", name: "신경 냉각체", role: "오염 제어", hp: 25, sync: 14, atk: 2, rit: 4, skill: "cleanseAll", skillName: "광역 냉각", skillText: "모든 아군 오염도 -2." },
  { id: "dream", code: "C-05", name: "꿈 절단체", role: "패턴 차단", hp: 23, sync: 15, atk: 3, rit: 5, skill: "skip", skillName: "무음의 꿈", skillText: "다음 보스 패턴을 건너뛴다. 오염도 +3." },
  { id: "venom", code: "C-06", name: "부식 적응체", role: "지속 압박", hp: 28, sync: 10, atk: 5, rit: 3, skill: "dot", skillName: "부식 포자", skillText: "보스에게 누적 부식 +4. 오염도 +1." },
  { id: "yellow", code: "C-07", name: "황색 차폐체", role: "폭주 억제", hp: 26, sync: 12, atk: 3, rit: 5, skill: "removeMad", skillName: "표식 격리", skillText: "각 아군 손패의 폭주 카드 1장을 제거한다." },
  { id: "time", code: "C-08", name: "시간 관측체", role: "예측", hp: 22, sync: 16, atk: 2, rit: 6, skill: "scry", skillName: "미래 관측", skillText: "다음 보스 패턴을 확인하고 카드 2장을 뽑는다." },
  { id: "swarm", code: "C-09", name: "군집 분해체", role: "하수인 정리", hp: 30, sync: 10, atk: 4, rit: 3, skill: "clear", skillName: "군집 분해", skillText: "하수인을 최대 3체 줄이고, 줄인 수 ×2 대미지." },
  { id: "flare", code: "C-10", name: "광휘 연소체", role: "고위험 고화력", hp: 24, sync: 9, atk: 9, rit: 1, skill: "flare", skillName: "항성열 방출", skillText: "보스 대미지 12. 오염도 +3." },
  { id: "bio", code: "C-11", name: "생체 복원체", role: "회복", hp: 27, sync: 13, atk: 2, rit: 4, skill: "heal", skillName: "재생 점액", skillText: "모든 아군 체력 +3. 오염도 +1." },
  { id: "oracle", code: "C-12", name: "검은 신탁체", role: "위험한 변수", hp: 21, sync: 17, atk: 3, rit: 7, skill: "bargain", skillName: "사자의 거래", skillText: "의식 진행도 +14. 인류 잔존율 -5, 동기화율 -2." }
];

const BOSS = [
  { name: "심해의 압력", kind: "hit", text: "체력이 높은 아군에게 대미지." },
  { name: "고대의 부름", kind: "sync", text: "모든 아군 동기화율 감소." },
  { name: "별의 정렬", kind: "manifest", text: "현현도가 크게 상승." },
  { name: "심해인 군집", kind: "minion", text: "하수인이 늘어난다." },
  { name: "언어 붕괴", kind: "discard", text: "각 아군이 손패 1장을 잃고 의식이 후퇴." },
  { name: "도시 침강", kind: "humanity", text: "인류 잔존율 감소." },
  { name: "신성 조직 반응", kind: "corrupt", text: "모든 아군 오염도 증가." },
  { name: "심해 해일", kind: "wave", text: "모든 아군에게 소량 대미지." }
];

const MADNESS = [
  { id: "mad1", name: "귀환 본능", type: "폭주", text: "사용 불가. 라운드 종료 시 오염도 +1.", kind: "madCorrupt" },
  { id: "mad2", name: "심연의 기억", type: "폭주", text: "사용 불가. 라운드 종료 시 동기화율 -1.", kind: "madSync" },
  { id: "mad3", name: "동족 인식", type: "폭주", text: "사용 불가. 손패를 막는다.", kind: "madBlank" }
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function card(base, owner, i) {
  return { ...base, uid: `${owner}-${base.id}-${Date.now()}-${Math.random()}-${i}` };
}

function makeDeck(u) {
  const common = [
    { id: "hit", name: "코어 충격", type: "AI 명령", text: `보스 대미지 ${u.atk}.`, kind: "damage", value: u.atk },
    { id: "rit", name: "봉인 회로", type: "의식", text: `의식 진행도 +${u.rit}. 동기화율 -1.`, kind: "ritual", value: u.rit },
    { id: "guard", name: "방어 자세", type: "AI 명령", text: "보호막 +4.", kind: "shield", value: 4 },
    { id: "cool", name: "긴급 냉각", type: "인류 지원", text: "오염도 -3. 카드 1장 드로우.", kind: "cool" },
    { id: "draw", name: "전술 분석", type: "AI 명령", text: "카드 2장 드로우. 다음 대미지 +1.", kind: "draw" }
  ];
  const unique = { id: "skill", name: u.skillName, type: "전용 프로토콜", text: u.skillText, kind: u.skill };
  return shuffle([...common, ...common, unique, unique, unique].map((c, i) => card(c, u.id, i)));
}

function makeUnit(u) {
  const deck = makeDeck(u);
  return { ...u, maxHp: u.hp, maxSync: u.sync, corruption: 0, shield: 0, buff: 0, deck, hand: deck.splice(0, 4), discard: [], alive: true };
}

function makeBossDeck() {
  return shuffle([...BOSS, ...BOSS, ...BOSS].map((c, i) => card({ ...c, id: c.kind, type: "보스 패턴" }, "boss", i)));
}

function live(s) { return s.squad.filter((u) => u.hp > 0 && u.sync > 0); }
function addLog(s, t) { s.log = [t, ...s.log].slice(0, 16); }
function draw(s, u, n) {
  for (let i = 0; i < n; i++) {
    if (u.deck.length === 0) { u.deck = shuffle(u.discard); u.discard = []; }
    if (u.deck.length) u.hand.push(u.deck.shift());
  }
}
function clampAll(s) {
  s.ritual = clamp(s.ritual, 0, 100); s.manifest = clamp(s.manifest, 0, 100); s.humanity = clamp(s.humanity, 0, 100);
  s.squad.forEach((u) => { u.hp = clamp(u.hp, 0, u.maxHp); u.sync = clamp(u.sync, 0, u.maxSync); u.corruption = clamp(u.corruption, 0, 12); });
  if (s.ritual >= 100) { s.status = "win"; addLog(s, "봉인 성공. 현현 회선이 끊어졌다."); }
  else if (s.manifest >= 100 || s.humanity <= 0 || live(s).length === 0) { s.status = "lose"; addLog(s, "작전 실패. 인류 최후 방어선이 붕괴했다."); }
}
function addMadness(s, u) {
  if (u.corruption >= 8 && Math.random() < 0.45) {
    const m = MADNESS[Math.floor(Math.random() * MADNESS.length)];
    u.deck = shuffle([card(m, u.id, 0), ...u.deck]);
    addLog(s, `${u.name}의 덱에 폭주 카드가 섞였다.`);
  }
}
function bossDamage(s, u, n) {
  const total = Math.max(0, n + u.buff + s.teamBuff);
  s.bossHp -= total; u.buff = 0; s.teamBuff = 0;
  addLog(s, `${u.name}: 보스 대미지 ${total}.`);
  if (s.bossHp <= 0) { s.breaks += 1; s.bossHp = 110 + s.breaks * 15; s.ritual += 13; s.manifest += 5; addLog(s, `현현체 ${s.breaks}회 붕괴. 의식 +13.`); }
}
function unitDamage(s, u, n) {
  const block = Math.min(u.shield, n); u.shield -= block; u.hp -= n - block;
  addLog(s, `${u.name}: 대미지 ${n - block}, 보호 ${block}.`);
}
function highestHp(s) { return [...live(s)].sort((a, b) => b.hp - a.hp)[0]; }

function Bar({ label, value, max, danger }) {
  const p = clamp((value / max) * 100, 0, 100);
  return <div><div className="mb-1 flex justify-between text-xs text-slate-300"><span>{label}</span><span>{value}/{max}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full ${danger ? "bg-red-400" : "bg-cyan-300"}`} style={{ width: `${p}%` }} /></div></div>;
}
function Pill({ children }) { return <span className="rounded-full border border-cyan-300/20 bg-cyan-950/40 px-2 py-1 text-[11px] text-cyan-100">{children}</span>; }
function cardClass(type) { return type === "폭주" ? "border-red-400/60 bg-red-950/70" : type === "의식" ? "border-amber-400/40 bg-amber-950/60" : type === "전용 프로토콜" ? "border-violet-400/40 bg-violet-950/60" : "border-cyan-400/30 bg-slate-950/80"; }

export default function App() {
  const [selected, setSelected] = useState(["aegis", "seal", "orbital"]);
  const [game, setGame] = useState(null);
  const chosen = useMemo(() => selected.map((id) => UNITS.find((u) => u.id === id)).filter(Boolean), [selected]);

  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p);
  const start = () => {
    const squad = chosen.map(makeUnit);
    setGame({ round: 1, status: "play", squad, bossHp: 110, bossMax: 110, breaks: 0, ritual: 0, manifest: 0, humanity: 100, minions: 1, bossDeck: makeBossDeck(), bossDiscard: [], lastBoss: null, teamBuff: 0, skipBoss: false, dot: 0, log: ["R'lyeh Protocol 기동.", "무심체 3체가 출격했다."] });
  };

  const play = (uid, cid) => setGame((prev) => {
    const s = clone(prev); if (s.status !== "play") return s;
    const u = s.squad.find((x) => x.id === uid); if (!u || u.hp <= 0 || u.sync <= 0) return s;
    const i = u.hand.findIndex((c) => c.uid === cid); if (i < 0) return s;
    const c = u.hand[i]; if (c.type === "폭주") return s;
    u.hand.splice(i, 1); u.discard.push(c); addLog(s, `${u.name}: ${c.name} 사용.`);
    switch (c.kind) {
      case "damage": bossDamage(s, u, c.value); break;
      case "ritual": s.ritual += c.value; u.sync -= 1; break;
      case "shield": u.shield += c.value; break;
      case "cool": u.corruption -= 3; draw(s, u, 1); break;
      case "draw": draw(s, u, 2); u.buff += 1; break;
      case "barrier": live(s).forEach((a) => a.shield += 3); u.corruption += 1; break;
      case "ritualPlus": s.ritual += 12; u.sync -= 1; break;
      case "mark": s.teamBuff += 4; s.humanity -= 2; break;
      case "cleanseAll": live(s).forEach((a) => a.corruption -= 2); break;
      case "skip": s.skipBoss = true; u.corruption += 3; break;
      case "dot": s.dot += 4; u.corruption += 1; break;
      case "removeMad": live(s).forEach((a) => { const m = a.hand.findIndex((x) => x.type === "폭주"); if (m >= 0) a.discard.push(...a.hand.splice(m, 1)); }); break;
      case "scry": if (s.bossDeck[0]) addLog(s, `다음 보스 패턴: ${s.bossDeck[0].name}`); draw(s, u, 2); break;
      case "clear": { const k = Math.min(3, s.minions); s.minions -= k; bossDamage(s, u, k * 2); break; }
      case "flare": bossDamage(s, u, 12); u.corruption += 3; break;
      case "heal": live(s).forEach((a) => a.hp += 3); u.corruption += 1; break;
      case "bargain": s.ritual += 14; s.humanity -= 5; u.sync -= 2; break;
      default: break;
    }
    addMadness(s, u); clampAll(s); return s;
  });

  const basicMinion = (uid) => setGame((prev) => {
    const s = clone(prev); const u = s.squad.find((x) => x.id === uid); if (!u || s.minions <= 0 || s.status !== "play") return s;
    s.minions -= 1; u.corruption += 1; addLog(s, `${u.name}: 하수인 1체 정리.`); addMadness(s, u); clampAll(s); return s;
  });

  const endRound = () => setGame((prev) => {
    const s = clone(prev); if (s.status !== "play") return s;
    live(s).forEach((u) => u.hand.forEach((c) => { if (c.kind === "madCorrupt") u.corruption += 1; if (c.kind === "madSync") u.sync -= 1; }));
    if (s.dot > 0) { s.bossHp -= s.dot; addLog(s, `부식 누적 대미지 ${s.dot}.`); s.dot = Math.max(0, s.dot - 1); }
    if (s.bossHp <= 0) { s.breaks += 1; s.bossHp = 110 + s.breaks * 15; s.ritual += 13; s.manifest += 5; }
    if (s.skipBoss) { s.skipBoss = false; addLog(s, "보스 패턴을 건너뛰었다."); }
    else {
      if (s.bossDeck.length === 0) { s.bossDeck = shuffle(s.bossDiscard); s.bossDiscard = []; }
      const b = s.bossDeck.shift(); s.bossDiscard.push(b); s.lastBoss = b;
      const phase = s.ritual >= 70 || s.manifest >= 70 ? 3 : s.ritual >= 35 || s.manifest >= 40 ? 2 : 1;
      addLog(s, `보스 패턴: ${b.name}.`);
      if (b.kind === "hit") unitDamage(s, highestHp(s), 4 + phase);
      if (b.kind === "sync") live(s).forEach((u) => u.sync -= phase);
      if (b.kind === "manifest") s.manifest += 9 + phase;
      if (b.kind === "minion") s.minions += phase;
      if (b.kind === "discard") { live(s).forEach((u) => { if (u.hand.length) u.discard.push(u.hand.shift()); }); s.ritual -= 3; }
      if (b.kind === "humanity") { s.humanity -= 6 + phase; s.manifest += 2; }
      if (b.kind === "corrupt") live(s).forEach((u) => { u.corruption += 1 + phase; addMadness(s, u); });
      if (b.kind === "wave") live(s).forEach((u) => unitDamage(s, u, 2 + phase));
    }
    for (let i = 0; i < s.minions; i++) { const t = highestHp(s); if (t) unitDamage(s, t, 1); }
    s.manifest += Math.min(8, s.minions);
    s.squad.forEach((u) => { u.shield = 0; u.buff = 0; });
    s.round += 1;
    live(s).forEach((u) => { draw(s, u, 2); if (u.hand.length > 8) u.discard.push(...u.hand.splice(0, u.hand.length - 8)); });
    addLog(s, `${s.round}라운드 시작.`); clampAll(s); return s;
  });

  if (!game) return <div className="min-h-screen bg-[radial-gradient(circle_at_top,#12343b,#020409)] p-4 text-slate-100 md:p-8"><div className="mx-auto max-w-7xl space-y-6"><header className="rounded-3xl border border-cyan-300/20 bg-black/40 p-6"><p className="text-sm uppercase tracking-[0.35em] text-cyan-200">R'lyeh Protocol</p><h1 className="mt-2 text-4xl font-black md:text-6xl">무심체 3체 편성</h1><p className="mt-3 text-slate-300">12종의 무심체 중 3체를 골라 보스레이드에 출격한다.</p><div className="mt-5 flex flex-wrap gap-2"><Pill>선택 {selected.length}/3</Pill>{chosen.map((u) => <Pill key={u.id}>{u.code} {u.name}</Pill>)}<button onClick={start} disabled={selected.length !== 3} className="ml-auto rounded-full bg-cyan-300 px-5 py-2 font-black text-slate-950 disabled:opacity-40">출격</button></div></header><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{UNITS.map((u) => <button key={u.id} onClick={() => toggle(u.id)} className={`rounded-3xl border p-5 text-left transition hover:-translate-y-1 ${selected.includes(u.id) ? "border-cyan-300 bg-cyan-950/60" : "border-slate-700 bg-slate-950/70"}`}><Pill>{u.code}</Pill><h2 className="mt-3 text-2xl font-black">{u.name}</h2><p className="text-cyan-100/80">{u.role}</p><p className="mt-3 text-sm text-slate-300">전용: {u.skillName}</p><p className="mt-2 text-xs leading-5 text-slate-400">{u.skillText}</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-black/30 p-3">체력 <b>{u.hp}</b></div><div className="rounded-2xl bg-black/30 p-3">동기화 <b>{u.sync}</b></div></div></button>)}</section></div></div>;

  const stateText = game.status === "win" ? "봉인 성공" : game.status === "lose" ? "작전 실패" : "작전 진행 중";
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,#12343b,#020409)] p-4 text-slate-100 md:p-8"><div className="mx-auto max-w-7xl space-y-6"><header className="rounded-3xl border border-cyan-300/20 bg-black/40 p-6"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Squad Raid</p><h1 className="mt-2 text-3xl font-black md:text-5xl">3체 무심체 보스레이드</h1><p className="mt-3 text-slate-300">각 무심체는 독립된 덱, 손패, 체력, 동기화율, 오염도를 가진다.</p></div><div className="rounded-2xl bg-cyan-950/40 p-4 text-right"><p className="text-xs text-cyan-200">상태</p><p className="text-2xl font-black">{stateText}</p><p className="text-sm text-slate-400">Round {game.round}</p></div></div></header><section className="grid gap-4 lg:grid-cols-3"><aside className="rounded-3xl border border-red-400/20 bg-red-950/20 p-5"><h2 className="text-xl font-black">심해인 대주교</h2><p className="text-sm text-red-100/70">튜토리얼 레이드 보스</p><div className="mt-5 space-y-4"><Bar label="현현체 내구" value={game.bossHp} max={110 + game.breaks * 15} /><Bar label="의식 진행도" value={game.ritual} max={100} /><Bar label="현현도" value={game.manifest} max={100} danger={game.manifest >= 70} /><Bar label="인류 잔존율" value={game.humanity} max={100} danger={game.humanity <= 30} /></div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-black/30 p-3">하수인<br/><b className="text-2xl">{game.minions}</b></div><div className="rounded-2xl bg-black/30 p-3">붕괴<br/><b className="text-2xl">{game.breaks}</b></div><div className="rounded-2xl bg-black/30 p-3">부식<br/><b className="text-2xl">{game.dot}</b></div></div>{game.lastBoss && <div className="mt-5 rounded-2xl border border-red-300/20 bg-black/30 p-4"><p className="text-xs text-red-200">마지막 패턴</p><p className="font-bold">{game.lastBoss.name}</p><p className="text-sm text-slate-300">{game.lastBoss.text}</p></div>}<div className="mt-5 flex flex-wrap gap-2"><button onClick={endRound} disabled={game.status !== "play"} className="rounded-full bg-cyan-300 px-4 py-2 font-black text-slate-950 disabled:opacity-40">라운드 종료</button><button onClick={() => setGame(null)} className="rounded-full border border-slate-600 px-4 py-2">편성 다시하기</button></div></aside><main className="space-y-4 lg:col-span-2">{game.squad.map((u) => { const alive = u.hp > 0 && u.sync > 0; return <div key={u.id} className={`rounded-3xl border p-5 ${alive ? "border-slate-700 bg-slate-950/70" : "border-red-500/40 bg-red-950/30"}`}><div className="flex flex-col gap-3 md:flex-row md:justify-between"><div><div className="flex gap-2"><Pill>{u.code}</Pill><Pill>{u.role}</Pill></div><h2 className="mt-2 text-2xl font-black">{u.name}</h2></div><button onClick={() => basicMinion(u.id)} disabled={!alive || game.status !== "play"} className="rounded-full border border-slate-600 px-4 py-2 disabled:opacity-40">기본 행동: 하수인 정리</button></div><div className="mt-4 grid gap-4 md:grid-cols-3"><Bar label="체력" value={u.hp} max={u.maxHp} danger={u.hp <= u.maxHp * 0.35} /><Bar label="동기화율" value={u.sync} max={u.maxSync} danger={u.sync <= 3} /><Bar label="오염도" value={u.corruption} max={12} danger={u.corruption >= 8} /></div><div className="mt-3 flex flex-wrap gap-2"><Pill>덱 {u.deck.length}</Pill><Pill>손패 {u.hand.length}</Pill><Pill>버림 {u.discard.length}</Pill><Pill>보호막 {u.shield}</Pill>{u.buff > 0 && <Pill>다음 +{u.buff}</Pill>}</div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{u.hand.map((c) => <button key={c.uid} onClick={() => play(u.id, c.uid)} disabled={!alive || game.status !== "play" || c.type === "폭주"} className={`min-h-36 rounded-2xl border p-3 text-left transition hover:-translate-y-1 disabled:opacity-50 ${cardClass(c.type)}`}><p className="text-[10px] text-slate-300">{c.type}</p><h3 className="mt-1 text-sm font-black">{c.name}</h3><p className="mt-2 text-xs leading-5 text-slate-300">{c.text}</p></button>)}</div></div>; })}</main></section><section className="grid gap-4 lg:grid-cols-[1fr_420px]"><div className="rounded-3xl border border-cyan-300/10 bg-black/30 p-5 text-sm leading-6 text-slate-300"><h2 className="text-lg font-black text-white">현재 확장 규칙</h2><p className="mt-2">12종 중 3체를 선택해 출격한다. 각 무심체는 공용 카드와 전용 프로토콜 카드가 섞인 독립 덱을 가진다. 현현체 내구를 0으로 만들면 보스가 사라지는 것이 아니라 잠시 붕괴하고 의식 진행도가 오른다.</p><p className="mt-2">오염도 8 이상부터 폭주 카드가 덱에 섞일 수 있다. 강한 프로토콜을 많이 쓸수록 손패가 막히고 동기화율이 위험해진다.</p></div><aside className="rounded-3xl border border-slate-700 bg-black/50 p-5"><h2 className="text-xl font-black">전투 로그</h2><div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto">{game.log.map((l, i) => <div key={`${l}-${i}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">{l}</div>)}</div></aside></section></div></div>;
}

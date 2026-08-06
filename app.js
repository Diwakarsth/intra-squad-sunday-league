const firebaseConfig = {
  apiKey: "AIzaSyAh6B75N8AK1TmIXUz1thxzoKxToeztf08",
  authDomain: "intra-squad-sunday-league.firebaseapp.com",
  projectId: "intra-squad-sunday-league",
  storageBucket: "intra-squad-sunday-league.firebasestorage.app",
  messagingSenderId: "390341357300",
  appId: "1:390341357300:web:22443b7f9fba6c7af838a1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const leagueRef = db.collection("league").doc("current");
const ADMIN_EMAIL = "admin@intrasquadleague.com";
let isAdmin = false;
let cloudReady = false;
let unsubscribeLeague = null;

const TEAM_MEDIA = {
  T1: {logo: "No Stamina Hustlers Logo.png", jersey: "No Stamina Hustlers Jersey.png"},
  T2: {logo: "Momo Strikers Logo.png", jersey: "Momo Strikers Jersey.png"},
  T3: {logo: "Jhyap Warriors Logo.png", jersey: "Jhyap Warriors Jersey.png"}
};

const seed = {
  teams: [
    {id:"T1", name:"No Stamina Hustlers", color:"#d4a514"},
    {id:"T2", name:"MoMo Strikers", color:"#c92c2c"},
    {id:"T3", name:"Jhyap Warriors", color:"#6b3bbd"}
  ],
  players: [
  {
    "id": "P1",
    "name": "Sandesh Shrestha",
    "teamId": "T2",
    "captain": true,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P2",
    "name": "Subodh Khadka",
    "teamId": "T2",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P3",
    "name": "Bimal Magar",
    "teamId": "T2",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P4",
    "name": "Bijay Badal",
    "teamId": "T2",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P5",
    "name": "Bijay Devkota",
    "teamId": "T2",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P6",
    "name": "Sudip Giri",
    "teamId": "T2",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P7",
    "name": "Diwakar Shrestha",
    "teamId": "T2",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P8",
    "name": "Roshan Acharya",
    "teamId": "T2",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P9",
    "name": "Prabhakar Shrestha",
    "teamId": "T1",
    "captain": true,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P10",
    "name": "Subash KC",
    "teamId": "T1",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P11",
    "name": "Riman Bastola",
    "teamId": "T1",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P12",
    "name": "Delli Raj Poudel",
    "teamId": "T1",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P13",
    "name": "Sonam Sherpa",
    "teamId": "T1",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P14",
    "name": "Pradip Rokka",
    "teamId": "T1",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P15",
    "name": "Bhuwan Chaudhary",
    "teamId": "T1",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P16",
    "name": "Ashmit Tamang",
    "teamId": "T1",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P17",
    "name": "Bishal Dong",
    "teamId": "T1",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P18",
    "name": "Nirmal Ghising",
    "teamId": "T3",
    "captain": true,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P19",
    "name": "Bigyan Shrestha",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P20",
    "name": "Sabin Shrestha",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P21",
    "name": "Shahil",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P22",
    "name": "Gobind Thapa",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P23",
    "name": "Rohit Thapa",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P24",
    "name": "Samir",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P25",
    "name": "Ashish Bartaula",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P26",
    "name": "Suliz Basnet",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  },
  {
    "id": "P27",
    "name": "Subash Thokar",
    "teamId": "T3",
    "captain": false,
    "number": "",
    "position": "",
    "photo": ""
  }
],
  fixtures: [
  {
    "id": "M1",
    "week": 1,
    "home": "T2",
    "away": "T1",
    "date": "08/09/2026",
    "time": "8:30 AM",
    "venue": "De Anza High School",
    "homeScore": null,
    "awayScore": null
  },
  {
    "id": "M2",
    "week": 1,
    "home": "T2",
    "away": "T3",
    "date": "08/09/2026",
    "time": "9:30 AM",
    "venue": "De Anza High School",
    "homeScore": null,
    "awayScore": null
  },
  {
    "id": "M3",
    "week": 2,
    "home": "T3",
    "away": "T1",
    "date": "08/16/2026",
    "time": "8:30 AM",
    "venue": "De Anza High School",
    "homeScore": null,
    "awayScore": null
  },
  {
    "id": "M4",
    "week": 2,
    "home": "T3",
    "away": "T2",
    "date": "08/16/2026",
    "time": "9:30 AM",
    "venue": "De Anza High School",
    "homeScore": null,
    "awayScore": null
  },
  {
    "id": "M5",
    "week": 3,
    "home": "T1",
    "away": "T3",
    "date": "08/23/2026",
    "time": "8:30 AM",
    "venue": "De Anza High School",
    "homeScore": null,
    "awayScore": null
  },
  {
    "id": "M6",
    "week": 3,
    "home": "T1",
    "away": "T2",
    "date": "08/23/2026",
    "time": "9:30 AM",
    "venue": "De Anza High School",
    "homeScore": null,
    "awayScore": null
  },
  {
    "id": "F1",
    "week": 4,
    "home": "FINAL1",
    "away": "FINAL2",
    "date": "08/30/2026",
    "time": "9:00 AM",
    "venue": "De Anza High School",
    "homeScore": null,
    "awayScore": null
  }
],
  events: [],
  settings: { liveStandings: true }
};

let data = structuredClone(seed);

async function save(){
  if(!isAdmin) throw new Error("Admin login required.");
  await leagueRef.set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
}

function setStatus(message){
  document.querySelector("#adminStatus").textContent = message;
}

function startLiveData(){
  if(unsubscribeLeague) unsubscribeLeague();
  unsubscribeLeague = leagueRef.onSnapshot(async snapshot => {
    cloudReady = true;
    if(snapshot.exists){
      const remote = snapshot.data();
      data = {
        teams: Array.isArray(remote.teams) ? remote.teams : structuredClone(seed.teams),
        players: Array.isArray(remote.players) ? remote.players : structuredClone(seed.players),
        fixtures: Array.isArray(remote.fixtures) ? remote.fixtures : structuredClone(seed.fixtures),
        events: (Array.isArray(remote.events) ? remote.events : []).map((event,index)=>({
          ...event,
          id: event.id || `LEGACY-${event.matchId||"MATCH"}-${event.createdAtMs||event.minute||0}-${index}`
        })),
        settings: { liveStandings: remote.settings?.liveStandings !== false }
      };
      setStatus(isAdmin ? "Admin connected • Live data synced" : "Live public data connected");
      render();
    } else {
      data = structuredClone(seed);
      setStatus(isAdmin ? "Admin connected • Initializing live data…" : "Live database ready • Waiting for admin initialization");
      render();
      if(isAdmin){
        await leagueRef.set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      }
    }
  }, error => {
    console.error("Firestore listener error", error);
    cloudReady = false;
    setStatus("Unable to connect to live data");
  });
}
const team = id => data.teams.find(t=>t.id===id);
const teamName = id => team(id)?.name || (id==="FINAL1"?"1st Place":id==="FINAL2"?"2nd Place":"TBD");
const teamLogo = id => TEAM_MEDIA[id]?.logo || "";
const logoHtml = (id, alt="") => teamLogo(id) ? `<img class="mini-team-logo" src="${encodeURI(teamLogo(id))}" alt="${alt || teamName(id)} logo">` : "";

function updateAuthUI(){
  const adminTab=document.querySelector("#adminTab");
  const authBtn=document.querySelector("#authBtn");
  const status=document.querySelector("#adminStatus");
  adminTab.classList.toggle("admin-hidden",!isAdmin);
  authBtn.textContent=isAdmin?"Admin Logout":"Admin Login";
  if(cloudReady) status.textContent=isAdmin?"Admin connected • Live data synced":"Live public data connected";
  if(!isAdmin && document.querySelector("#admin").classList.contains("active")) activateTab("home");
}
function activateTab(tabId){
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tabId));
  document.querySelectorAll("main section").forEach(sec=>sec.classList.toggle("active",sec.id===tabId));
}


function standings(){
  const s = Object.fromEntries(data.teams.map(t=>[t.id,{team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}]));
  data.fixtures.filter(f=>{
    if(f.id==="F1" || !hasScore(f) || !s[f.home] || !s[f.away]) return false;
    const status=normalizedStatus(f);
    return status==="finished" || (data.settings?.liveStandings!==false && ["live","paused","halftime"].includes(status));
  }).forEach(f=>{
    const homeScore=Number(f.homeScore), awayScore=Number(f.awayScore);
    const h=s[f.home], a=s[f.away];
    h.p++;a.p++; h.gf+=homeScore;h.ga+=awayScore; a.gf+=awayScore;a.ga+=homeScore;
    if(homeScore>awayScore){h.w++;a.l++;h.pts+=3}
    else if(homeScore<awayScore){a.w++;h.l++;a.pts+=3}
    else{h.d++;a.d++;h.pts++;a.pts++}
  });
  return Object.values(s).map(x=>({...x,gd:x.gf-x.ga})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.team.name.localeCompare(b.team.name));
}
function statsFor(playerId){
  const e=data.events.filter(x=>x.playerId===playerId);
  return {
    goals:e.filter(x=>x.type==="Goal").length,
    assists:e.filter(x=>x.type==="Assist").length,
    yellow:e.filter(x=>x.type==="Yellow Card").length,
    red:e.filter(x=>x.type==="Red Card").length,
    potm:e.filter(x=>x.type==="Player of the Match").length
  }
}
function renderLiveTableNotice(){
  const tableNotice=document.querySelector("#liveTableNotice");
  if(!tableNotice)return;
  const liveForTable=activeMatch();
  if(liveForTable && data.settings?.liveStandings!==false){
    tableNotice.style.display="block";
    tableNotice.innerHTML=`<strong>🔴 LIVE TABLE</strong><div>Based on ${teamName(liveForTable.home)} ${liveForTable.homeScore??0}–${liveForTable.awayScore??0} ${teamName(liveForTable.away)} • ${formatClock(elapsedSeconds(liveForTable))}</div>`;
  }else{
    tableNotice.style.display="none";
    tableNotice.innerHTML="";
  }
}

function render(){
  const st=standings();
  const played=data.fixtures.filter(f=>hasScore(f)&&normalizedStatus(f)==="finished");
  document.querySelector("#kpiMatches").textContent=played.length;
  document.querySelector("#kpiGoals").textContent=played.reduce((n,f)=>n+f.homeScore+f.awayScore,0);
  document.querySelector("#kpiLeader").textContent=st[0]?.team.name||"—";

  const latest=played.at(-1);
  document.querySelector("#latestResult").innerHTML=latest?
    `<div class="result-with-scorers">
      <div class="result-team result-home"><strong>${teamName(latest.home)}</strong>${teamScorersHtml(latest,latest.home,"left")}</div>
      <div class="result-center"><div class="result-score">${latest.homeScore}–${latest.awayScore}</div><span class="badge">Full Time</span><div class="muted">Week ${latest.week}</div></div>
      <div class="result-team result-away"><strong>${teamName(latest.away)}</strong>${teamScorersHtml(latest,latest.away,"right")}</div>
    </div>`:
    `No completed match yet.`;

  const next=data.fixtures.find(f=>f.status!=="finished" && f.status!=="live" && f.status!=="paused" && f.status!=="halftime");
  document.querySelector("#nextFixture").innerHTML=next?
    `<strong>${teamName(next.home)} vs ${teamName(next.away)}</strong><div class="muted">Week ${next.week}${next.date?` • ${next.date}`:""}${next.time?` • ${next.time}`:""}${next.venue?`<br>${next.venue}`:""}</div>`:
    `All matches completed.`;

  const scorers=data.players.map(p=>({...p,...statsFor(p.id)})).sort((a,b)=>b.goals-a.goals||b.assists-a.assists);
  const playersWithGoals=scorers.filter(p=>p.goals>0);
  document.querySelector("#topScorers").innerHTML=playersWithGoals.length?playersWithGoals.slice(0,5).map((p,i)=>
    `<div class="player-row"><span>${i+1}. <strong>${p.name}</strong><div class="muted">${teamName(p.teamId)}</div></span><span><strong>${p.goals}</strong> goal${p.goals===1?"":"s"}</span></div>`).join(""):`<div class="muted">No goals recorded yet.</div>`;

  document.querySelector("#topScorersFull").innerHTML=playersWithGoals.length?playersWithGoals.map((p,i)=>{
    const rankClass=i===0?"gold":i===1?"silver":i===2?"bronze":"";
    return `<div class="scorer-row"><div class="scorer-rank ${rankClass}">${i+1}</div><div><strong>${p.name}</strong><div class="muted">${logoHtml(p.teamId,p.name)}${teamName(p.teamId)} • ${p.assists} assist${p.assists===1?"":"s"}</div></div><div class="goal-total">${p.goals}<small>Goals</small></div></div>`;
  }).join(""):`<div class="muted">No goals have been recorded. Admin can add goals from the Admin tab.</div>`;

  document.querySelector("#fixtureList").innerHTML=data.fixtures.map(f=>{
    const status=normalizedStatus(f);
    const matchHasScore=hasScore(f);
    const label=status==="live"?"🔴 LIVE":status==="halftime"?"Half Time":status==="paused"?"Paused":status==="finished"?"Full Time":"Scheduled";
    return `<div class="match"><div>${logoHtml(f.home)}<strong>${teamName(f.home)}</strong><div class="muted">Week ${f.week}</div></div>
      <div class="score">${matchHasScore?`${Number(f.homeScore)}–${Number(f.awayScore)}`:"VS"}<div class="badge">${label}</div></div>
      <div class="team-right"><strong>${teamName(f.away)}</strong>${logoHtml(f.away)}<div class="muted">${f.date||""}${f.time?` • ${f.time}`:""}${f.venue?`<br>${f.venue}`:""}</div></div></div>`;
  }).join("");

  renderLiveTableNotice();

  document.querySelector("#standingsBody").innerHTML=st.map((x,i)=>`<tr class="${i===0?"rank1":i===1?"rank2":i===2?"rank3":""}">
    <td>${i+1}</td><td>${logoHtml(x.team.id)}<strong>${x.team.name}</strong></td><td>${x.p}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gf}</td><td>${x.ga}</td><td>${x.gd}</td><td><strong>${x.pts}</strong></td></tr>`).join("");

  document.querySelector("#teamCards").innerHTML=data.teams.map(t=>{
    const ps=data.players.filter(p=>p.teamId===t.id && p.active!==false);
    const media=TEAM_MEDIA[t.id] || {};
    const captain=ps.find(p=>p.captain);
    return `<article class="card team-card" style="--team-color:${t.color}">
      <div class="team-banner"></div>
      <div class="team-head">
        ${media.logo?`<img class="team-logo-img" src="${encodeURI(media.logo)}" alt="${t.name} logo">`:`<div class="logo" style="background:${t.color}">${"⚽"}</div>`}
        <div><h2>${t.name}</h2><div class="muted">${ps.length} registered players${captain?` • Captain: ${captain.name}`:""}</div></div>
      </div>
      <div class="team-media">
        <div class="jersey-wrap">${media.jersey?`<img class="team-jersey-img" src="${encodeURI(media.jersey)}" alt="${t.name} jersey">`:`<div class="muted">Jersey image unavailable</div>`}</div>
        <div class="squad">
          <h4>Players</h4>
          <ul class="squad-list">${ps.map(p=>`<li><strong>${p.name}</strong>${p.captain?`<span class="captain-tag">Captain</span>`:""}</li>`).join("")}</ul>
        </div>
      </div>
    </article>`;
  }).join("");

  document.querySelector("#playerList").innerHTML=scorers.length?scorers.map(p=>
    `<div class="player-row"><span><strong>${p.name}</strong>${p.active===false?`<span class="inactive-tag">Former player</span>`:""}<div class="muted">${teamName(p.teamId)}${p.captain?" • Captain":""}${p.position?` • ${p.position}`:""}${p.number?` • #${p.number}`:""}</div></span>
    <span class="muted">G ${p.goals} • A ${p.assists} • YC ${p.yellow} • RC ${p.red} • POTM ${p.potm}</span></div>`).join(""):`<div class="muted">No players added yet.</div>`;

  fillSelects();
  renderLiveMatch();
  renderControlCenter();
  renderEventManager();
  renderTeamManager();
  const liveStandingsToggle=document.querySelector("#liveStandingsToggle");
  if(liveStandingsToggle) liveStandingsToggle.checked=data.settings?.liveStandings!==false;
}

function isRecordedScore(value){
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}
function hasScore(f){
  return Boolean(f) && isRecordedScore(f.homeScore) && isRecordedScore(f.awayScore);
}
function normalizedStatus(f){
  const status=String(f?.status||"").toLowerCase();
  if(["live","paused","halftime"].includes(status)) return status;
  if(status==="finished") return hasScore(f)?"finished":"scheduled";
  return hasScore(f)?"finished":"scheduled";
}
function elapsedSeconds(f){
  let total=Number(f.elapsedSeconds||0);
  if(normalizedStatus(f)==="live" && f.startedAtMs) total += Math.max(0,Math.floor((Date.now()-Number(f.startedAtMs))/1000));
  return total;
}
function formatClock(seconds){
  const s=Math.max(0,Math.floor(seconds));
  return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}
function activeMatch(){return data.fixtures.find(f=>["live","paused","halftime"].includes(normalizedStatus(f)));}
function matchEvents(matchId){return data.events.filter(e=>e.matchId===matchId).sort((a,b)=>(a.minute||0)-(b.minute||0)||(a.createdAtMs||0)-(b.createdAtMs||0));}
function eventIcon(type){return {"Goal":"⚽","Own Goal":"⚽","Assist":"🎯","Yellow Card":"🟨","Red Card":"🟥","Player of the Match":"⭐"}[type]||"•";}

function eventScoringTeamId(event, match){
  const player=data.players.find(x=>x.id===event.playerId);
  const playerTeamId=event.teamId || player?.teamId || "";
  if(event.type==="Own Goal"){
    if(playerTeamId===match?.home)return match.away;
    if(playerTeamId===match?.away)return match.home;
  }
  return playerTeamId;
}
function goalEventsForTeam(matchId, teamId){
  const match=data.fixtures.find(f=>f.id===matchId);
  return matchEvents(matchId).filter(e=>["Goal","Own Goal"].includes(e.type) && eventScoringTeamId(e,match)===teamId);
}
function teamScorersHtml(f, teamId, align="left"){
  const goals=goalEventsForTeam(f.id,teamId);
  if(!goals.length)return `<div class="team-scorers-empty">No goals</div>`;
  return `<div class="team-scorers ${align}">${goals.map(e=>{
    const p=data.players.find(x=>x.id===e.playerId);
    return `<div class="team-scorer-line"><span>${p?.name||"Unknown player"}${e.type==="Own Goal"?` <span class="og-tag">OG</span>`:""}</span><strong>${Number(e.minute||0)}'</strong></div>`;
  }).join("")}</div>`;
}
function renderLiveMatch(){
  const panel=document.querySelector("#liveMatchPanel"); if(!panel)return;
  const f=activeMatch(); panel.classList.toggle("visible",Boolean(f)); if(!f)return;
  const status=normalizedStatus(f);
  panel.classList.toggle("paused",status==="paused" || status==="halftime");
  document.querySelector("#liveStatusLabel").textContent=status==="halftime"?"HALF TIME":status==="paused"?"PAUSED":"LIVE";
  document.querySelector("#liveHomeName").textContent=teamName(f.home);
  document.querySelector("#liveAwayName").textContent=teamName(f.away);
  document.querySelector("#liveScore").textContent=`${Number(f.homeScore||0)}–${Number(f.awayScore||0)}`;
  document.querySelector("#liveMatchWeek").textContent=`Week ${f.week} • ${f.venue||""}`;
  document.querySelector("#liveClock").textContent=formatClock(elapsedSeconds(f));
  const timeline=matchEvents(f.id);
  const goals=timeline.filter(e=>["Goal","Own Goal"].includes(e.type));
  document.querySelector("#liveGoalScorers").innerHTML=goals.length?`
    <div class="live-team-scorers">
      <div class="live-team-scorer-column"><h4>${teamName(f.home)}</h4>${teamScorersHtml(f,f.home,"left")}</div>
      <div class="live-team-scorer-column away"><h4>${teamName(f.away)}</h4>${teamScorersHtml(f,f.away,"right")}</div>
    </div>`:`<div class="muted">No goals yet.</div>`;
  document.querySelector("#liveTimeline").innerHTML=timeline.length?timeline.map(e=>{
    const p=data.players.find(x=>x.id===e.playerId);
    return `<div class="timeline-item"><strong>${e.minute||0}'</strong><span>${eventIcon(e.type)} ${e.type}${p?` — ${p.name}${e.type==="Own Goal"?` <span class="og-tag">OG</span>`:""}`:""}</span></div>`;
  }).join(""):`<div class="muted">Live match events will appear here.</div>`;
}
function selectedControlMatch(){const id=document.querySelector("#controlMatch")?.value;return data.fixtures.find(f=>f.id===id)||data.fixtures[0];}
function renderControlCenter(){
  const f=selectedControlMatch(); if(!f)return;
  const status=normalizedStatus(f);
  document.querySelector("#controlMatchName").textContent=`${teamName(f.home)} vs ${teamName(f.away)}`;
  const text=status==="live"?"🔴 LIVE":status==="halftime"?"Half Time":status==="paused"?"Paused":status==="finished"?"Full Time":"Scheduled";
  const st=document.querySelector("#controlStatusText"); st.textContent=text; st.className=`${status==="live"?"status-live":status==="halftime"?"status-halftime":status==="paused"?"status-paused":status==="finished"?"status-finished":"muted"}`;
  document.querySelector("#controlHomeName").textContent=teamName(f.home);
  document.querySelector("#controlAwayName").textContent=teamName(f.away);
  document.querySelector("#controlScore").textContent=`${Number(f.homeScore||0)}–${Number(f.awayScore||0)}`;
  document.querySelector("#controlClock").textContent=formatClock(elapsedSeconds(f));
  document.querySelector("#startMatchBtn").disabled=status!=="scheduled";
  document.querySelector("#halfTimeBtn").disabled=status!=="live";
  document.querySelector("#pauseMatchBtn").disabled=status!=="live";
  document.querySelector("#resumeMatchBtn").disabled=!["paused","halftime"].includes(status);
  document.querySelector("#resumeMatchBtn").textContent=status==="halftime"?"Start Second Half":"Resume";
  document.querySelector("#endMatchBtn").disabled=!["live","paused","halftime"].includes(status);
  document.querySelector("#homeGoalBtn").disabled=status!=="live";
  document.querySelector("#awayGoalBtn").disabled=status!=="live";
}
async function updateControlledMatch(mutator){
  if(!isAdmin)return openLogin();
  const f=selectedControlMatch(); if(!f)return;
  mutator(f);
  render();
  try{await save();flash();}catch(err){alert(err.message);}
}

function managedEventMatchId(){
  const el=document.querySelector("#manageEventMatch");
  return el?.value || data.fixtures?.[0]?.id || "";
}
function eventDisplayText(e){
  const p=data.players.find(x=>x.id===e.playerId);
  return `${Number(e.minute||0)}' • ${eventIcon(e.type)} ${e.type} • ${p?.name||"Unknown player"}`;
}
function selectedManagedEvent(){
  const id=document.querySelector("#manageEventEntry")?.value;
  return data.events.find(e=>String(e.id)===String(id));
}
function renderEventManager(){
  const matchSelect=document.querySelector("#manageEventMatch");
  const eventSelect=document.querySelector("#manageEventEntry");
  const details=document.querySelector("#manageEventDetails");
  const list=document.querySelector("#manageEventList");
  const removeBtn=document.querySelector("#removeSelectedEventBtn");
  if(!matchSelect||!eventSelect||!details||!list||!removeBtn)return;

  const matchId=managedEventMatchId();
  const events=matchEvents(matchId);
  const previous=eventSelect.value;
  eventSelect.innerHTML=events.length
    ? `<option value="">Select an event</option>${events.map(e=>`<option value="${e.id}">${eventDisplayText(e)}</option>`).join("")}`
    : `<option value="">No recorded events for this match</option>`;
  if(events.some(e=>String(e.id)===String(previous)))eventSelect.value=previous;

  const chosen=selectedManagedEvent();
  if(chosen){
    const p=data.players.find(x=>x.id===chosen.playerId);
    details.innerHTML=`<strong>${eventIcon(chosen.type)} ${chosen.type}</strong><br>${p?.name||"Unknown player"} • ${teamName(p?.teamId)} • ${Number(chosen.minute||0)}'`;
    removeBtn.disabled=false;
  }else{
    details.textContent=events.length?"Select an event from the dropdown above.":"No events have been recorded for this match.";
    removeBtn.disabled=true;
  }

  list.innerHTML=events.length?events.map(e=>{
    const p=data.players.find(x=>x.id===e.playerId);
    return `<div class="managed-event">
      <div class="managed-event-minute">${Number(e.minute||0)}'</div>
      <div><div class="managed-event-type">${eventIcon(e.type)} ${e.type}</div><div class="muted">${p?.name||"Unknown player"}${e.type==="Own Goal"?` <span class="og-tag">OG</span>`:""} • ${teamName(p?.teamId)}</div></div>
      <button class="delete-event-btn" type="button" data-event-id="${e.id}">Remove</button>
    </div>`;
  }).join(""):`<div class="muted" style="padding:10px 0">No events recorded for this match.</div>`;
}
async function removeEvent(eventId){
  if(!isAdmin)return openLogin();
  const event=data.events.find(e=>String(e.id)===String(eventId));
  if(!event)return alert("The selected event could not be found. Refresh the page and try again.");
  const p=data.players.find(x=>x.id===event.playerId);
  const description=`${event.type}${p?` for ${p.name}`:""} at ${Number(event.minute||0)}'`;
  if(!confirm(`Remove ${description}?`))return;
  if(event.type==="Own Goal"){
    const match=data.fixtures.find(f=>f.id===event.matchId);
    const player=data.players.find(p=>p.id===event.playerId);
    const playerTeamId=event.teamId || player?.teamId;
    if(match && playerTeamId===match.home)match.awayScore=Math.max(0,Number(match.awayScore||0)-1);
    else if(match && playerTeamId===match.away)match.homeScore=Math.max(0,Number(match.homeScore||0)-1);
  }
  data.events=data.events.filter(e=>String(e.id)!==String(eventId));
  try{await save();flash();renderEventManager();}catch(err){alert(err.message);}
}

function selectedManagedTeamId(){
  return document.querySelector("#managePlayerTeam")?.value || data.teams?.[0]?.id || "";
}
function activePlayersForTeam(teamId){
  return data.players.filter(p=>p.teamId===teamId && p.active!==false).sort((a,b)=>a.name.localeCompare(b.name));
}
function selectedManagedPlayer(){
  const id=document.querySelector("#managePlayerSelect")?.value;
  return data.players.find(p=>String(p.id)===String(id));
}
function renderTeamManager(){
  const teamSelect=document.querySelector("#managePlayerTeam");
  const playerSelect=document.querySelector("#managePlayerSelect");
  const actionSelect=document.querySelector("#managePlayerAction");
  const destinationSelect=document.querySelector("#transferPlayerTeam");
  const destinationLabel=document.querySelector("#transferTeamLabel");
  const existingFields=document.querySelector("#existingPlayerFields");
  const addFields=document.querySelector("#addPlayerFields");
  const applyBtn=document.querySelector("#applyPlayerManagementBtn");
  const summary=document.querySelector("#managePlayerSummary");
  if(!teamSelect||!playerSelect||!actionSelect||!destinationSelect||!destinationLabel||!existingFields||!addFields||!applyBtn||!summary)return;
  const teamId=selectedManagedTeamId();
  const players=activePlayersForTeam(teamId);
  const previousPlayer=playerSelect.value;
  playerSelect.innerHTML=players.length
    ? `<option value="">Select a player</option>${players.map(p=>`<option value="${p.id}">${p.name}${p.captain?" (Captain)":""}</option>`).join("")}`
    : `<option value="">No active players on this team</option>`;
  if(players.some(p=>String(p.id)===String(previousPlayer)))playerSelect.value=previousPlayer;
  const action=actionSelect.value || "add";
  const adding=action==="add";
  existingFields.style.display=adding?"none":"grid";
  addFields.style.display=adding?"block":"none";
  const isTransfer=action==="transfer";
  destinationLabel.style.display=isTransfer?"block":"none";
  const previousDestination=destinationSelect.value;
  const destinations=data.teams.filter(t=>t.id!==teamId);
  destinationSelect.innerHTML=destinations.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  if(destinations.some(t=>t.id===previousDestination))destinationSelect.value=previousDestination;
  const labels={add:"Add player",remove:"Remove selected player",transfer:"Transfer selected player",captain:"Make selected player captain"};
  applyBtn.textContent=labels[action]||"Apply change";
  const player=selectedManagedPlayer();
  applyBtn.disabled=!adding && !player;
  if(adding){summary.textContent=`Add a new player permanently to ${teamName(teamId)}.`;return;}
  if(action==="captain"){
    const captain=players.find(p=>p.captain);
    summary.textContent=captain?`Current captain: ${captain.name}. Select another player to replace them.`:"No captain is currently selected.";
    return;
  }
  summary.textContent=players.length?"Choose a player and apply the selected action. Transfers are saved permanently in Firebase.":"No active players are registered on this team.";
}
function preservePlayerEventTeam(playerId, oldTeamId){
  data.events=data.events.map(e=>String(e.playerId)===String(playerId) && !e.teamId ? {...e,teamId:oldTeamId} : e);
}
async function applyPlayerManagement(){
  if(!isAdmin)return openLogin();
  const teamId=selectedManagedTeamId();
  const action=document.querySelector("#managePlayerAction").value;
  if(action==="add"){
    const name=document.querySelector("#manageNewPlayerName").value.trim();
    if(!name)return alert("Enter the player's name.");
    data.players.push({id:`P${Date.now()}`,name,teamId,active:true,captain:false,number:document.querySelector("#manageNewPlayerNumber").value,position:document.querySelector("#manageNewPlayerPosition").value.trim(),photo:"",createdAtMs:Date.now()});
    document.querySelector("#manageNewPlayerName").value="";
    document.querySelector("#manageNewPlayerNumber").value="";
    document.querySelector("#manageNewPlayerPosition").value="";
  }else{
    const player=selectedManagedPlayer();
    if(!player)return alert("Select a player first.");
    const oldTeamId=player.teamId;
    preservePlayerEventTeam(player.id,oldTeamId);
    if(action==="transfer"){
      const newTeamId=document.querySelector("#transferPlayerTeam").value;
      if(!newTeamId || newTeamId===oldTeamId)return alert("Choose a different destination team.");
      if(!confirm(`Transfer ${player.name} from ${teamName(oldTeamId)} to ${teamName(newTeamId)}? This change is permanent.`))return;
      player.previousTeamId=oldTeamId; player.teamId=newTeamId; player.active=true; player.captain=false; player.transferredAtMs=Date.now();
    }else if(action==="captain"){
      if(!confirm(`Make ${player.name} captain of ${teamName(teamId)}?`))return;
      data.players.filter(p=>p.teamId===teamId).forEach(p=>p.captain=false);
      player.captain=true; player.captainSinceMs=Date.now();
    }else{
      const stats=statsFor(player.id);
      if(!confirm(`Remove ${player.name} from ${teamName(oldTeamId)}? Historical statistics will remain (${stats.goals} goals, ${stats.assists} assists, ${stats.yellow} yellow cards, ${stats.red} red cards, ${stats.potm} POTM awards).`))return;
      player.active=false; player.captain=false; player.removedAtMs=Date.now();
    }
  }
  try{render();await save();flash();}catch(err){alert(err.message);}
}

function fillSelects(){
  const openMatches=Array.isArray(data.fixtures)?data.fixtures:[];
  ["resultMatch","eventMatch","controlMatch","manageEventMatch"].forEach(id=>{
    const el=document.querySelector("#"+id);
    if(!el)return;
    const current=el.value;
    el.innerHTML=openMatches.length?openMatches.map(f=>`<option value="${f.id}">${f.id}: ${teamName(f.home)} vs ${teamName(f.away)}</option>`).join(""):`<option value="">No matches available</option>`;
    if([...el.options].some(o=>o.value===current))el.value=current;
  });
  const teamOptions=data.teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  const manageTeam=document.querySelector("#managePlayerTeam");
  if(manageTeam){
    const current=manageTeam.value;
    manageTeam.innerHTML=teamOptions;
    manageTeam.value=data.teams.some(t=>t.id===current)?current:(data.teams[0]?.id||"");
  }
  const eventPlayer=document.querySelector("#eventPlayer");
  if(eventPlayer)eventPlayer.innerHTML=data.players.filter(p=>p.active!==false).map(p=>`<option value="${p.id}">${p.name} — ${teamName(p.teamId)}</option>`).join("");
}
document.querySelector("#tabs").addEventListener("click",e=>{
  if(!e.target.dataset.tab)return;
  if(e.target.dataset.tab==="admin"&&!isAdmin){openLogin();return;}
  activateTab(e.target.dataset.tab);
});
document.querySelector("#resultForm").addEventListener("submit",async e=>{
  e.preventDefault(); if(!isAdmin)return openLogin(); const f=data.fixtures.find(x=>x.id===document.querySelector("#resultMatch").value);
  f.homeScore=Number(document.querySelector("#homeScore").value); f.awayScore=Number(document.querySelector("#awayScore").value); f.status="finished"; f.startedAtMs=null; f.finishedAtMs=Date.now();
  try{await save();flash();e.target.reset();}catch(err){alert(err.message);}
});
document.querySelector("#eventType").addEventListener("change",e=>{
  const help=document.querySelector("#ownGoalHelp");
  if(help)help.style.display=e.target.value==="Own Goal"?"block":"none";
});
document.querySelector("#eventForm").addEventListener("submit",async e=>{
  e.preventDefault(); if(!isAdmin)return openLogin();
  if(!document.querySelector("#eventPlayer").value)return alert("Add a player first.");
  const matchId=document.querySelector("#eventMatch").value;
  const eventMatch=data.fixtures.find(f=>f.id===matchId);
  const minuteInput=document.querySelector("#eventMinute").value;
  const selectedPlayer=data.players.find(p=>p.id===document.querySelector("#eventPlayer").value);
  const autoMinute=eventMatch && ["live","paused","halftime"].includes(normalizedStatus(eventMatch)) ? Math.floor(elapsedSeconds(eventMatch)/60) : 0;
  const eventType=document.querySelector("#eventType").value;
  data.events.push({id:"E"+Date.now(),matchId,playerId:document.querySelector("#eventPlayer").value,teamId:selectedPlayer?.teamId||"",
    type:eventType,minute:minuteInput===""?autoMinute:Number(minuteInput),createdAtMs:Date.now()});
  if(eventType==="Own Goal" && eventMatch){
    if(selectedPlayer?.teamId===eventMatch.home)eventMatch.awayScore=Number(eventMatch.awayScore||0)+1;
    else if(selectedPlayer?.teamId===eventMatch.away)eventMatch.homeScore=Number(eventMatch.homeScore||0)+1;
  }
  try{await save();flash();e.target.reset();}catch(err){alert(err.message);}
});

document.querySelector("#manageEventMatch").addEventListener("change",renderEventManager);
document.querySelector("#manageEventEntry").addEventListener("change",renderEventManager);
document.querySelector("#removeSelectedEventBtn").addEventListener("click",()=>{
  const event=selectedManagedEvent();
  if(event)removeEvent(event.id);
});
document.querySelector("#manageEventList").addEventListener("click",e=>{
  const btn=e.target.closest("[data-event-id]");
  if(btn)removeEvent(btn.dataset.eventId);
});


document.querySelector("#managePlayerTeam").addEventListener("change",renderTeamManager);
document.querySelector("#managePlayerSelect").addEventListener("change",renderTeamManager);
document.querySelector("#managePlayerAction").addEventListener("change",renderTeamManager);
document.querySelector("#transferPlayerTeam").addEventListener("change",renderTeamManager);
document.querySelector("#teamManagementForm").addEventListener("submit",async e=>{
  e.preventDefault();
  await applyPlayerManagement();
});


document.querySelector("#liveStandingsToggle").addEventListener("change",async e=>{
  if(!isAdmin){e.target.checked=data.settings?.liveStandings!==false;return openLogin();}
  data.settings={...(data.settings||{}),liveStandings:e.target.checked};
  try{await save();flash();}catch(err){e.target.checked=!e.target.checked;alert(err.message);}
});

document.querySelector("#controlMatch").addEventListener("change",renderControlCenter);
document.querySelector("#startMatchBtn").addEventListener("click",()=>updateControlledMatch(f=>{
  f.status="live";
  f.phase="firstHalf";
  f.homeScore=hasScore(f)?Number(f.homeScore):0;
  f.awayScore=hasScore(f)?Number(f.awayScore):0;
  f.elapsedSeconds=0;
  f.startedAtMs=Date.now();
  f.finishedAtMs=null;
  f.halfTimeAtMs=null;
  f.secondHalfStartedAtMs=null;
}));
document.querySelector("#halfTimeBtn").addEventListener("click",()=>updateControlledMatch(f=>{
  if(normalizedStatus(f)!=="live")return;
  f.elapsedSeconds=elapsedSeconds(f);
  f.startedAtMs=null;
  f.status="halftime";
  f.phase="halfTime";
  f.halfTimeAtMs=Date.now();
}));
document.querySelector("#pauseMatchBtn").addEventListener("click",()=>updateControlledMatch(f=>{
  f.elapsedSeconds=elapsedSeconds(f); f.startedAtMs=null; f.status="paused";
}));
document.querySelector("#resumeMatchBtn").addEventListener("click",()=>updateControlledMatch(f=>{
  const wasHalfTime=normalizedStatus(f)==="halftime";
  f.startedAtMs=Date.now();
  f.status="live";
  if(wasHalfTime){
    f.phase="secondHalf";
    f.secondHalfStartedAtMs=Date.now();
    f.halfTimeAtMs=f.halfTimeAtMs||Date.now();
  }
}));
document.querySelector("#endMatchBtn").addEventListener("click",()=>{
  if(!confirm("End this match and finalize the result?"))return;
  updateControlledMatch(f=>{f.elapsedSeconds=elapsedSeconds(f);f.startedAtMs=null;f.status="finished";f.phase="fullTime";f.finishedAtMs=Date.now();});
});
document.querySelector("#homeGoalBtn").addEventListener("click",()=>updateControlledMatch(f=>{f.homeScore=Number(f.homeScore||0)+1;}));
document.querySelector("#awayGoalBtn").addEventListener("click",()=>updateControlledMatch(f=>{f.awayScore=Number(f.awayScore||0)+1;}));
setInterval(()=>{
  const f=activeMatch();
  if(f){
    const lc=document.querySelector("#liveClock"); if(lc)lc.textContent=formatClock(elapsedSeconds(f));
  }
  const cf=selectedControlMatch(); const cc=document.querySelector("#controlClock"); if(cf&&cc)cc.textContent=formatClock(elapsedSeconds(cf));
  renderLiveTableNotice();
},1000);

function flash(){const n=document.querySelector("#notice");n.style.display="block";setTimeout(()=>n.style.display="none",1800)}
function openLogin(){document.querySelector("#loginError").style.display="none";document.querySelector("#loginModal").classList.add("open");setTimeout(()=>document.querySelector("#adminUsername").focus(),50)}
function closeLogin(){document.querySelector("#loginModal").classList.remove("open");document.querySelector("#loginForm").reset()}
document.querySelector("#authBtn").addEventListener("click",async ()=>{
  if(isAdmin){
    try{await auth.signOut();activateTab("home");}catch(err){alert(err.message);}
  } else openLogin();
});
document.querySelector("#closeLogin").addEventListener("click",closeLogin);
document.querySelector("#loginModal").addEventListener("click",e=>{if(e.target.id==="loginModal")closeLogin()});
document.querySelector("#loginForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const email=document.querySelector("#adminUsername").value.trim().toLowerCase();
  const password=document.querySelector("#adminPassword").value;
  const errorBox=document.querySelector("#loginError");
  errorBox.style.display="none";
  try{
    const credential=await auth.signInWithEmailAndPassword(email,password);
    if(credential.user.email?.toLowerCase()!==ADMIN_EMAIL){
      await auth.signOut();
      throw new Error("This account is not authorized as league admin.");
    }
    closeLogin();
    activateTab("admin");
  }catch(err){
    console.error("Login error",err);
    const messages={
      "auth/invalid-credential":"Incorrect email or password.",
      "auth/user-not-found":"Admin account not found.",
      "auth/wrong-password":"Incorrect email or password.",
      "auth/too-many-requests":"Too many attempts. Please wait and try again.",
      "auth/network-request-failed":"Network error. Check your internet connection."
    };
    errorBox.textContent=messages[err.code]||err.message||"Unable to sign in.";
    errorBox.style.display="block";
  }
});

auth.onAuthStateChanged(user=>{
  isAdmin=Boolean(user && user.email?.toLowerCase()===ADMIN_EMAIL);
  updateAuthUI();
  if(isAdmin && !cloudReady) setStatus("Admin connected • Connecting to live data…");
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLogin()});
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
render();
updateAuthUI();
startLiveData();


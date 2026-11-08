const APP_VERSION = "1.1.4";
const firebaseConfig = {
  apiKey: "AIzaSyAh6B75N8AK1TmIXUz1thxzoKxToeztf08",
  authDomain: "intra-squad-sunday-league.firebaseapp.com",
  projectId: "intra-squad-sunday-league",
  storageBucket: "intra-squad-sunday-league.firebasestorage.app",
  messagingSenderId: "390341357300",
  appId: "1:390341357300:web:22443b7f9fba6c7af838a1"
};

firebase.initializeApp(firebaseConfig);
// Direct photo upload configuration (Cloudinary free plan).
// Set these two values once after creating an unsigned image-only upload preset.
const CLOUDINARY_CLOUD_NAME = "w4yvxtsl";
const CLOUDINARY_UPLOAD_PRESET = "intra_squad_gallery";

const auth = firebase.auth();
const db = firebase.firestore();
let leagueRef = db.collection("league").doc("current");
const leagueConfigRef = db.collection("league").doc("config");
const mediaRef = db.collection("matchMedia");
const ADMIN_EMAIL = "admin@intrasquadleague.com";

const DEFAULT_COMPETITIONS = [
  {id:"S2_LEAGUE",group:"Season 2 (2026/27)",parentSeason:"Season 2",name:"League",fullName:"Intra Squad Sunday League — Season 2 • League",icon:"⚽",type:"league",status:"upcoming",startDate:"Sep 27, 2026",endDate:"Nov 22, 2026",format:"League",description:"Season 2 league competition with competition-specific squads and statistics."},
  {id:"S2_SUPER",group:"Season 2 (2026/27)",parentSeason:"Season 2",name:"Super Cup",fullName:"Intra Squad Sunday League — Season 2 • Super Cup",icon:"🏆",type:"super_cup",status:"upcoming",startDate:"TBD",endDate:"TBD",format:"Super Cup",description:"Season 2 Super Cup."},
  {id:"S1_LEAGUE",group:"Season 1 (2026)",parentSeason:"Season 1",name:"League",fullName:"Intra Squad Sunday League — Season 1 • League",icon:"⚽",type:"league_final",status:"completed",startDate:"Aug 9, 2026",endDate:"Aug 30, 2026",format:"League + Final",description:"Original Season 1 league data. This competition uses the preserved legacy Firebase document."},
  {id:"S1_SUPER",group:"Season 1 (2026)",parentSeason:"Season 1",name:"Super Cup",fullName:"Intra Squad Sunday League — Season 1 • Super Cup",icon:"🏆",type:"super_cup",status:"completed",startDate:"Aug 30, 2026",endDate:"Sep 6, 2026",format:"Super Cup",description:"Season 1 Super Cup."},
  {id:"DASHAIN_2026",group:"Other Tournaments",parentSeason:"",name:"Dashain Cup 2026",fullName:"Dashain Cup 2026",icon:"🐐",type:"league_final",status:"upcoming",startDate:"Oct 11, 2026",endDate:"TBD",format:"League + Final",description:"League stage followed by a Final between the top two teams."},
  {id:"NEWYEAR_2026",group:"Other Tournaments",parentSeason:"",name:"New Year Cup 2026",fullName:"New Year Cup 2026",icon:"🎉",type:"special",status:"upcoming",startDate:"Jan 3",endDate:"Jan 3",format:"11 v 11",description:"Special New Year Cup competition."}
];
let competitions = structuredClone(DEFAULT_COMPETITIONS);
let currentCompetitionId = "S1_LEAGUE";
let selectedCompetitionId = currentCompetitionId;
// Competition browsing is session-only. A fresh open/reload always starts on the Admin-selected Current competition.
try{ localStorage.removeItem("issl-selected-competition"); }catch{}
let unsubscribeCompetitionConfig = null;
let competitionConfigLoaded = false;

function competitionById(id){ return competitions.find(c=>c.id===id); }
function competitionDocRef(id){ return id==="S1_LEAGUE" ? db.collection("league").doc("current") : db.collection("league").doc(`competition_${id}`); }
function competitionLabel(id=selectedCompetitionId){ const c=competitionById(id); return c?.fullName || c?.name || "Competition"; }
function competitionShortLabel(id=selectedCompetitionId){ const c=competitionById(id); return c?.parentSeason ? `${c.parentSeason} • ${c.name}` : (c?.name||"Competition"); }
function competitionStatus(c){ return String(c?.status||"upcoming").toLowerCase(); }

let isAdmin = false;
let cloudReady = false;
let unsubscribeLeague = null;
let unsubscribeMedia = null;
let allMatchMedia = [];
let matchMedia = [];
let expandedFixtureId = "";

const TEAM_MEDIA = {
  T1: {logo: "No Stamina Hustlers Logo.png", jersey: "No Stamina Hustlers Jersey.png"},
  T2: {logo: "Momo Strikers Logo.png", jersey: "Momo Strikers Jersey.png"},
  T3: {logo: "Jhyap Warriors Logo.png", jersey: "Jhyap Warriors Jersey.png"}
};

const TEAM_DETAILS = {
  T1: {owner:"Gyalpo Yonjan",sponsors:["Sunil Thapa","Kshitij Sampang Rai","Sijan Gautam","Abhi Siwakoti"]},
  T2: {owner:"Udhab KC",sponsors:["Santosh Karki","Sandesh Thapa","Bhupen Shahi","Pratik Shahi"]},
  T3: {owner:"Rajesh Thapa",sponsors:["Anil Thapa","Aman KC","Mahadev Thapa"]}
};

const REMAINING_FIXTURE_UPDATES = {
  M3:{home:"T3",away:"T2",date:"08/16/2026",time:"8:30 AM"},
  M4:{home:"T3",away:"T1",date:"08/16/2026",time:"9:30 AM"},
  M5:{home:"T1",away:"T3",date:"08/23/2026",time:"8:30 AM"},
  M6:{home:"T1",away:"T2",date:"08/23/2026",time:"9:30 AM"}
};

const FUTURE_EVENTS = [
  {date:"August 30",icon:"🏆",title:"League Final",details:[]},
  {date:"September 6",icon:"🏆",title:"Super Cup Final",details:[]},
  {date:"September 13–20",icon:"⏸️",title:"Break / Player Auction",details:[]},
  {date:"September 27",icon:"⚽️",title:"New League Season Starts",details:["10-week league format","League-only format"]},
  {date:"October 11",icon:"🐐",title:"Dashain Cup 2026",details:["League + Final","Top 2 teams qualify for the Final"]},
  {date:"October 18",icon:"⏸️",title:"Dashain Break",details:[]},
  {date:"October 25",icon:"⚽️",title:"League Resumes",details:[]},
  {date:"December 20",icon:"🏆",title:"League Cup Final",details:[]},
  {date:"December 27",icon:"🏆",title:"Super Cup Final",details:[]},
  {date:"January 3",icon:"🎉",title:"New Year Cup",details:["11 vs. 11","Married 🆚 Unmarried"]}
];

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
    "away": "T2",
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
    "away": "T1",
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

function emptyCompetitionData(){
  return {teams:structuredClone(seed.teams),players:[],fixtures:[],events:[],settings:{liveStandings:true}};
}
function normalizeCompetitionData(remote){
  const base = selectedCompetitionId==="S1_LEAGUE" ? structuredClone(seed) : emptyCompetitionData();
  const fixtures=(Array.isArray(remote?.fixtures)?remote.fixtures:base.fixtures).map(f=>{
    const update=selectedCompetitionId==="S1_LEAGUE" ? REMAINING_FIXTURE_UPDATES[f.id] : null;
    return update && normalizedStatus(f)!=="finished" ? {...f,...update} : f;
  });
  return {
    teams:Array.isArray(remote?.teams)?remote.teams:base.teams,
    players:Array.isArray(remote?.players)?remote.players:base.players,
    fixtures,
    events:(Array.isArray(remote?.events)?remote.events:[]).map((event,index)=>({...event,id:event.id||`LEGACY-${event.matchId||"MATCH"}-${event.createdAtMs||event.minute||0}-${index}`})),
    settings:{liveStandings:remote?.settings?.liveStandings!==false}
  };
}

function filterMediaForSelectedCompetition(){
  matchMedia=allMatchMedia.filter(m=>{
    const cid=String(m.competitionId||"");
    return cid ? cid===selectedCompetitionId : selectedCompetitionId==="S1_LEAGUE";
  });
}

function switchCompetition(id,{openHome=false}={}){
  if(!competitionById(id))return;
  selectedCompetitionId=id;
  leagueRef=competitionDocRef(id);
  expandedFixtureId="";
  filterMediaForSelectedCompetition();
  renderCompetitionUI();
  startLiveData();
  renderGallery();
  renderAdminGallery();
  if(openHome)activateTab("home");
}

function startCompetitionConfig(){
  if(unsubscribeCompetitionConfig)unsubscribeCompetitionConfig();
  unsubscribeCompetitionConfig=leagueConfigRef.onSnapshot(async snap=>{
    const firstConfigLoad=!competitionConfigLoaded;
    competitionConfigLoaded=true;
    let selectionChanged=false;
    if(snap.exists){
      const cfg=snap.data()||{};
      if(Array.isArray(cfg.competitions)&&cfg.competitions.length)competitions=cfg.competitions;
      currentCompetitionId=cfg.currentCompetitionId && competitionById(cfg.currentCompetitionId)?cfg.currentCompetitionId:currentCompetitionId;
      // On every fresh page/app load, use the competition Admin marked Current.
      // After that, visitors may browse another competition without changing the default for their next visit.
      if(firstConfigLoad){
        selectedCompetitionId=currentCompetitionId;
        selectionChanged=true;
      }else if(!competitionById(selectedCompetitionId)){
        selectedCompetitionId=currentCompetitionId;
        selectionChanged=true;
      }
    }else if(isAdmin){
      await leagueConfigRef.set({competitions:structuredClone(DEFAULT_COMPETITIONS),currentCompetitionId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    }
    if(firstConfigLoad || selectionChanged){
      leagueRef=competitionDocRef(selectedCompetitionId);
      filterMediaForSelectedCompetition();
      startLiveData();
      renderGallery();
      renderAdminGallery();
    }
    renderCompetitionUI();
  },err=>{
    console.warn("Competition config unavailable",err);
    // Offline/config failure fallback: open the built-in current competition instead of leaving Home empty.
    if(!competitionConfigLoaded){
      competitionConfigLoaded=true;
      selectedCompetitionId=currentCompetitionId;
      leagueRef=competitionDocRef(selectedCompetitionId);
      startLiveData();
    }
    renderCompetitionUI();
  });
}

function renderCompetitionUI(){
  const current=competitionById(selectedCompetitionId)||DEFAULT_COMPETITIONS[0];
  const context=document.querySelector("#competitionContextName"); if(context)context.textContent=competitionShortLabel();
  const homeTitle=document.querySelector("#homeCompetitionTitle"); if(homeTitle)homeTitle.textContent=competitionShortLabel();
  const homeMeta=document.querySelector("#homeCompetitionMeta"); if(homeMeta)homeMeta.textContent=`${current?.format||"Competition"}${current?.startDate?` • ${current.startDate}${current.endDate&&current.endDate!==current.startDate?` – ${current.endDate}`:""}`:""}`;
  [["fixturesCompetitionName","Fixtures"],["standingsCompetitionName","Standings"],["teamsCompetitionName","Teams"],["statsCompetitionName","Stats"]].forEach(([id])=>{const el=document.querySelector("#"+id);if(el)el.textContent=competitionShortLabel();});
  const groups=[...new Set(competitions.map(c=>c.group||"Other Competitions"))];
  const catalog=document.querySelector("#competitionsCatalog");
  if(catalog)catalog.innerHTML=groups.map(group=>`<div class="competition-group"><div class="competition-group-title">${group}</div>${competitions.filter(c=>(c.group||"Other Competitions")===group).map(c=>`<div class="competition-item ${c.id===selectedCompetitionId?"active":""}" data-competition-id="${c.id}"><div class="competition-icon">${c.icon||"🏆"}</div><div><strong>${c.name}</strong><small>${c.startDate||"TBD"}${c.endDate&&c.endDate!==c.startDate?` – ${c.endDate}`:""} • ${c.format||"Competition"}</small></div><span class="status-chip ${competitionStatus(c)}">${c.id===currentCompetitionId?"Current":competitionStatus(c)}</span></div>`).join("")}</div>`).join("");
  const overview=document.querySelector("#competitionOverviewCard");
  if(overview && current)overview.innerHTML=`<div class="competition-overview-hero"><div><div class="muted">Selected Competition</div><h2>${current.icon||"🏆"} ${current.fullName||current.name}</h2><div class="muted">${current.description||""}</div></div><span class="status-chip ${competitionStatus(current)}">${current.id===currentCompetitionId?"Current":competitionStatus(current)}</span></div><div class="competition-format"><strong>Format: ${current.format||"Competition"}</strong>${current.type==="league_final"?`<div class="qualification-flow"><span>League Stage</span><b>→</b><span>Top 2</span><b>→</b><span>Final</span></div><div class="muted" style="margin-top:8px">Positions 1 and 2 qualify for the Final. Final team names resolve automatically when the league stage is complete.</div>`:""}</div><button class="btn" type="button" data-view-selected-competition style="margin-top:12px">View ${current.name}</button>`;
  const list=document.querySelector("#competitionSwitcherList");
  if(list)list.innerHTML=competitions.map(c=>`<button class="competition-switch-option ${c.id===selectedCompetitionId?"selected":""}" type="button" data-switch-competition="${c.id}"><span>${c.icon||"🏆"}</span><span><strong>${c.parentSeason?`${c.parentSeason} — `:""}${c.name}</strong><small>${c.format||""}</small></span><span class="status-chip ${competitionStatus(c)}">${c.id===currentCompetitionId?"Current":competitionStatus(c)}</span></button>`).join("");
  const adminSelect=document.querySelector("#adminCompetitionSelect");
  if(adminSelect){const old=adminSelect.value;adminSelect.innerHTML=competitions.map(c=>`<option value="${c.id}">${c.parentSeason?`${c.parentSeason} — `:""}${c.name}</option>`).join("");adminSelect.value=competitions.some(c=>c.id===old)?old:selectedCompetitionId;}
  const statusSel=document.querySelector("#adminCompetitionStatus");if(statusSel){statusSel.value=competitionStatus(competitionById(adminSelect?.value||selectedCompetitionId));}
}

async function save(){
  if(!isAdmin) throw new Error("Admin login required.");
  await leagueRef.set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
}

function setStatus(message){
  document.querySelector("#adminStatus").textContent = message;
}

function startLiveData(){
  if(unsubscribeLeague) unsubscribeLeague();
  const listeningCompetitionId=selectedCompetitionId;
  const ref=competitionDocRef(listeningCompetitionId);
  leagueRef=ref;
  unsubscribeLeague = ref.onSnapshot(async snapshot => {
    if(listeningCompetitionId!==selectedCompetitionId)return;
    cloudReady = true;
    if(snapshot.exists){
      data = normalizeCompetitionData(snapshot.data());
      setStatus(isAdmin ? `Admin connected • ${competitionShortLabel()} synced` : `${competitionShortLabel()} • Live data connected`);
      render();
    } else {
      data = listeningCompetitionId==="S1_LEAGUE" ? structuredClone(seed) : emptyCompetitionData();
      setStatus(isAdmin ? `Admin connected • ${competitionShortLabel()} not initialized` : `${competitionShortLabel()} • No data yet`);
      render();
    }
  }, error => {
    console.error("Firestore listener error", error);
    cloudReady = false;
    setStatus("Unable to connect to competition data");
  });
}

function startMediaData(){
  if(unsubscribeMedia) unsubscribeMedia();
  unsubscribeMedia = mediaRef.orderBy("createdAtMs","desc").onSnapshot(snapshot=>{
    allMatchMedia = snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
    filterMediaForSelectedCompetition();
    renderGallery();
    renderAdminGallery();
    renderLiveMatch();
    if(expandedFixtureId) render();
  }, error=>{
    console.warn("Gallery listener error", error);
    allMatchMedia = [];
    matchMedia = [];
    renderGallery();
    renderAdminGallery();
  });
}


function backupFileName(){
  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  return `issl-backup-${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.json`;
}
function setBackupStatus(message){
  const el=document.querySelector("#backupStatus");
  if(el)el.textContent=message;
}
async function downloadLeagueBackup(){
  if(!isAdmin)return openLogin();
  try{
    setBackupStatus("Preparing backup…");
    const mediaSnapshot=await mediaRef.get();
    const gallery=mediaSnapshot.docs.map(doc=>({id:doc.id,...doc.data()})).filter(m=>m.competitionId?m.competitionId===selectedCompetitionId:selectedCompetitionId==="S1_LEAGUE");
    const backup={
      format:"ISSL_BACKUP",
      backupVersion:1,
      appVersion:APP_VERSION,
      competitionId:selectedCompetitionId,
      competition:structuredClone(competitionById(selectedCompetitionId)||{}),
      exportedAt:new Date().toISOString(),
      leagueData:structuredClone(data),
      matchMedia:gallery
    };
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=backupFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setBackupStatus(`Backup downloaded • ${gallery.length} Gallery item${gallery.length===1?"":"s"} included.`);
  }catch(err){
    console.error("Backup failed",err);
    setBackupStatus("Backup failed.");
    alert(err.message||"Unable to create backup.");
  }
}
function validateLeagueBackup(backup){
  if(!backup || backup.format!=="ISSL_BACKUP")throw new Error("This is not an Intra Squad Sunday League backup file.");
  const d=backup.leagueData;
  if(!d || !Array.isArray(d.teams) || !Array.isArray(d.players) || !Array.isArray(d.fixtures) || !Array.isArray(d.events)){
    throw new Error("Backup is missing required league data.");
  }
  if(backup.matchMedia!=null && !Array.isArray(backup.matchMedia))throw new Error("Backup Gallery data is invalid.");
  return true;
}
async function restoreLeagueBackup(){
  if(!isAdmin)return openLogin();
  const input=document.querySelector("#restoreLeagueBackupFile");
  const file=input?.files?.[0];
  if(!file)return alert("Choose a backup JSON file first.");
  try{
    setBackupStatus("Reading backup…");
    const backup=JSON.parse(await file.text());
    validateLeagueBackup(backup);
    const gallery=Array.isArray(backup.matchMedia)?backup.matchMedia:[];
    const exported=backup.exportedAt?new Date(backup.exportedAt).toLocaleString():"unknown date";
    const ok=confirm(
      `Restore this backup?\n\nBackup date: ${exported}\nTeams: ${backup.leagueData.teams.length}\nPlayers: ${backup.leagueData.players.length}\nFixtures: ${backup.leagueData.fixtures.length}\nEvents: ${backup.leagueData.events.length}\nGallery items: ${gallery.length}\n\nThis will replace the CURRENT league data and Gallery records.`
    );
    if(!ok){setBackupStatus("Restore cancelled.");return;}
    const second=confirm("Final confirmation: replace the current live Firebase league data with this backup?");
    if(!second){setBackupStatus("Restore cancelled.");return;}
    setBackupStatus("Restoring league data…");
    await leagueRef.set({
      ...backup.leagueData,
      restoredAt:firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    setBackupStatus("Restoring Gallery records…");
    const current=await mediaRef.get();
    for(const doc of current.docs){
      const m=doc.data()||{};
      const belongs=m.competitionId?m.competitionId===selectedCompetitionId:selectedCompetitionId==="S1_LEAGUE";
      if(belongs)await doc.ref.delete();
    }
    for(const item of gallery){
      const {id,...payload}=item||{};
      if(!payload || typeof payload!=="object")continue;
      if(selectedCompetitionId!=="S1_LEAGUE")payload.competitionId=selectedCompetitionId;
      if(id)await mediaRef.doc(String(id)).set(payload);
      else await mediaRef.add(payload);
    }
    input.value="";
    setBackupStatus(`Restore completed successfully • ${gallery.length} Gallery item${gallery.length===1?"":"s"} restored.`);
    alert("Backup restored successfully. Live data will refresh automatically.");
  }catch(err){
    console.error("Restore failed",err);
    setBackupStatus("Restore failed. Current data may be partially changed; check the live site before making more edits.");
    alert(err.message||"Unable to restore backup.");
  }
}

const team = id => data.teams.find(t=>t.id===id);

function isFinalFixture(f){
  return Boolean(f && (f.isFinal===true || f.id==="F1" || f.home==="FINAL1" || f.away==="FINAL2"));
}
function leagueStageFixtures(){
  return data.fixtures.filter(f=>!isFinalFixture(f));
}
function leagueStageComplete(){
  const fixtures=leagueStageFixtures();
  return fixtures.length>0 && fixtures.every(f=>normalizedStatus(f)==="finished" && hasScore(f));
}
function resolvedFinalists(){
  if(!leagueStageComplete())return null;
  const table=standings();
  if(table.length<2)return null;
  return {home:table[0].team.id,away:table[1].team.id};
}
function actualFixtureTeamId(f,sideOrId){
  const raw=sideOrId==="home"?f?.home:sideOrId==="away"?f?.away:sideOrId;
  if(raw==="FINAL1"){const r=resolvedFinalists();return r?.home||"";}
  if(raw==="FINAL2"){const r=resolvedFinalists();return r?.away||"";}
  return raw||"";
}
function teamName(id){
  if(id==="FINAL1"){
    const r=resolvedFinalists();
    return r?team(r.home)?.name||"1st Place":"1st Place";
  }
  if(id==="FINAL2"){
    const r=resolvedFinalists();
    return r?team(r.away)?.name||"2nd Place":"2nd Place";
  }
  return team(id)?.name || "TBD";
}
function teamLogo(id){
  if(id==="FINAL1"){
    const r=resolvedFinalists();
    return r?TEAM_MEDIA[r.home]?.logo||"":"";
  }
  if(id==="FINAL2"){
    const r=resolvedFinalists();
    return r?TEAM_MEDIA[r.away]?.logo||"":"";
  }
  return TEAM_MEDIA[id]?.logo || "";
}
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
  const secondary=["standings","top-scorers","awards","gallery","future-events","admin"];
  const primary=secondary.includes(tabId)?"more":tabId;
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===primary));
  document.querySelectorAll("main section").forEach(sec=>sec.classList.toggle("active",sec.id===tabId));
  window.scrollTo({top:0,behavior:"smooth"});
}


function standings(){
  const s = Object.fromEntries(data.teams.map(t=>[t.id,{team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}]));
  data.fixtures.filter(f=>{
    if(isFinalFixture(f) || !hasScore(f) || !s[f.home] || !s[f.away]) return false;
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

function fixtureLineups(f){
  return {
    home: Array.isArray(f?.lineups?.home) ? f.lineups.home : [],
    away: Array.isArray(f?.lineups?.away) ? f.lineups.away : []
  };
}
function playerName(id){return data.players.find(p=>p.id===id)?.name || "Unknown player";}
function playerCaptainForFixture(playerId,teamId){
  const p=data.players.find(x=>x.id===playerId);
  return p?.captain && p?.teamId===teamId;
}
function substitutionEvents(matchId,teamId=""){
  return matchEvents(matchId).filter(e=>e.type==="Substitution" && (!teamId || e.teamId===teamId));
}
function lineupHtml(f,side){
  const ids=fixtureLineups(f)[side];
  const teamId=actualFixtureTeamId(f,side);
  if(!ids.length)return `<div class="muted">Lineup not submitted.</div>`;
  return `<ul class="lineup-list">${ids.map(id=>`<li>${playerName(id)}${playerCaptainForFixture(id,teamId)?" (C)":""}</li>`).join("")}</ul>`;
}
function substitutionsHtml(f,teamId){
  const subs=substitutionEvents(f.id,teamId);
  if(!subs.length)return `<div class="muted">No substitutions.</div>`;
  return `<div class="sub-list">${subs.map(e=>`<div class="sub-line"><strong>${Number(e.minute||0)}'</strong> <span class="sub-out">⬇ ${playerName(e.playerOutId)}</span> &nbsp; <span class="sub-in">⬆ ${playerName(e.playerInId)}</span></div>`).join("")}</div>`;
}
function fixtureDetailsHtml(f){
  const finished=normalizedStatus(f)==="finished" && hasScore(f);
  const resultSummary=finished?`<div class="completed-match-summary">
    <div class="result-with-scorers">
      <div class="result-team result-home"><strong>${teamName(f.home)}</strong>${completedTeamMatchDetailsHtml(f,f.home,"left")}</div>
      <div class="result-center"><div class="result-score">${Number(f.homeScore)}–${Number(f.awayScore)}</div><span class="badge">Full Time</span><div class="muted">Week ${f.week}${f.date?` • ${f.date}`:""}</div></div>
      <div class="result-team result-away"><strong>${teamName(f.away)}</strong>${completedTeamMatchDetailsHtml(f,f.away,"right")}</div>
    </div>
  </div>`:"";
  const finalBanner=isFinalFixture(f)
    ? `<div class="final-resolution-banner">${leagueStageComplete()
        ? `🏆 Finalists automatically set: ${teamName("FINAL1")} vs ${teamName("FINAL2")}`
        : "🏆 Finalists will be filled automatically when all league-stage matches are completed."}</div>`
    : "";
  return `<div class="fixture-details">${finalBanner}
    ${resultSummary}
    <div class="fixture-detail-grid">
      <div class="fixture-detail-team"><div class="live-lineup-team-head">${logoHtml(f.home)}<h4>${teamName(f.home)}</h4></div>${lineupHtml(f,"home")}${substitutionsHtml(f,actualFixtureTeamId(f,"home"))}</div>
      <div class="fixture-detail-team away"><div class="live-lineup-team-head">${logoHtml(f.away)}<h4>${teamName(f.away)}</h4></div>${lineupHtml(f,"away")}${substitutionsHtml(f,actualFixtureTeamId(f,"away"))}</div>
    </div>
    ${fixtureMediaSummaryHtml(f)}
  </div>`;
}

function mediaForMatch(matchId){
  return matchMedia.filter(m=>String(m.matchId)===String(matchId)).sort((a,b)=>Number(b.createdAtMs||0)-Number(a.createdAtMs||0));
}
function mediaForGeneral(){
  return matchMedia.filter(m=>String(m.matchId||"")==="GENERAL").sort((a,b)=>Number(b.createdAtMs||0)-Number(a.createdAtMs||0));
}
function youtubeEmbedUrl(url=""){
  try{
    const u=new URL(url);
    if(u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.replace("/","")}`;
    if(u.hostname.includes("youtube.com")){
      const id=u.searchParams.get("v");
      if(id)return `https://www.youtube.com/embed/${id}`;
      const parts=u.pathname.split("/").filter(Boolean);
      const shorts=parts.indexOf("shorts");
      if(shorts>=0 && parts[shorts+1])return `https://www.youtube.com/embed/${parts[shorts+1]}`;
    }
  }catch{}
  return "";
}
function mediaItemHtml(item,{compact=false,admin=false}={}){
  const caption=(item.caption||"").replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
  const url=item.url||"";
  const isImage=item.mediaType==="image" || (!item.mediaType && /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url));
  const isVideo=item.mediaType==="video" || (!item.mediaType && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url));
  const yt=youtubeEmbedUrl(url);
  let body="";
  if(isImage) body=`<img class="gallery-media" src="${url}" alt="${caption||"Match photo"}" loading="lazy">`;
  else if(yt) body=`<div class="gallery-video-wrap"><iframe src="${yt}" title="${caption||"Match video"}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  else if(isVideo) body=`<video class="gallery-media" controls preload="metadata" playsinline src="${url}"></video>`;
  else body=`<a class="gallery-external" href="${url}" target="_blank" rel="noopener">Open media ↗</a>`;
  return `<article class="gallery-item ${compact?"compact":""}">
    ${body}
    <div class="gallery-meta">
      ${caption?`<div class="gallery-caption">${caption}</div>`:""}
      <div class="muted">${item.mediaType==="video"?"Video":"Photo"}${item.createdBy?" • Added by Admin":""}</div>
      ${admin?`<button class="delete-media-btn" type="button" data-delete-media="${item.id}">${item.mediaType==="image"?"Remove Photo":"Remove Video"}</button>`:""}
    </div>
  </article>`;
}
function matchGalleryHtml(f,{compact=false}={}){
  const items=mediaForMatch(f.id);
  if(!items.length)return `<div class="muted">No photos or videos have been added for this match.</div>`;
  return `<div class="gallery-grid ${compact?"compact-grid":""}">${items.map(item=>mediaItemHtml(item,{compact})).join("")}</div>`;
}
function fixtureMediaSummaryHtml(f){
  const items=mediaForMatch(f.id);
  return `<div class="fixture-gallery"><h4>Gallery${items.length?` <span class="badge">${items.length}</span>`:""}</h4>${matchGalleryHtml(f,{compact:true})}</div>`;
}
function renderGallery(){
  const filter=document.querySelector("#galleryMatchFilter");
  const content=document.querySelector("#galleryContent");
  if(!filter||!content)return;
  const previous=filter.value;
  filter.innerHTML=`<option value="">All Photos & Videos</option><option value="GENERAL">General Competition Gallery</option>${data.fixtures.map(f=>`<option value="${f.id}">Week ${f.week} • ${teamName(f.home)} vs ${teamName(f.away)}</option>`).join("")}`;
  if(previous==="GENERAL" || data.fixtures.some(f=>f.id===previous))filter.value=previous;
  const selected=filter.value;
  const sections=[];
  if(!selected || selected==="GENERAL"){
    const general=mediaForGeneral();
    if(general.length)sections.push(`<div class="gallery-match-group">
      <div class="gallery-match-head"><div><strong>📸 General Competition Gallery</strong><div class="muted">Competition photos not tied to a specific match</div></div><span class="badge">${general.length} item${general.length===1?"":"s"}</span></div>
      <div class="gallery-grid">${general.map(item=>mediaItemHtml(item,{admin:isAdmin})).join("")}</div>
    </div>`);
  }
  if(selected!=="GENERAL"){
    const fixtures=selected?data.fixtures.filter(f=>f.id===selected):data.fixtures.filter(f=>mediaForMatch(f.id).length);
    fixtures.forEach(f=>{
      const items=mediaForMatch(f.id);
      if(!items.length)return;
      sections.push(`<div class="gallery-match-group">
        <div class="gallery-match-head">
          <div><strong>${teamName(f.home)} vs ${teamName(f.away)}</strong><div class="muted">Week ${f.week}${f.date?` • ${f.date}`:""} • ${normalizedStatus(f)==="finished"?"Full Time":normalizedStatus(f)==="live"?"LIVE":normalizedStatus(f)==="halftime"?"Half Time":"Match Gallery"}</div></div>
          <span class="badge">${items.length} item${items.length===1?"":"s"}</span>
        </div>
        <div class="gallery-grid">${items.map(item=>mediaItemHtml(item,{admin:isAdmin})).join("")}</div>
      </div>`);
    });
  }
  content.innerHTML=sections.length?sections.join(""):`<div class="gallery-empty"><strong>No media yet</strong><div class="muted">Photos and videos added by the admin will appear here.</div></div>`;
}
function renderAdminGallery(){
  const panel=document.querySelector("#galleryAdminPanel");
  const matchSel=document.querySelector("#galleryUploadMatch");
  const list=document.querySelector("#galleryAdminList");
  if(panel)panel.classList.toggle("admin-hidden",!isAdmin);
  if(!matchSel||!list)return;
  const previous=matchSel.value;
  matchSel.innerHTML=`<option value="GENERAL">📸 General Competition Gallery (all photos)</option>${data.fixtures.map(f=>`<option value="${f.id}">Week ${f.week} • ${teamName(f.home)} vs ${teamName(f.away)}</option>`).join("")}`;
  if(previous==="GENERAL" || data.fixtures.some(f=>f.id===previous))matchSel.value=previous;
  const matchId=matchSel.value || "GENERAL";
  const items=matchId==="GENERAL"?mediaForGeneral():mediaForMatch(matchId);
  list.innerHTML=items.length?items.map(item=>mediaItemHtml(item,{compact:true,admin:true})).join(""):`<div class="muted">No media uploaded for this match.</div>`;
}
function safeFileName(name="file"){
  return name.normalize("NFKD").replace(/[^\w.-]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(-100) || "media";
}

function cloudinaryConfigured(){
  return CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET &&
    !CLOUDINARY_CLOUD_NAME.startsWith("YOUR_") &&
    !CLOUDINARY_UPLOAD_PRESET.startsWith("YOUR_");
}
async function uploadGalleryPhotos(){
  if(!isAdmin)return openLogin();
  if(!cloudinaryConfigured()){
    alert("Direct photo upload needs one-time Cloudinary setup. Open PHOTO_UPLOAD_SETUP.md and enter your Cloud Name and unsigned upload preset in app.js.");
    return;
  }
  const matchId=document.querySelector("#galleryUploadMatch")?.value;
  const files=[...(document.querySelector("#galleryPhotoFiles")?.files||[])];
  const caption=document.querySelector("#galleryPhotoCaption")?.value.trim()||"";
  const progress=document.querySelector("#galleryUploadProgress");
  if(!matchId)return alert("Choose a match first.");
  if(!files.length)return alert("Choose at least one photo.");
  for(const file of files){
    if(!file.type.startsWith("image/"))return alert("Photo upload accepts image files only.");
    if(file.size>10*1024*1024)return alert(`${file.name} is larger than 10 MB.`);
  }
  let done=0;
  try{
    for(const file of files){
      const form=new FormData();
      form.append("file",file);
      form.append("upload_preset",CLOUDINARY_UPLOAD_PRESET);
      const response=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`,{method:"POST",body:form});
      const result=await response.json();
      if(!response.ok)throw new Error(result?.error?.message||"Photo upload failed.");
      await mediaRef.add({
        matchId,competitionId:selectedCompetitionId,mediaType:"image",url:result.secure_url,caption,
        cloudinaryPublicId:result.public_id||"",
        originalName:file.name,createdAtMs:Date.now(),
        createdBy:auth.currentUser?.email||ADMIN_EMAIL
      });
      done++;
      if(progress)progress.textContent=`Uploaded ${done} of ${files.length} photo${files.length===1?"":"s"}.`;
    }
    document.querySelector("#galleryPhotoFiles").value="";
    document.querySelector("#galleryPhotoCaption").value="";
    if(progress)progress.textContent=`${done} photo${done===1?"":"s"} added to the match gallery.`;
  }catch(err){
    console.error(err);
    if(progress)progress.textContent="Upload failed.";
    alert(err.message||"Photo upload failed.");
  }
}

async function addGalleryLink(){
  if(!isAdmin)return openLogin();
  const matchId=document.querySelector("#galleryUploadMatch")?.value;
  const url=document.querySelector("#galleryLinkUrl")?.value.trim();
  const type=document.querySelector("#galleryLinkType")?.value||"video";
  const caption=document.querySelector("#galleryLinkCaption")?.value.trim()||"";
  if(!matchId||!url)return alert("Choose a match and enter a media URL.");
  try{
    new URL(url);
    await mediaRef.add({matchId,competitionId:selectedCompetitionId,mediaType:type,url,caption,storagePath:"",createdAtMs:Date.now(),createdBy:auth.currentUser?.email||ADMIN_EMAIL});
    document.querySelector("#galleryLinkUrl").value="";
    document.querySelector("#galleryLinkCaption").value="";
    document.querySelector("#galleryUploadProgress").textContent="Media link added.";
  }catch(err){alert(err.message||"Unable to add media link.");}
}
async function deleteGalleryMedia(id){
  if(!isAdmin)return openLogin();
  const item=matchMedia.find(m=>m.id===id);
  if(!item){
    alert("This Gallery item could not be found. Refresh the page and try again.");
    return;
  }
  if(!confirm(`Remove this ${item.mediaType==="video"?"video":"photo"} from the match gallery?\n\nThis removes it from the league website. It does not delete the original Cloudinary asset.`))return;
  try{
    document.querySelectorAll(`[data-delete-media="${CSS.escape(String(id))}"]`).forEach(btn=>{btn.disabled=true;btn.textContent="Removing…";});
    await mediaRef.doc(id).delete();
    const progress=document.querySelector("#galleryUploadProgress");
    if(progress)progress.textContent=`${item.mediaType==="video"?"Video":"Photo"} removed from the match gallery.`;
  }catch(err){
    document.querySelectorAll(`[data-delete-media="${CSS.escape(String(id))}"]`).forEach(btn=>{btn.disabled=false;btn.textContent=item.mediaType==="video"?"🗑 Remove Video":"🗑 Remove Photo";});
    alert(err.message||"Unable to remove media.");
  }
}

function currentPlayersOnField(f,teamId){
  const side=teamId===actualFixtureTeamId(f,"home")?"home":teamId===actualFixtureTeamId(f,"away")?"away":"";
  if(!side)return [];
  let ids=[...fixtureLineups(f)[side]];
  substitutionEvents(f.id,teamId).forEach(e=>{
    ids=ids.filter(id=>id!==e.playerOutId);
    if(e.playerInId && !ids.includes(e.playerInId))ids.push(e.playerInId);
  });
  return ids;
}
function renderLineupManager(){
  const f=selectedControlMatch();
  const homeBox=document.querySelector("#homeLineupChoices"), awayBox=document.querySelector("#awayLineupChoices");
  if(!f||!homeBox||!awayBox)return;
  document.querySelector("#homeLineupTitle").textContent=teamName(f.home);
  document.querySelector("#awayLineupTitle").textContent=teamName(f.away);
  const lineups=fixtureLineups(f);
  const make=(teamId,selected)=>{
    const players=data.players.filter(p=>p.active!==false && p.teamId===teamId).sort((a,b)=>a.name.localeCompare(b.name));
    return players.length?players.map(p=>`<label class="lineup-player"><input type="checkbox" data-lineup-player="${p.id}" data-team-id="${teamId}" ${selected.includes(p.id)?"checked":""}> <span>${p.name}${p.captain?" (C)":""}</span></label>`).join(""):`<div class="muted">No active players.</div>`;
  };
  homeBox.innerHTML=make(actualFixtureTeamId(f,"home"),lineups.home);
  awayBox.innerHTML=make(actualFixtureTeamId(f,"away"),lineups.away);
  renderSubstitutionOptions();
}
function renderSubstitutionOptions(){
  const f=selectedControlMatch(); if(!f)return;
  const teamSel=document.querySelector("#subTeam"), outSel=document.querySelector("#subPlayerOut"), inSel=document.querySelector("#subPlayerIn");
  if(!teamSel||!outSel||!inSel)return;
  const currentTeam=teamSel.value;
  const homeId=actualFixtureTeamId(f,"home"), awayId=actualFixtureTeamId(f,"away");
  teamSel.innerHTML=`<option value="${homeId}">${teamName(f.home)}</option><option value="${awayId}">${teamName(f.away)}</option>`;
  if([homeId,awayId].includes(currentTeam))teamSel.value=currentTeam;
  const teamId=teamSel.value;
  const onField=currentPlayersOnField(f,teamId);
  const roster=data.players.filter(p=>p.active!==false && p.teamId===teamId).sort((a,b)=>a.name.localeCompare(b.name));
  outSel.innerHTML=onField.length?`<option value="">Select player going off</option>${onField.map(id=>`<option value="${id}">${playerName(id)}</option>`).join("")}`:`<option value="">Save a lineup first</option>`;
  const bench=roster.filter(p=>!onField.includes(p.id));
  inSel.innerHTML=bench.length?`<option value="">Select player coming on</option>${bench.map(p=>`<option value="${p.id}">${p.name}</option>`).join("")}`:`<option value="">No available substitute</option>`;
  const status=normalizedStatus(f);
  document.querySelector("#recordSubBtn").disabled=!(["live","paused","halftime"].includes(status) && onField.length && bench.length);
}


let upcomingFixtureSlideIndex=0;
let upcomingFixtureTimer=null;
function renderUpcomingFixtureSlide(){
  const el=document.querySelector("#nextFixture");
  if(!el)return;
  const upcoming=window.ISSL_UPCOMING_FIXTURES||[];
  if(!upcoming.length){el.innerHTML=`<div class="muted">All scheduled fixtures completed.</div>`;return;}
  if(upcomingFixtureSlideIndex>=upcoming.length)upcomingFixtureSlideIndex=0;
  const f=upcoming[upcomingFixtureSlideIndex];
  el.innerHTML=`<div class="upcoming-slide">
    <div class="upcoming-count">${upcomingFixtureSlideIndex+1} / ${upcoming.length}</div>
    <div class="upcoming-teams">
      <div>${logoHtml(f.home)}<strong>${teamName(f.home)}</strong></div>
      <div class="upcoming-vs">VS</div>
      <div><strong>${teamName(f.away)}</strong>${logoHtml(f.away)}</div>
    </div>
    <div class="upcoming-meta">Week ${f.week} • ${f.date||""}${f.time?` • ${f.time}`:""}${f.venue?`<br>${f.venue}`:""}</div>
    <div class="upcoming-controls">
      <button type="button" data-upcoming-prev aria-label="Previous fixture">‹</button>
      <div class="upcoming-dots">${upcoming.map((_,i)=>`<span class="${i===upcomingFixtureSlideIndex?"active":""}"></span>`).join("")}</div>
      <button type="button" data-upcoming-next aria-label="Next fixture">›</button>
    </div>
  </div>`;
  if(upcomingFixtureTimer)clearTimeout(upcomingFixtureTimer);
  if(upcoming.length>1)upcomingFixtureTimer=setTimeout(()=>{upcomingFixtureSlideIndex=(upcomingFixtureSlideIndex+1)%upcoming.length;renderUpcomingFixtureSlide();},4500);
}
function moveUpcomingFixture(delta){
  const upcoming=window.ISSL_UPCOMING_FIXTURES||[];
  if(!upcoming.length)return;
  upcomingFixtureSlideIndex=(upcomingFixtureSlideIndex+delta+upcoming.length)%upcoming.length;
  renderUpcomingFixtureSlide();
}
function renderFutureEvents(){
  const el=document.querySelector("#futureEventsList");
  if(!el)return;
  el.innerHTML=FUTURE_EVENTS.map(event=>`<article class="future-event-card">
    <div class="future-event-date">${event.date}</div>
    <div class="future-event-main"><span class="future-event-icon">${event.icon}</span><div><strong>${event.title}</strong>${event.details.length?`<ul>${event.details.map(d=>`<li>${d}</li>`).join("")}</ul>`:""}</div></div>
  </article>`).join("");
}

function render(){
  renderCompetitionUI();
  const st=standings();
  const played=data.fixtures.filter(f=>hasScore(f)&&normalizedStatus(f)==="finished");
  document.querySelector("#kpiMatches").textContent=played.length;
  document.querySelector("#kpiGoals").textContent=played.reduce((n,f)=>n+f.homeScore+f.awayScore,0);
  document.querySelector("#kpiLeader").textContent=st[0]?.team.name||"—";

  const completedResults=[...played].sort((a,b)=>{
    const aTime=Number(a.finishedAtMs||0), bTime=Number(b.finishedAtMs||0);
    if(aTime!==bTime)return bTime-aTime;
    const ai=data.fixtures.findIndex(x=>x.id===a.id), bi=data.fixtures.findIndex(x=>x.id===b.id);
    return bi-ai;
  });
  document.querySelector("#latestResult").innerHTML=completedResults.length?
    `<div class="latest-results-list">${completedResults.map(f=>`
      <div class="latest-result-item">
        <div class="latest-result-meta">Week ${f.week}${f.date?` • ${f.date}`:""}${f.time?` • ${f.time}`:""}</div>
        <div class="result-with-scorers">
          <div class="result-team result-home"><strong>${teamName(f.home)}</strong>${teamScorersHtml(f,f.home,"left")}</div>
          <div class="result-center"><div class="result-score">${Number(f.homeScore)}–${Number(f.awayScore)}</div><span class="badge">Full Time</span></div>
          <div class="result-team result-away"><strong>${teamName(f.away)}</strong>${teamScorersHtml(f,f.away,"right")}</div>
        </div>
      </div>`).join("")}</div>`:
    `No completed matches yet.`;

  const upcoming=data.fixtures.filter(f=>!["finished","live","paused","halftime"].includes(normalizedStatus(f)));
  window.ISSL_UPCOMING_FIXTURES=upcoming;
  renderUpcomingFixtureSlide();

  const scorers=data.players.map(p=>({...p,...statsFor(p.id)})).sort((a,b)=>b.goals-a.goals||b.assists-a.assists);
  const playersWithGoals=scorers.filter(p=>p.goals>0);
  document.querySelector("#topScorers").innerHTML=playersWithGoals.length?playersWithGoals.slice(0,5).map((p,i)=>
    `<div class="player-row profile-clickable" data-player-profile="${p.id}"><span>${i+1}. <strong>${p.name}</strong><div class="muted">${teamName(p.teamId)}</div></span><span><strong>${p.goals}</strong> goal${p.goals===1?"":"s"}</span></div>`).join(""):`<div class="muted">No goals recorded yet.</div>`;

  document.querySelector("#topScorersFull").innerHTML=playersWithGoals.length?playersWithGoals.map((p,i)=>{
    const rankClass=i===0?"gold":i===1?"silver":i===2?"bronze":"";
    return `<div class="scorer-row profile-clickable" data-player-profile="${p.id}"><div class="scorer-rank ${rankClass}">${i+1}</div><div><strong>${p.name}</strong><div class="muted">${logoHtml(p.teamId,p.name)}${teamName(p.teamId)} • ${p.assists} assist${p.assists===1?"":"s"}</div></div><div class="goal-total"><strong class="goal-number">${p.goals}</strong><small>GOALS</small></div></div>`;
  }).join(""):`<div class="muted">No goals have been recorded. Admin can add goals from the Admin tab.</div>`;

  const assists=[...scorers].filter(p=>p.assists>0).sort((a,b)=>b.assists-a.assists||b.goals-a.goals);
  const assistsEl=document.querySelector("#assistsLeaders");if(assistsEl)assistsEl.innerHTML=assists.length?assists.map((p,i)=>`<div class="leader-row profile-clickable" data-player-profile="${p.id}"><strong>${i+1}</strong><span><strong>${p.name}</strong><small class="muted">${teamName(p.teamId)}</small></span><strong>${p.assists}</strong></div>`).join(""):`<div class="muted">No assists recorded yet.</div>`;
  const cards=[...scorers].filter(p=>p.yellow||p.red).sort((a,b)=>(b.red*3+b.yellow)-(a.red*3+a.yellow));
  const cardsEl=document.querySelector("#cardsLeaders");if(cardsEl)cardsEl.innerHTML=cards.length?cards.map((p,i)=>`<div class="leader-row profile-clickable" data-player-profile="${p.id}"><strong>${i+1}</strong><span><strong>${p.name}</strong><small class="muted">${teamName(p.teamId)}</small></span><strong>YC ${p.yellow} • RC ${p.red}</strong></div>`).join(""):`<div class="muted">No cards recorded yet.</div>`;
  const potm=[...scorers].filter(p=>p.potm>0).sort((a,b)=>b.potm-a.potm||b.goals-a.goals);
  const potmEl=document.querySelector("#potmLeaders");if(potmEl)potmEl.innerHTML=potm.length?potm.map((p,i)=>`<div class="leader-row profile-clickable" data-player-profile="${p.id}"><strong>${i+1}</strong><span><strong>${p.name}</strong><small class="muted">${teamName(p.teamId)}</small></span><strong>${p.potm}</strong></div>`).join(""):`<div class="muted">No Player of the Match awards recorded yet.</div>`;

  document.querySelector("#fixtureList").innerHTML=data.fixtures.map(f=>{
    const status=normalizedStatus(f);
    const matchHasScore=hasScore(f);
    const label=status==="live"?"🔴 LIVE":status==="halftime"?"Half Time":status==="paused"?"Paused":status==="finished"?"Full Time":"Scheduled";
    const canOpen=["live","paused","halftime","finished"].includes(status);
    const finalAutoNote=isFinalFixture(f)
      ? `<div class="final-auto-note">${leagueStageComplete()
          ? `🏆 Final: ${teamName("FINAL1")} vs ${teamName("FINAL2")}`
          : "🏆 Final: 1st Place vs 2nd Place • teams fill automatically after league completion"}</div>`
      : "";
    return `<div class="match ${canOpen?"fixture-clickable":""}" ${canOpen?`data-fixture-id="${f.id}"`:""}><div>${logoHtml(f.home)}<strong>${teamName(f.home)}</strong><div class="muted">Week ${f.week}</div></div>
      <div class="score">${matchHasScore?`${Number(f.homeScore)}–${Number(f.awayScore)}`:"VS"}<div class="badge">${label}</div>${canOpen?`<div class="fixture-details-hint">${expandedFixtureId===f.id?"Hide":"View"} match details</div>`:""}</div>
      <div class="team-right"><strong>${teamName(f.away)}</strong>${logoHtml(f.away)}<div class="muted">${f.date||""}${f.time?` • ${f.time}`:""}${f.venue?`<br>${f.venue}`:""}${finalAutoNote}</div></div>
      ${expandedFixtureId===f.id?fixtureDetailsHtml(f):""}</div>`;
  }).join("");

  renderLiveTableNotice();
  renderGallery();
  renderAdminGallery();

  const selectedComp=competitionById(selectedCompetitionId);
  document.querySelector("#standingsBody").innerHTML=st.map((x,i)=>`<tr class="${i===0?"rank1 ":i===1?"rank2 ":i===2?"rank3 ":""}${selectedComp?.type==="league_final"&&i===1?"qualification-row":""}">
    <td>${i+1}</td><td>${logoHtml(x.team.id)}<strong>${x.team.name}</strong>${selectedComp?.type==="league_final"&&i<2?` <span class="status-chip current">Final</span>`:""}</td><td>${x.p}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gf}</td><td>${x.ga}</td><td>${x.gd>0?"+":""}${x.gd}</td><td><strong>${x.pts}</strong></td></tr>`).join("");

  const homeStandingsBody=document.querySelector("#homeStandingsBody");
  if(homeStandingsBody){
    const comp=competitionById(selectedCompetitionId);
    homeStandingsBody.innerHTML=st.map((x,i)=>`<tr class="${comp?.type==="league_final"&&i===1?"qualification-row":""}"><td>${i+1}</td><td>${logoHtml(x.team.id)}<strong>${x.team.name}</strong></td><td>${x.p}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gd>0?"+":""}${x.gd}</td><td><strong>${x.pts}</strong></td></tr>`).join("");
  }
  const homeNoLive=document.querySelector("#homeNoLive");
  if(homeNoLive) homeNoLive.style.display=activeMatch()?"none":"block";

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
          ${(()=>{const d=TEAM_DETAILS[t.id]||{};return `<div class="team-management-info">
            <div><span>Team Owner</span><strong>${d.owner||"—"}</strong></div>
            <div><span>Sponsors</span><strong>${(d.sponsors||[]).join(", ")||"—"}</strong></div>
          </div>`})()}
          <h4>Players & Statistics</h4>
          <ul class="team-player-list">${ps.map(p=>{
            const s=statsFor(p.id);
            return `<li class="team-player-row profile-clickable" data-player-profile="${p.id}">
              <div>
                <div class="team-player-name"><strong>${p.name}</strong>${p.captain?`<span class="captain-tag">Captain</span>`:""}</div>
                <div class="team-player-extra">${p.number?`#${p.number}`:""}${p.number&&p.position?" • ":""}${p.position||""}</div>
              </div>
              <div class="team-player-stats"><strong>G ${s.goals}</strong> • A ${s.assists} • YC ${s.yellow} • RC ${s.red} • POTM ${s.potm}</div>
            </li>`;
          }).join("")}</ul>
          <div class="muted" style="margin-top:8px">Tap a player to view full player details.</div>
        </div>
      </div>
    </article>`;
  }).join("");

  renderAwards(scorers,st);
  fillSelects();
  renderLiveMatch();
  renderControlCenter();
  renderEventManager();
  renderTeamManager();
  renderFixtureManager();
  renderFutureEvents();
  const liveStandingsToggle=document.querySelector("#liveStandingsToggle");
  if(liveStandingsToggle) liveStandingsToggle.checked=data.settings?.liveStandings!==false;
}

function renderAwards(scorers,st){
  const grid=document.querySelector("#awardGrid"); if(!grid)return;
  const active=scorers.filter(p=>p.active!==false);
  const golden=[...active].sort((a,b)=>b.goals-a.goals||b.assists-a.assists)[0];
  const playmaker=[...active].sort((a,b)=>b.assists-a.assists||b.goals-a.goals)[0];
  const mvp=[...active].sort((a,b)=>(b.goals*3+b.assists*2+b.potm*4)-(a.goals*3+a.assists*2+a.potm*4))[0];
  const fair=data.teams.map(t=>{
    const ids=new Set(data.players.filter(p=>p.teamId===t.id).map(p=>p.id));
    const ev=data.events.filter(e=>ids.has(e.playerId));
    const yc=ev.filter(e=>e.type==="Yellow Card").length, rc=ev.filter(e=>e.type==="Red Card").length;
    return {team:t,yc,rc,score:yc+rc*3};
  }).sort((a,b)=>a.score-b.score||a.rc-b.rc||a.yc-b.yc)[0];
  const finished=data.fixtures.filter(f=>normalizedStatus(f)==="finished").length;
  const seasonDone=finished===data.fixtures.length && data.fixtures.length>0;
  const leader=st[0];
  const card=(icon,title,name,meta)=>`<div class="award-card"><div class="award-icon">${icon}</div><div class="award-title">${title}</div><div class="award-name">${name||"—"}</div><div class="award-meta">${meta||"No data yet"}</div></div>`;
  grid.innerHTML=[
    card("🥇","Golden Boot",golden?.goals?golden.name:"—",golden?.goals?`${golden.goals} goal${golden.goals===1?"":"s"}`:"No goals recorded"),
    card("🎯","Playmaker",playmaker?.assists?playmaker.name:"—",playmaker?.assists?`${playmaker.assists} assist${playmaker.assists===1?"":"s"}`:"No assists recorded"),
    card("⭐","MVP Leader",mvp && (mvp.goals||mvp.assists||mvp.potm)?mvp.name:"—",mvp?`G ${mvp.goals} • A ${mvp.assists} • POTM ${mvp.potm}`:"No stats recorded"),
    card("🤝","Fair Play",fair?.team?.name||"—",fair?`${fair.yc} yellow • ${fair.rc} red`:"No cards recorded"),
    card("🏆",seasonDone?"Champion":"Current Leader",leader?.team?.name||"—",leader?`${leader.pts} pts • GD ${leader.gd>0?"+":""}${leader.gd}`:"Season not started"),
    card("🔥","League Activity",`${finished} / ${data.fixtures.length}`,"matches completed")
  ].join("");
}

function profileStatsCards(s){
  return `<div class="player-profile-stats">
    <div class="profile-stat"><strong>${s.goals||0}</strong><span>Goals</span></div>
    <div class="profile-stat"><strong>${s.assists||0}</strong><span>Assists</span></div>
    <div class="profile-stat"><strong>${s.yellow||0}</strong><span>Yellow</span></div>
    <div class="profile-stat"><strong>${s.red||0}</strong><span>Red</span></div>
    <div class="profile-stat"><strong>${s.potm||0}</strong><span>POTM</span></div>
  </div>`;
}
function statsForPlayerInRaw(raw,name){
  const players=Array.isArray(raw?.players)?raw.players:[];
  const normalized=String(name||"").trim().toLowerCase();
  const matches=players.filter(p=>String(p.name||"").trim().toLowerCase()===normalized);
  const ids=new Set(matches.map(p=>p.id));
  const ev=(Array.isArray(raw?.events)?raw.events:[]).filter(e=>ids.has(e.playerId));
  return {goals:ev.filter(x=>x.type==="Goal").length,assists:ev.filter(x=>x.type==="Assist").length,yellow:ev.filter(x=>x.type==="Yellow Card").length,red:ev.filter(x=>x.type==="Red Card").length,potm:ev.filter(x=>x.type==="Player of the Match").length,players:matches};
}
async function playerAggregateFor(name,ids){
  const total={goals:0,assists:0,yellow:0,red:0,potm:0};const history=[];
  for(const id of ids){
    let raw=null;
    if(id===selectedCompetitionId)raw=data;
    else{try{const snap=await competitionDocRef(id).get();if(snap.exists)raw=snap.data();}catch{}}
    if(!raw)continue;
    const st=statsForPlayerInRaw(raw,name);if(!st.players.length)continue;
    for(const k of ["goals","assists","yellow","red","potm"])total[k]+=st[k];
    const teams=(Array.isArray(raw.teams)?raw.teams:[]);const teamNames=[...new Set(st.players.map(p=>teams.find(t=>t.id===p.teamId)?.name).filter(Boolean))];
    history.push({competition:competitionShortLabel(id),teams:teamNames.join(", ")||"—",...st});
  }
  return {total,history};
}
async function loadPlayerProfileScope(name,scope){
  const target=document.querySelector("#playerProfileScopeContent");if(!target)return;
  target.innerHTML=`<div class="muted">Loading ${scope} statistics…</div>`;
  const selected=competitionById(selectedCompetitionId);
  const ids=scope==="season"&&selected?.parentSeason?competitions.filter(c=>c.parentSeason===selected.parentSeason).map(c=>c.id):competitions.map(c=>c.id);
  const result=await playerAggregateFor(name,ids);
  if(!document.querySelector("#playerProfileScopeContent"))return;
  target.innerHTML=`${profileStatsCards(result.total)}<h4 style="margin:14px 0 8px">Competition History</h4>${result.history.length?result.history.map(h=>`<div class="player-row"><span><strong>${h.competition}</strong><div class="muted">${h.teams}</div></span><span class="muted">G ${h.goals} • A ${h.assists} • YC ${h.yellow} • RC ${h.red} • POTM ${h.potm}</span></div>`).join(""):`<div class="muted">No recorded ${scope} history yet.</div>`}`;
}
function openPlayerProfile(playerId){
  const p=data.players.find(x=>x.id===playerId); if(!p)return;
  const s=statsFor(p.id), media=TEAM_MEDIA[p.teamId]||{};
  document.querySelector("#playerProfileTitle").textContent=p.name;
  document.querySelector("#playerProfileContent").innerHTML=`
    <div class="player-profile-head">${media.logo?`<img class="player-profile-logo" src="${encodeURI(media.logo)}" alt="${teamName(p.teamId)} logo">`:""}<div><strong style="font-size:20px">${p.name}</strong><div class="muted">${teamName(p.teamId)}${p.captain?" • Captain":""}${p.number?` • #${p.number}`:""}${p.active===false?" • Former player":""}</div></div></div>
    <div class="stats-tabs profile-scope-tabs"><button class="stats-tab active" type="button" data-profile-scope="competition">This Competition</button><button class="stats-tab" type="button" data-profile-scope="season">This Season</button><button class="stats-tab" type="button" data-profile-scope="career">Career</button></div>
    <div id="playerProfileScopeContent">${profileStatsCards(s)}<div class="muted" style="margin-top:10px">${competitionShortLabel()}${p.position?` • ${p.position}`:""}</div></div>`;
  document.querySelector("#playerProfileModal").dataset.playerName=p.name;
  document.querySelector("#playerProfileModal").classList.add("open");
}
function closePlayerProfile(){document.querySelector("#playerProfileModal")?.classList.remove("open");}

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
function eventIcon(type){return {"Goal":"⚽","Own Goal":"⚽","Assist":"🎯","Yellow Card":"🟨","Red Card":"🟥","Player of the Match":"⭐","Substitution":"🔁"}[type]||"•";}

let pendingGoalTeamId="";
function eventPlayersForMatch(matchId, teamFilterId=""){
  const match=data.fixtures.find(f=>f.id===matchId);
  if(!match)return [];
  const homeId=actualFixtureTeamId(match,"home"), awayId=actualFixtureTeamId(match,"away");
  return data.players
    .filter(p=>p.active!==false && [homeId,awayId].includes(p.teamId) && (!teamFilterId || p.teamId===teamFilterId))
    .sort((a,b)=>a.name.localeCompare(b.name));
}
function refreshEventPlayerOptions(teamFilterId=pendingGoalTeamId){
  const select=document.querySelector("#eventPlayer");
  if(!select)return;
  const current=select.value;
  const matchId=document.querySelector("#eventMatch")?.value || "";
  const players=eventPlayersForMatch(matchId,teamFilterId);
  select.innerHTML=players.length
    ? `<option value="">Select a player</option>${players.map(p=>`<option value="${p.id}">${p.name} — ${teamName(p.teamId)}</option>`).join("")}`
    : `<option value="">No eligible players for this match</option>`;
  if(players.some(p=>p.id===current))select.value=current;
}
function prepareGoalEvent(teamId){
  if(!isAdmin)return openLogin();
  const match=selectedControlMatch();
  if(!match || normalizedStatus(match)!=="live")return alert("Start or resume the match before recording a goal.");
  pendingGoalTeamId=teamId;
  const matchSelect=document.querySelector("#eventMatch");
  const typeSelect=document.querySelector("#eventType");
  if(matchSelect)matchSelect.value=match.id;
  if(typeSelect)typeSelect.value="Goal";
  refreshEventPlayerOptions(teamId);
  const help=document.querySelector("#ownGoalHelp");
  if(help){help.style.display="block";help.innerHTML=`Select the scorer for <strong>${teamName(teamId)}</strong>, then click <strong>Add event</strong>. The live score will increase automatically.`;}
  document.querySelector("#eventForm")?.scrollIntoView({behavior:"smooth",block:"center"});
  setTimeout(()=>document.querySelector("#eventPlayer")?.focus(),350);
}

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
  const targetTeamId=actualFixtureTeamId(f,teamId);
  const goals=goalEventsForTeam(f.id,targetTeamId);
  if(!goals.length)return `<div class="team-scorers-empty">No goals</div>`;
  return `<div class="team-scorers ${align}">${goals.map(e=>{
    const p=data.players.find(x=>x.id===e.playerId);
    return `<div class="team-scorer-line"><span>${p?.name||"Unknown player"}${e.type==="Own Goal"?` <span class="og-tag">OG</span>`:""} <strong>${Number(e.minute||0)}'</strong></span></div>`;
  }).join("")}</div>`;
}

function teamCardsHtml(f,teamId){
  const targetTeamId=actualFixtureTeamId(f,teamId);
  const cards=matchEvents(f.id).filter(e=>{
    if(!["Yellow Card","Red Card"].includes(e.type))return false;
    const p=data.players.find(x=>x.id===e.playerId);
    return (e.teamId || p?.teamId || "")===targetTeamId;
  });
  if(!cards.length)return `<div class="team-cards-empty">No cards</div>`;
  return `<div class="team-card-events">${cards.map(e=>{
    const p=data.players.find(x=>x.id===e.playerId);
    const cls=e.type==="Red Card"?"red-card-detail":"yellow-card-detail";
    return `<div class="team-card-line"><span class="${cls}"></span><span>${p?.name||"Unknown player"} <strong>${Number(e.minute||0)}'</strong></span></div>`;
  }).join("")}</div>`;
}
function completedTeamMatchDetailsHtml(f,teamId,align="left"){
  return `<div class="completed-team-events">
    <div class="completed-event-label">Goals</div>${teamScorersHtml(f,teamId,align)}
    <div class="completed-event-label">Cards</div>${teamCardsHtml(f,teamId)}
  </div>`;
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
    if(e.type==="Substitution")return `<div class="timeline-item"><strong>${e.minute||0}'</strong><span>🔁 Substitution — <span class="sub-out">⬇ ${playerName(e.playerOutId)}</span> / <span class="sub-in">⬆ ${playerName(e.playerInId)}</span></span></div>`;
    return `<div class="timeline-item"><strong>${e.minute||0}'</strong><span>${eventIcon(e.type)} ${e.type}${p?` — ${p.name}${e.type==="Own Goal"?` <span class="og-tag">OG</span>`:""}`:""}</span></div>`;
  }).join(""):`<div class="muted">Live match events will appear here.</div>`;
  const liveLineups=document.querySelector("#liveLineupsContent");
  if(liveLineups){
    liveLineups.innerHTML=`<div class="live-lineup-grid">
      <div class="live-lineup-team"><div class="live-lineup-team-head">${teamLogo(f.home)?`<img class="live-lineup-logo" src="${encodeURI(teamLogo(f.home))}" alt="${teamName(f.home)} logo">`:""}<h4>${teamName(f.home)}</h4></div>${lineupHtml(f,"home")}<h4 style="margin-top:12px">Substitutions</h4>${substitutionsHtml(f,actualFixtureTeamId(f,"home"))}</div>
      <div class="live-lineup-team away"><div class="live-lineup-team-head">${teamLogo(f.away)?`<img class="live-lineup-logo" src="${encodeURI(teamLogo(f.away))}" alt="${teamName(f.away)} logo">`:""}<h4>${teamName(f.away)}</h4></div>${lineupHtml(f,"away")}<h4 style="margin-top:12px">Substitutions</h4>${substitutionsHtml(f,actualFixtureTeamId(f,"away"))}</div>
    </div>`;
    const liveGallery=document.querySelector("#liveGalleryContent");
    if(liveGallery) liveGallery.innerHTML=matchGalleryHtml(f);
    const liveStats=document.querySelector("#liveStatisticsContent");
    if(liveStats){
      const ev=matchEvents(f.id);
      const count=(teamId,type)=>ev.filter(e=>e.teamId===teamId&&e.type===type).length;
      const homeGoals=Number(f.homeScore||0), awayGoals=Number(f.awayScore||0);
      liveStats.innerHTML=`<div class="match-stat-grid">
        <div class="match-stat-team">${teamName(f.home)}</div><div class="match-stat-label">Statistic</div><div class="match-stat-team">${teamName(f.away)}</div>
        <div class="match-stat-value">${homeGoals}</div><div class="match-stat-label">Goals</div><div class="match-stat-value">${awayGoals}</div>
        <div class="match-stat-value">${count(actualFixtureTeamId(f,"home"),"Yellow Card")}</div><div class="match-stat-label">Yellow Cards</div><div class="match-stat-value">${count(actualFixtureTeamId(f,"away"),"Yellow Card")}</div>
        <div class="match-stat-value">${count(actualFixtureTeamId(f,"home"),"Red Card")}</div><div class="match-stat-label">Red Cards</div><div class="match-stat-value">${count(actualFixtureTeamId(f,"away"),"Red Card")}</div>
        <div class="match-stat-value">${count(actualFixtureTeamId(f,"home"),"Substitution")}</div><div class="match-stat-label">Substitutions</div><div class="match-stat-value">${count(actualFixtureTeamId(f,"away"),"Substitution")}</div>
      </div>`;
    }
  }
}
function selectedControlMatch(){const id=document.querySelector("#controlMatch")?.value;return data.fixtures.find(f=>f.id===id)||data.fixtures[0];}
function potmCandidatesForMatch(f){
  if(!f)return [];
  const homeId=actualFixtureTeamId(f,"home"), awayId=actualFixtureTeamId(f,"away");
  const matchPlayerIds=new Set([
    ...(fixtureLineups(f).home||[]),
    ...(fixtureLineups(f).away||[]),
    ...data.events.filter(e=>e.matchId===f.id).flatMap(e=>[e.playerId,e.playerOutId,e.playerInId].filter(Boolean))
  ]);
  if(!matchPlayerIds.size){
    data.players.filter(p=>[homeId,awayId].includes(p.teamId)).forEach(p=>matchPlayerIds.add(p.id));
  }
  const ev=data.events.filter(e=>e.matchId===f.id && e.type!=="Player of the Match");
  const homeWon=Number(f.homeScore)>Number(f.awayScore), awayWon=Number(f.awayScore)>Number(f.homeScore);
  const winnerId=homeWon?homeId:awayWon?awayId:"";
  const scores=new Map();
  matchPlayerIds.forEach(id=>scores.set(id,{score:0,goals:0,assists:0,yellow:0,red:0,ownGoals:0}));
  ev.forEach(e=>{
    const r=scores.get(e.playerId); if(!r)return;
    if(e.type==="Goal"){r.goals++;r.score+=4;}
    else if(e.type==="Assist"){r.assists++;r.score+=2;}
    else if(e.type==="Yellow Card"){r.yellow++;r.score-=1;}
    else if(e.type==="Red Card"){r.red++;r.score-=3;}
    else if(e.type==="Own Goal"){r.ownGoals++;r.score-=2;}
  });
  const existingPotm=data.events.find(e=>e.matchId===f.id&&e.type==="Player of the Match");
  return [...scores.entries()].map(([playerId,r])=>{
    const p=data.players.find(x=>x.id===playerId);
    if(!p)return null;
    if(winnerId && p.teamId===winnerId && (r.goals||r.assists))r.score+=0.5;
    return {...r,playerId,name:p.name,teamId:p.teamId,isCurrentPotm:existingPotm?.playerId===playerId};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||b.goals-a.goals||b.assists-a.assists||a.yellow-b.yellow||a.name.localeCompare(b.name)).slice(0,3);
}
function potmPerformanceText(c){
  const bits=[];
  if(c.goals)bits.push(`${c.goals} Goal${c.goals===1?"":"s"}`);
  if(c.assists)bits.push(`${c.assists} Assist${c.assists===1?"":"s"}`);
  if(c.yellow)bits.push(`${c.yellow} YC`);
  if(c.red)bits.push(`${c.red} RC`);
  if(c.ownGoals)bits.push(`${c.ownGoals} OG`);
  return bits.length?bits.join(" • "):"No scoring events recorded";
}
function renderPotmRecommendation(f){
  const card=document.querySelector("#potmRecommendationCard"), list=document.querySelector("#potmRecommendationList");
  if(!card||!list)return;
  if(!f||normalizedStatus(f)!=="finished"){card.style.display="none";list.innerHTML="";return;}
  card.style.display="block";
  const existing=data.events.find(e=>e.matchId===f.id&&e.type==="Player of the Match");
  const candidates=potmCandidatesForMatch(f);
  if(!candidates.length){list.innerHTML='<div class="muted">No eligible players found for this match.</div>';return;}
  list.innerHTML=candidates.map((c,i)=>`<div class="potm-recommendation-row">
    <div class="potm-recommendation-main"><strong>${i===0?"Recommended: ":""}${c.name}${c.isCurrentPotm?' <span class="badge">Selected POTM</span>':""}</strong><small class="muted">${teamName(c.teamId)} • ${potmPerformanceText(c)}${i===0?" • Highest performance score":""}</small></div>
    <div class="potm-recommendation-actions"><button class="btn ${c.isCurrentPotm?"secondary":"success"}" type="button" data-select-potm="${c.playerId}" ${c.isCurrentPotm?"disabled":""}>${c.isCurrentPotm?"Selected":"Select as POTM"}</button></div>
  </div>`).join("") + (existing?'<div class="muted" style="margin-top:8px">Selecting another player replaces the current POTM for this match.</div>':'');
}
async function selectRecommendedPotm(playerId){
  if(!isAdmin)return openLogin();
  const f=selectedControlMatch(); if(!f||normalizedStatus(f)!=="finished")return alert("POTM can be selected after the match is completed.");
  const player=data.players.find(p=>p.id===playerId); if(!player)return alert("Player not found.");
  const homeId=actualFixtureTeamId(f,"home"),awayId=actualFixtureTeamId(f,"away");
  if(![homeId,awayId].includes(player.teamId))return alert("This player is not eligible for this match.");
  data.events=data.events.filter(e=>!(e.matchId===f.id&&e.type==="Player of the Match"));
  data.events.push({id:"E"+Date.now(),matchId:f.id,playerId:player.id,teamId:player.teamId,type:"Player of the Match",minute:Math.floor(Number(f.elapsedSeconds||0)/60),createdAtMs:Date.now()});
  try{await save();flash();render();}catch(err){alert(err.message);}
}
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
  document.querySelector("#resetCompletedMatchBtn").disabled=status!=="finished";
  document.querySelector("#homeGoalBtn").disabled=status!=="live";
  document.querySelector("#awayGoalBtn").disabled=status!=="live";
  renderPotmRecommendation(f);
  renderLineupManager();
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
  if(e.type==="Substitution")return `${Number(e.minute||0)}' • 🔁 Substitution • ${playerName(e.playerOutId)} → ${playerName(e.playerInId)}`;
  const p=data.players.find(x=>x.id===e.playerId);
  return `${Number(e.minute||0)}' • ${eventIcon(e.type)} ${e.type} • ${p?.name||"Unknown player"}`;
}
function selectedManagedEvent(){
  const id=document.querySelector("#manageEventEntry")?.value;
  return data.events.find(e=>String(e.id)===String(id));
}
function playerTeamForMatch(player, match, existingEvent=null){
  if(!player||!match)return "";
  const ids=[actualFixtureTeamId(match,"home"),actualFixtureTeamId(match,"away")];
  if(ids.includes(player.teamId))return player.teamId;
  if(ids.includes(player.previousTeamId))return player.previousTeamId;
  if(existingEvent && String(existingEvent.playerId)===String(player.id) && ids.includes(existingEvent.teamId))return existingEvent.teamId;
  return "";
}
function adjustScoreForEvent(event, direction){
  if(!event || !["Goal","Own Goal"].includes(event.type))return;
  const match=data.fixtures.find(f=>f.id===event.matchId);
  if(!match)return;
  const scoringTeamId=eventScoringTeamId(event,match);
  const delta=direction>=0?1:-1;
  if(scoringTeamId===actualFixtureTeamId(match,"home"))match.homeScore=Math.max(0,Number(match.homeScore||0)+delta);
  else if(scoringTeamId===actualFixtureTeamId(match,"away"))match.awayScore=Math.max(0,Number(match.awayScore||0)+delta);
}
function renderEventManager(){
  const matchSelect=document.querySelector("#manageEventMatch");
  const eventSelect=document.querySelector("#manageEventEntry");
  const details=document.querySelector("#manageEventDetails");
  const list=document.querySelector("#manageEventList");
  const removeBtn=document.querySelector("#removeSelectedEventBtn");
  const editPanel=document.querySelector("#editEventPanel");
  const editPlayer=document.querySelector("#editEventPlayer");
  const editType=document.querySelector("#editEventType");
  const editMinute=document.querySelector("#editEventMinute");
  const saveEditBtn=document.querySelector("#saveEventChangesBtn");
  if(!matchSelect||!eventSelect||!details||!list||!removeBtn||!editPanel||!editPlayer||!editType||!editMinute||!saveEditBtn)return;

  const matchId=managedEventMatchId();
  const match=data.fixtures.find(f=>f.id===matchId);
  const events=matchEvents(matchId);
  const previous=eventSelect.value;
  eventSelect.innerHTML=events.length
    ? `<option value="">Select an event</option>${events.map(e=>`<option value="${e.id}">${eventDisplayText(e)}</option>`).join("")}`
    : `<option value="">No recorded events for this match</option>`;
  if(events.some(e=>String(e.id)===String(previous)))eventSelect.value=previous;

  const chosen=selectedManagedEvent();
  if(chosen && match){
    const p=data.players.find(x=>x.id===chosen.playerId);
    if(chosen.type==="Substitution") {
      details.innerHTML=`<strong>🔁 Substitution</strong><br>${teamName(chosen.teamId)} • ${Number(chosen.minute||0)}'<br><span class="sub-out">⬇ ${playerName(chosen.playerOutId)}</span> &nbsp; <span class="sub-in">⬆ ${playerName(chosen.playerInId)}</span>`;
      editPanel.style.display="none";
      removeBtn.disabled=false;
      saveEditBtn.disabled=true;
    } else {
      const eligiblePlayers=data.players.filter(player=>{
        if(String(player.id)===String(chosen.playerId))return true;
        return Boolean(playerTeamForMatch(player,match));
      }).sort((a,b)=>a.name.localeCompare(b.name));
      editPlayer.innerHTML=eligiblePlayers.map(player=>{
        const matchTeam=playerTeamForMatch(player,match,chosen);
        return `<option value="${player.id}">${player.name} — ${teamName(matchTeam||player.teamId)}</option>`;
      }).join("");
      editPlayer.value=chosen.playerId;
      editType.value=chosen.type;
      editMinute.value=Number(chosen.minute||0);
      details.innerHTML=`<strong>${eventIcon(chosen.type)} ${chosen.type}</strong><br>${p?.name||"Unknown player"} • ${teamName(chosen.teamId||p?.teamId)} • ${Number(chosen.minute||0)}'`;
      editPanel.style.display="block";
      removeBtn.disabled=false;
      saveEditBtn.disabled=false;
    }
  }else{
    details.textContent=events.length?"Select an event from the dropdown above.":"No events have been recorded for this match.";
    editPanel.style.display="none";
    removeBtn.disabled=true;
    saveEditBtn.disabled=true;
  }

  list.innerHTML=events.length?events.map(e=>{
    const p=data.players.find(x=>x.id===e.playerId);
    const desc=e.type==="Substitution"
      ? `<span class="sub-out">⬇ ${playerName(e.playerOutId)}</span> / <span class="sub-in">⬆ ${playerName(e.playerInId)}</span> • ${teamName(e.teamId)}`
      : `${p?.name||"Unknown player"}${e.type==="Own Goal"?` <span class="og-tag">OG</span>`:""} • ${teamName(e.teamId||p?.teamId)}`;
    return `<div class="managed-event">
      <div class="managed-event-minute">${Number(e.minute||0)}'</div>
      <div><div class="managed-event-type">${eventIcon(e.type)} ${e.type}</div><div class="muted">${desc}</div></div>
      <button class="delete-event-btn" type="button" data-event-id="${e.id}">Remove</button>
    </div>`;
  }).join(""):`<div class="muted" style="padding:10px 0">No events recorded for this match.</div>`;
}
async function saveEventChanges(){
  if(!isAdmin)return openLogin();
  const event=selectedManagedEvent();
  if(!event)return alert("Select an event to edit.");
  const match=data.fixtures.find(f=>f.id===event.matchId);
  const player=data.players.find(p=>String(p.id)===String(document.querySelector("#editEventPlayer")?.value));
  const type=document.querySelector("#editEventType")?.value;
  const minute=Number(document.querySelector("#editEventMinute")?.value||0);
  if(!match||!player)return alert("Select a valid player and match.");
  const eventTeamId=playerTeamForMatch(player,match,event);
  if(!eventTeamId)return alert("The selected player is not associated with either team in this match.");

  const oldSnapshot={...event};
  adjustScoreForEvent(oldSnapshot,-1);
  event.playerId=player.id;
  event.teamId=eventTeamId;
  event.type=type;
  event.minute=minute;
  event.updatedAtMs=Date.now();
  adjustScoreForEvent(event,1);

  try{
    await save();
    flash();
    render();
    const selector=document.querySelector("#manageEventEntry");
    if(selector)selector.value=event.id;
    renderEventManager();
  }catch(err){
    adjustScoreForEvent(event,-1);
    Object.assign(event,oldSnapshot);
    adjustScoreForEvent(event,1);
    alert(err.message);
  }
}

async function removeEvent(eventId){
  if(!isAdmin)return openLogin();
  const event=data.events.find(e=>String(e.id)===String(eventId));
  if(!event)return alert("The selected event could not be found. Refresh the page and try again.");
  const p=data.players.find(x=>x.id===event.playerId);
  const description=event.type==="Substitution"
    ? `Substitution (${playerName(event.playerOutId)} → ${playerName(event.playerInId)}) at ${Number(event.minute||0)}'`
    : `${event.type}${p?` for ${p.name}`:""} at ${Number(event.minute||0)}'`;
  if(!confirm(`Remove ${description}?`))return;
  adjustScoreForEvent(event,-1);
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
  const editFields=document.querySelector("#editPlayerFields");
  const applyBtn=document.querySelector("#applyPlayerManagementBtn");
  const summary=document.querySelector("#managePlayerSummary");
  if(!teamSelect||!playerSelect||!actionSelect||!destinationSelect||!destinationLabel||!existingFields||!addFields||!editFields||!applyBtn||!summary)return;
  const teamId=selectedManagedTeamId();
  const players=activePlayersForTeam(teamId);
  const previousPlayer=playerSelect.value;
  playerSelect.innerHTML=players.length
    ? `<option value="">Select a player</option>${players.map(p=>`<option value="${p.id}">${p.name}${p.captain?" (Captain)":""}</option>`).join("")}`
    : `<option value="">No active players on this team</option>`;
  if(players.some(p=>String(p.id)===String(previousPlayer)))playerSelect.value=previousPlayer;
  const action=actionSelect.value || "add";
  const adding=action==="add";
  const editing=action==="edit";
  existingFields.style.display=adding?"none":"grid";
  addFields.style.display=adding?"block":"none";
  editFields.style.display=editing?"block":"none";
  const isTransfer=action==="transfer";
  destinationLabel.style.display=isTransfer?"block":"none";
  const previousDestination=destinationSelect.value;
  const destinations=data.teams.filter(t=>t.id!==teamId);
  destinationSelect.innerHTML=destinations.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  if(destinations.some(t=>t.id===previousDestination))destinationSelect.value=previousDestination;
  const labels={add:"Add player",edit:"Save player changes",remove:"Remove selected player",transfer:"Transfer selected player",captain:"Make selected player captain"};
  applyBtn.textContent=labels[action]||"Apply change";
  const player=selectedManagedPlayer();
  applyBtn.disabled=!adding && !player;
  if(adding){summary.textContent=`Add a new player to ${teamName(teamId)} for ${competitionShortLabel()}.`;return;}
  if(editing && player){
    document.querySelector("#manageEditPlayerName").value=player.name||"";
    document.querySelector("#manageEditPlayerNumber").value=player.number||"";
    document.querySelector("#manageEditPlayerPosition").value=player.position||"";
    summary.textContent=`Edit ${player.name}'s competition roster details.`;return;
  }
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
    if(action==="edit"){
      const name=document.querySelector("#manageEditPlayerName")?.value.trim();if(!name)return alert("Enter the player's name.");
      player.name=name;player.number=document.querySelector("#manageEditPlayerNumber")?.value||"";player.position=document.querySelector("#manageEditPlayerPosition")?.value.trim()||"";player.updatedAtMs=Date.now();
      try{render();await save();flash();}catch(err){alert(err.message);}return;
    }

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


function openCompetitionSwitcher(){document.querySelector("#competitionSwitcherModal")?.classList.add("open");renderCompetitionUI();}
function closeCompetitionSwitcher(){document.querySelector("#competitionSwitcherModal")?.classList.remove("open");}
async function persistCompetitionConfig(){
  if(!isAdmin)throw new Error("Admin login required.");
  await leagueConfigRef.set({competitions:structuredClone(competitions),currentCompetitionId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
}
async function initializeSelectedCompetition(){
  if(!isAdmin)return openLogin();
  const id=document.querySelector("#adminCompetitionSelect")?.value||selectedCompetitionId;
  const c=competitionById(id);if(!c)return;
  const ref=competitionDocRef(id);const snap=await ref.get();
  if(snap.exists){alert(`${c.name} already has a data document. Nothing was overwritten.`);return;}
  if(!confirm(`Initialize ${c.fullName||c.name}?\n\nThis creates an empty competition with the three team identities. Rosters, fixtures, events and stats start empty.`))return;
  await ref.set({...emptyCompetitionData(),competitionId:id,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
  document.querySelector("#competitionAdminStatus").textContent=`${c.name} initialized. You can now build its roster and fixtures.`;
  if(id===selectedCompetitionId)startLiveData();
}
async function saveSelectedCompetitionStatus(){
  if(!isAdmin)return openLogin();
  const id=document.querySelector("#adminCompetitionSelect")?.value||selectedCompetitionId;
  const status=document.querySelector("#adminCompetitionStatus")?.value||"upcoming";
  const c=competitions.find(x=>x.id===id);if(!c)return;
  if(id===currentCompetitionId && status!=="current")return alert("Set another competition as Current before changing this competition to another status.");
  c.status=status;
  if(status==="current"){
    currentCompetitionId=id;
    competitions.forEach(x=>{if(x.id!==id&&x.status==="current")x.status="upcoming";});
  }else if(currentCompetitionId===id){
    currentCompetitionId=competitions.find(x=>x.id!==id&&x.status==="current")?.id||currentCompetitionId;
  }
  await persistCompetitionConfig();renderCompetitionUI();
  document.querySelector("#competitionAdminStatus").textContent=`${c.name} status saved as ${status}.`;
}
async function setSelectedCompetitionCurrent(){
  if(!isAdmin)return openLogin();
  const id=document.querySelector("#adminCompetitionSelect")?.value||selectedCompetitionId;
  currentCompetitionId=id;
  competitions.forEach(c=>{if(c.id===id)c.status="current";else if(c.status==="current")c.status="upcoming";});
  await persistCompetitionConfig();renderCompetitionUI();
  document.querySelector("#competitionAdminStatus").textContent=`${competitionById(id)?.name||id} is now the default current competition.`;
}


function fixtureDateObject(value=""){
  const m=String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(m){const d=new Date(Number(m[3]),Number(m[1])-1,Number(m[2]));return Number.isNaN(d.getTime())?null:d;}
  const iso=String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(iso){const d=new Date(Number(iso[1]),Number(iso[2])-1,Number(iso[3]));return Number.isNaN(d.getTime())?null:d;}
  return null;
}
function friendlyCompetitionDate(d){
  return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(d);
}
async function syncCompetitionDatesFromFixtures(){
  const c=competitions.find(x=>x.id===selectedCompetitionId);if(!c||selectedCompetitionId==="S1_LEAGUE")return;
  const dates=(data.fixtures||[]).map(f=>fixtureDateObject(f.date)).filter(Boolean).sort((a,b)=>a-b);
  const start=dates.length?friendlyCompetitionDate(dates[0]):"TBD";
  const end=dates.length?friendlyCompetitionDate(dates[dates.length-1]):"TBD";
  if(c.startDate===start && c.endDate===end)return;
  c.startDate=start;c.endDate=end;
  await persistCompetitionConfig();
  renderCompetitionUI();
}
function competitionFormatForType(type){
  return ({league:"League",league_final:"League + Final",super_cup:"Super Cup",special:"Special / Other"})[type]||"Competition";
}
function competitionSlug(name){
  const base=String(name||"COMPETITION").toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,30)||"COMPETITION";
  let id=base;let n=2;while(competitionById(id)){id=`${base}_${n++}`;}return id;
}
async function createCompetitionFromAdmin(){
  if(!isAdmin)return openLogin();
  const name=document.querySelector("#newCompetitionName")?.value.trim();if(!name)return alert("Enter a competition name.");
  const group=document.querySelector("#newCompetitionGroup")?.value.trim()||"Other Tournaments";
  const type=document.querySelector("#newCompetitionType")?.value||"special";
  const icon=document.querySelector("#newCompetitionIcon")?.value.trim()||"🏆";
  const id=competitionSlug(name);
  const c={id,group,parentSeason:group.toLowerCase().startsWith("season ")?group.replace(/\s*\(.*/,""):"",name,fullName:name,icon,type,status:"upcoming",startDate:"TBD",endDate:"TBD",format:competitionFormatForType(type),description:type==="league_final"?"League stage followed by a Final between the top two teams.":`${competitionFormatForType(type)} competition.`};
  if(!confirm(`Create ${name}?\n\nAn empty competition will be created with the three team identities. You can then add players and fixtures from Admin.`))return;
  competitions.push(c);
  await persistCompetitionConfig();
  await competitionDocRef(id).set({...emptyCompetitionData(),competitionId:id,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
  document.querySelector("#newCompetitionName").value="";
  selectedCompetitionId=id;leagueRef=competitionDocRef(id);
  renderCompetitionUI();startLiveData();renderGallery();renderAdminGallery();
  document.querySelector("#competitionAdminStatus").textContent=`${name} created. Add its players and fixtures below.`;
}
async function deleteCompetitionFromAdmin(){
  if(!isAdmin)return openLogin();
  const id=document.querySelector("#adminCompetitionSelect")?.value||selectedCompetitionId;
  const c=competitionById(id);if(!c)return;
  if(id==="S1_LEAGUE")return alert("Season 1 League is protected and cannot be deleted.");
  if(id===currentCompetitionId)return alert("This is the current competition. Set another competition as Current before deleting it.");
  let raw=null;try{const snap=await competitionDocRef(id).get();if(snap.exists)raw=snap.data();}catch{}
  const fixtures=Array.isArray(raw?.fixtures)?raw.fixtures:[];
  const events=Array.isArray(raw?.events)?raw.events:[];
  const hasPlayed=fixtures.some(f=>["finished","completed","live","paused","halftime"].includes(String(f.status||"").toLowerCase()))||events.length>0;
  if(hasPlayed)return alert("This competition already contains played-match data or recorded events. Mark it Completed or Cancelled instead of deleting its history.");
  const typed=prompt(`Permanent delete: type the competition name exactly to confirm.\n\n${c.name}`);
  if(typed!==c.name)return alert("Competition was not deleted.");
  try{
    const mediaSnap=await mediaRef.where("competitionId","==",id).get();
    const batch=db.batch();mediaSnap.docs.forEach(doc=>batch.delete(doc.ref));batch.delete(competitionDocRef(id));await batch.commit();
    competitions=competitions.filter(x=>x.id!==id);
    await persistCompetitionConfig();
    if(selectedCompetitionId===id){selectedCompetitionId=currentCompetitionId;leagueRef=competitionDocRef(selectedCompetitionId);startLiveData();}
    renderCompetitionUI();filterMediaForSelectedCompetition();renderGallery();renderAdminGallery();
    document.querySelector("#competitionAdminStatus").textContent=`${c.name} deleted. Cloudinary originals, if any, are not deleted from Cloudinary.`;
  }catch(err){alert(`Unable to delete competition: ${err.message}`);}
}

function toDateInputValue(value=""){
  const m=String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(m)return `${m[3]}-${String(m[1]).padStart(2,"0")}-${String(m[2]).padStart(2,"0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value))?String(value):"";
}
function fromDateInputValue(value=""){
  const m=String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?`${m[2]}/${m[3]}/${m[1]}`:value;
}
function toTimeInputValue(value=""){
  const m=String(value).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if(!m)return /^\d{2}:\d{2}$/.test(String(value))?String(value):"";
  let h=Number(m[1]);const ampm=m[3].toUpperCase();if(ampm==="PM"&&h<12)h+=12;if(ampm==="AM"&&h===12)h=0;return `${String(h).padStart(2,"0")}:${m[2]}`;
}
function fromTimeInputValue(value=""){
  const m=String(value).match(/^(\d{2}):(\d{2})$/);if(!m)return value;let h=Number(m[1]);const ap=h>=12?"PM":"AM";h=h%12||12;return `${h}:${m[2]} ${ap}`;
}
function renderFixtureManager(){
  const sel=document.querySelector("#fixtureManageSelect"),home=document.querySelector("#fixtureManageHome"),away=document.querySelector("#fixtureManageAway");
  if(!sel||!home||!away)return;
  const previous=sel.value||"NEW";
  sel.innerHTML=`<option value="NEW">+ New fixture</option>${data.fixtures.map(f=>`<option value="${f.id}">${isFinalFixture(f)?"Final":`Week ${f.week}`} • ${teamName(f.home)} vs ${teamName(f.away)}</option>`).join("")}`;
  sel.value=data.fixtures.some(f=>f.id===previous)?previous:"NEW";
  const comp=competitionById(selectedCompetitionId);
  const teamOptions=data.teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  const finalHome=comp?.type==="league_final"?`<option value="FINAL1">1st Place (Final)</option>`:"";
  const finalAway=comp?.type==="league_final"?`<option value="FINAL2">2nd Place (Final)</option>`:"";
  home.innerHTML=teamOptions+finalHome;away.innerHTML=teamOptions+finalAway;
  loadFixtureManagerFields();
}
function loadFixtureManagerFields(){
  const id=document.querySelector("#fixtureManageSelect")?.value;const f=data.fixtures.find(x=>x.id===id);
  const home=document.querySelector("#fixtureManageHome"),away=document.querySelector("#fixtureManageAway");
  if(!home||!away)return;
  if(f){
    document.querySelector("#fixtureManageWeek").value=f.week||1;home.value=f.home;away.value=f.away;
    document.querySelector("#fixtureManageDate").value=toDateInputValue(f.date||"");document.querySelector("#fixtureManageTime").value=toTimeInputValue(f.time||"");document.querySelector("#fixtureManageVenue").value=f.venue||"";
  }else{
    document.querySelector("#fixtureManageWeek").value=Math.max(1,...data.fixtures.map(x=>Number(x.week||0)))+1;document.querySelector("#fixtureManageDate").value="";document.querySelector("#fixtureManageTime").value="";document.querySelector("#fixtureManageVenue").value="De Anza High School";
    if(home.options.length)home.selectedIndex=0;if(away.options.length)away.selectedIndex=Math.min(1,away.options.length-1);
  }
}
async function saveManagedFixture(){
  if(!isAdmin)return openLogin();
  const select=document.querySelector("#fixtureManageSelect"),existingId=select?.value;
  const home=document.querySelector("#fixtureManageHome")?.value,away=document.querySelector("#fixtureManageAway")?.value;
  if(!home||!away||home===away)return alert("Choose two different teams.");
  const isFinal=home==="FINAL1"||away==="FINAL2";
  if(isFinal && !(home==="FINAL1"&&away==="FINAL2"))return alert("For the Final, select 1st Place as home and 2nd Place as away.");
  const payload={week:Number(document.querySelector("#fixtureManageWeek")?.value||1),home,away,date:fromDateInputValue(document.querySelector("#fixtureManageDate")?.value||""),time:fromTimeInputValue(document.querySelector("#fixtureManageTime")?.value||""),venue:document.querySelector("#fixtureManageVenue")?.value.trim()||"",homeScore:null,awayScore:null,status:"scheduled",isFinal};
  if(existingId&&existingId!=="NEW"){const i=data.fixtures.findIndex(f=>f.id===existingId);if(i>=0)data.fixtures[i]={...data.fixtures[i],...payload};}
  else{payload.id=`${isFinal?"FINAL":"M"}-${Date.now()}`;data.fixtures.push(payload);}
  await save();await syncCompetitionDatesFromFixtures();render();flash();
}
async function deleteManagedFixture(){
  if(!isAdmin)return openLogin();const id=document.querySelector("#fixtureManageSelect")?.value;if(!id||id==="NEW")return alert("Choose a fixture to delete.");
  const f=data.fixtures.find(x=>x.id===id);if(!f)return;
  const status=normalizedStatus(f),hasEvents=data.events.some(e=>e.matchId===id);
  if(status!=="scheduled"||hasEvents)return alert("This fixture already has match activity. Reset/clear the match data first instead of deleting recorded history.");
  if(!confirm(`Delete ${teamName(f.home)} vs ${teamName(f.away)} from ${competitionShortLabel()}?`))return;
  data.fixtures=data.fixtures.filter(x=>x.id!==id);await save();await syncCompetitionDatesFromFixtures();render();flash();
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
  refreshEventPlayerOptions();
}
document.querySelector("#tabs").addEventListener("click",e=>{
  const btn=e.target.closest("[data-tab]");
  if(!btn)return;
  if(btn.dataset.tab==="admin"&&!isAdmin){openLogin();return;}
  activateTab(btn.dataset.tab);
});
document.addEventListener("click",e=>{
  const open=e.target.closest("[data-open-tab]");
  if(open){const tab=open.dataset.openTab;if(tab==="admin"&&!isAdmin)return openLogin();activateTab(tab);return;}
  const comp=e.target.closest("[data-competition-id]");
  if(comp){switchCompetition(comp.dataset.competitionId);renderCompetitionUI();return;}
  const sw=e.target.closest("[data-switch-competition]");
  if(sw){switchCompetition(sw.dataset.switchCompetition,{openHome:true});closeCompetitionSwitcher();return;}
  if(e.target.closest("[data-view-selected-competition]")){activateTab("home");return;}
});
document.querySelector("#competitionSwitcherBtn")?.addEventListener("click",openCompetitionSwitcher);
document.querySelector("#closeCompetitionSwitcher")?.addEventListener("click",closeCompetitionSwitcher);
document.querySelector("#competitionSwitcherModal")?.addEventListener("click",e=>{if(e.target.id==="competitionSwitcherModal")closeCompetitionSwitcher();});
document.querySelector("#moreAdminBtn")?.addEventListener("click",()=>{if(!isAdmin)openLogin();else activateTab("admin");});
document.querySelectorAll(".stats-tab[data-stats-panel]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".stats-tab[data-stats-panel]").forEach(b=>b.classList.toggle("active",b===btn));document.querySelectorAll(".stats-panel").forEach(p=>p.classList.toggle("active",p.dataset.statsContent===btn.dataset.statsPanel));}));
document.querySelector("#adminCompetitionSelect")?.addEventListener("change",e=>{const c=competitionById(e.target.value);const st=document.querySelector("#adminCompetitionStatus");if(st)st.value=competitionStatus(c);});
document.querySelector("#switchAdminCompetitionBtn")?.addEventListener("click",()=>{const id=document.querySelector("#adminCompetitionSelect")?.value;if(id)switchCompetition(id);});
document.querySelector("#initializeCompetitionBtn")?.addEventListener("click",()=>initializeSelectedCompetition().catch(err=>alert(err.message)));
document.querySelector("#deleteCompetitionBtn")?.addEventListener("click",()=>deleteCompetitionFromAdmin().catch(err=>alert(err.message)));
document.querySelector("#createCompetitionForm")?.addEventListener("submit",e=>{e.preventDefault();createCompetitionFromAdmin().catch(err=>alert(err.message));});
document.querySelector("#saveCompetitionStatusBtn")?.addEventListener("click",()=>saveSelectedCompetitionStatus().catch(err=>alert(err.message)));
document.querySelector("#setCurrentCompetitionBtn")?.addEventListener("click",()=>setSelectedCompetitionCurrent().catch(err=>alert(err.message)));
document.querySelector("#fixtureManageSelect")?.addEventListener("change",loadFixtureManagerFields);
document.querySelector("#fixtureManagementForm")?.addEventListener("submit",e=>{e.preventDefault();saveManagedFixture().catch(err=>alert(err.message));});
document.querySelector("#deleteManagedFixtureBtn")?.addEventListener("click",()=>deleteManagedFixture().catch(err=>alert(err.message)));
document.querySelector("#resultForm").addEventListener("submit",async e=>{
  e.preventDefault(); if(!isAdmin)return openLogin(); const f=data.fixtures.find(x=>x.id===document.querySelector("#resultMatch").value);
  f.homeScore=Number(document.querySelector("#homeScore").value); f.awayScore=Number(document.querySelector("#awayScore").value); f.status="finished"; f.startedAtMs=null; f.finishedAtMs=Date.now();
  try{await save();flash();e.target.reset();}catch(err){alert(err.message);}
});
document.querySelector("#eventMatch").addEventListener("change",()=>{
  pendingGoalTeamId="";
  refreshEventPlayerOptions("");
});
document.querySelector("#eventType").addEventListener("change",e=>{
  if(e.target.value!=="Goal")pendingGoalTeamId="";
  refreshEventPlayerOptions();
  const help=document.querySelector("#ownGoalHelp");
  if(!help)return;
  if(e.target.value==="Own Goal"){
    help.style.display="block";
    help.textContent="For an own goal, choose the player who scored against their own team. The opposing team's live score will increase automatically.";
  }else if(e.target.value==="Goal"){
    help.style.display=pendingGoalTeamId?"block":"none";
    if(pendingGoalTeamId)help.innerHTML=`Select the scorer for <strong>${teamName(pendingGoalTeamId)}</strong>, then click <strong>Add event</strong>. The live score will increase automatically.`;
  }else help.style.display="none";
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
  if(!eventMatch)return alert("Select a valid match.");
  const playerTeamId=selectedPlayer?.teamId||"";
  const eventHomeId=actualFixtureTeamId(eventMatch,"home"), eventAwayId=actualFixtureTeamId(eventMatch,"away");
  if(![eventHomeId,eventAwayId].includes(playerTeamId))return alert("The selected player is not on either team in this match.");
  if(eventType==="Goal" && pendingGoalTeamId && playerTeamId!==pendingGoalTeamId)return alert(`Select a scorer from ${teamName(pendingGoalTeamId)}.`);
  const newEvent={id:"E"+Date.now(),matchId,playerId:document.querySelector("#eventPlayer").value,teamId:playerTeamId,
    type:eventType,minute:minuteInput===""?autoMinute:Number(minuteInput),createdAtMs:Date.now()};
  data.events.push(newEvent);
  if(eventType==="Goal"){
    if(playerTeamId===eventHomeId)eventMatch.homeScore=Number(eventMatch.homeScore||0)+1;
    else if(playerTeamId===eventAwayId)eventMatch.awayScore=Number(eventMatch.awayScore||0)+1;
  }else if(eventType==="Own Goal"){
    if(playerTeamId===eventHomeId)eventMatch.awayScore=Number(eventMatch.awayScore||0)+1;
    else if(playerTeamId===eventAwayId)eventMatch.homeScore=Number(eventMatch.homeScore||0)+1;
  }
  try{
    await save();flash();e.target.reset();pendingGoalTeamId="";fillSelects();
    const help=document.querySelector("#ownGoalHelp");if(help)help.style.display="none";
  }catch(err){alert(err.message);}
});

document.querySelector("#manageEventMatch").addEventListener("change",renderEventManager);
document.querySelector("#manageEventEntry").addEventListener("change",renderEventManager);
document.querySelector("#saveEventChangesBtn").addEventListener("click",saveEventChanges);
document.querySelector("#removeSelectedEventBtn").addEventListener("click",()=>{
  const event=selectedManagedEvent();
  if(event)removeEvent(event.id);
});
document.querySelector("#manageEventList").addEventListener("click",e=>{
  const btn=e.target.closest("[data-event-id]");
  if(btn)removeEvent(btn.dataset.eventId);
});

document.querySelector("#potmRecommendationList")?.addEventListener("click",e=>{
  const btn=e.target.closest("[data-select-potm]");
  if(btn)selectRecommendedPotm(btn.dataset.selectPotm);
});


document.querySelector("#managePlayerTeam").addEventListener("change",renderTeamManager);
document.querySelector("#managePlayerSelect").addEventListener("change",renderTeamManager);
document.querySelector("#managePlayerAction").addEventListener("change",renderTeamManager);
document.querySelector("#transferPlayerTeam").addEventListener("change",renderTeamManager);
document.querySelector("#teamManagementForm").addEventListener("submit",async e=>{
  e.preventDefault();
  await applyPlayerManagement();
});


document.querySelector("#liveMatchPanel")?.addEventListener("click",e=>{
  const btn=e.target.closest("[data-live-match-tab]");
  if(!btn)return;
  const tab=btn.dataset.liveMatchTab;
  document.querySelectorAll(".live-match-tab").forEach(b=>b.classList.toggle("active",b===btn));
  document.querySelector("#liveMatchOverview")?.classList.toggle("active",tab==="overview");
  document.querySelector("#liveMatchLineups")?.classList.toggle("active",tab==="lineups");
  document.querySelector("#liveMatchStatistics")?.classList.toggle("active",tab==="statistics");
  document.querySelector("#liveMatchGallery")?.classList.toggle("active",tab==="gallery");
});

document.querySelector("#fixtureList").addEventListener("click",e=>{
  const row=e.target.closest("[data-fixture-id]");
  if(!row)return;
  expandedFixtureId=expandedFixtureId===row.dataset.fixtureId?"":row.dataset.fixtureId;
  render();
});
document.querySelector("#selectAllHomeLineup").addEventListener("click",()=>{
  document.querySelectorAll('#homeLineupChoices input[type="checkbox"]').forEach(x=>x.checked=true);
});
document.querySelector("#selectAllAwayLineup").addEventListener("click",()=>{
  document.querySelectorAll('#awayLineupChoices input[type="checkbox"]').forEach(x=>x.checked=true);
});
document.querySelector("#saveLineupsBtn").addEventListener("click",async ()=>{
  if(!isAdmin)return openLogin();
  const f=selectedControlMatch(); if(!f)return;
  const home=[...document.querySelectorAll(`#homeLineupChoices input:checked`)].map(x=>x.dataset.lineupPlayer);
  const away=[...document.querySelectorAll(`#awayLineupChoices input:checked`)].map(x=>x.dataset.lineupPlayer);
  if(!home.length||!away.length)return alert("Select at least one player for each team.");
  f.lineups={home,away};
  try{await save();flash();render();}catch(err){alert(err.message);}
});
document.querySelector("#subTeam").addEventListener("change",renderSubstitutionOptions);
document.querySelector("#recordSubBtn").addEventListener("click",async ()=>{
  if(!isAdmin)return openLogin();
  const f=selectedControlMatch(); if(!f)return;
  const status=normalizedStatus(f);
  if(!["live","paused","halftime"].includes(status))return alert("Substitutions can only be recorded for an active match.");
  const teamId=document.querySelector("#subTeam").value;
  const playerOutId=document.querySelector("#subPlayerOut").value;
  const playerInId=document.querySelector("#subPlayerIn").value;
  if(!playerOutId||!playerInId)return alert("Select both the player going off and the player coming on.");
  if(playerOutId===playerInId)return alert("Player In and Player Out must be different.");
  const minuteValue=document.querySelector("#subMinute").value;
  const minute=minuteValue===""?Math.floor(elapsedSeconds(f)/60):Number(minuteValue);
  data.events.push({id:"E"+Date.now(),matchId:f.id,teamId,type:"Substitution",playerId:playerInId,playerOutId,playerInId,minute,createdAtMs:Date.now()});
  try{await save();flash();document.querySelector("#subMinute").value="";render();}catch(err){alert(err.message);}
});


document.querySelector("#downloadLeagueBackupBtn")?.addEventListener("click",downloadLeagueBackup);
document.querySelector("#restoreLeagueBackupBtn")?.addEventListener("click",restoreLeagueBackup);
document.querySelector("#restoreLeagueBackupFile")?.addEventListener("change",e=>{
  const file=e.target.files?.[0];
  setBackupStatus(file?`Selected backup: ${file.name}`:"No backup selected.");
});

document.addEventListener("click",e=>{
  if(e.target.closest("[data-upcoming-prev]"))moveUpcomingFixture(-1);
  if(e.target.closest("[data-upcoming-next]"))moveUpcomingFixture(1);
});
document.querySelector("#galleryMatchFilter")?.addEventListener("change",renderGallery);
document.querySelector("#galleryUploadMatch")?.addEventListener("change",renderAdminGallery);
document.querySelector("#galleryPhotoUploadBtn")?.addEventListener("click",uploadGalleryPhotos);
document.querySelector("#galleryAddLinkBtn")?.addEventListener("click",addGalleryLink);
// Gallery media cards are rendered dynamically in several places.
// Use one delegated listener so Remove Photo/Video works from the main Gallery,
// the Admin gallery manager, match details, and any future gallery view.
document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-delete-media]");
  if(!btn)return;
  e.preventDefault();
  e.stopPropagation();
  deleteGalleryMedia(btn.dataset.deleteMedia);
});

document.querySelector("#liveStandingsToggle").addEventListener("change",async e=>{
  if(!isAdmin){e.target.checked=data.settings?.liveStandings!==false;return openLogin();}
  data.settings={...(data.settings||{}),liveStandings:e.target.checked};
  try{await save();flash();}catch(err){e.target.checked=!e.target.checked;alert(err.message);}
});

document.querySelector("#controlMatch").addEventListener("change",renderControlCenter);
document.querySelector("#startMatchBtn").addEventListener("click",()=>{
  const f=selectedControlMatch();
  const ls=fixtureLineups(f);
  if(!ls.home.length || !ls.away.length)return alert("Save a lineup for both teams before starting the match.");
  updateControlledMatch(f=>{
  f.status="live";
  f.phase="firstHalf";
  f.homeScore=hasScore(f)?Number(f.homeScore):0;
  f.awayScore=hasScore(f)?Number(f.awayScore):0;
  f.elapsedSeconds=0;
  f.startedAtMs=Date.now();
  f.finishedAtMs=null;
  f.halfTimeAtMs=null;
  f.secondHalfStartedAtMs=null;
  });
});
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
document.querySelector("#resetCompletedMatchBtn").addEventListener("click",async ()=>{
  if(!isAdmin)return openLogin();
  const f=selectedControlMatch();
  if(!f || normalizedStatus(f)!=="finished")return alert("Select a completed match first.");
  const relatedEvents=data.events.filter(e=>e.matchId===f.id);
  const warning=relatedEvents.length
    ? `Reset ${teamName(f.home)} vs ${teamName(f.away)}? This will clear this match's score, timer, and ${relatedEvents.length} recorded event(s), but it will not affect other matches.`
    : `Reset ${teamName(f.home)} vs ${teamName(f.away)}? This will clear this match's score and timer, but it will not affect other matches.`;
  if(!confirm(warning))return;
  data.events=data.events.filter(e=>e.matchId!==f.id);
  Object.assign(f,{
    homeScore:null,awayScore:null,status:"scheduled",phase:"scheduled",
    startedAtMs:null,finishedAtMs:null,halfTimeAtMs:null,secondHalfStartedAtMs:null,elapsedSeconds:0
  });
  try{await save();flash();render();}catch(err){alert(err.message);}
});
document.querySelector("main")?.addEventListener("click",e=>{
  const row=e.target.closest("[data-player-profile]");
  if(row)openPlayerProfile(row.dataset.playerProfile);
});
document.querySelector("#closePlayerProfile")?.addEventListener("click",closePlayerProfile);
document.querySelector("#playerProfileModal")?.addEventListener("click",e=>{if(e.target.id==="playerProfileModal")closePlayerProfile();});

document.querySelector("#homeGoalBtn").addEventListener("click",()=>{const f=selectedControlMatch();if(f)prepareGoalEvent(actualFixtureTeamId(f,"home"));});
document.querySelector("#awayGoalBtn").addEventListener("click",()=>{const f=selectedControlMatch();if(f)prepareGoalEvent(actualFixtureTeamId(f,"away"));});
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

let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
});
document.querySelector("#installAppBtn")?.addEventListener("click",async()=>{
  const isStandalone=window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone===true;
  if(isStandalone){
    alert("Intra Squad Sunday League is already installed on this device.");
    return;
  }
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null;
    return;
  }
  const ua=navigator.userAgent||"";
  const isiOS=/iPad|iPhone|iPod/.test(ua) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
  if(isiOS){
    alert("To install on iPhone/iPad:\n\n1. Tap the Share button in Safari.\n2. Choose Add to Home Screen.\n3. Tap Add.");
  }else{
    alert("To install the app, open this site in Chrome or Edge and use the browser's Install app / Add to Home screen option.");
  }
});
window.addEventListener("appinstalled",()=>{ deferredInstallPrompt=null; });

auth.onAuthStateChanged(user=>{
  isAdmin=Boolean(user && user.email?.toLowerCase()===ADMIN_EMAIL);
  updateAuthUI();
  if(isAdmin && !cloudReady) setStatus("Admin connected • Connecting to live data…");
  if(isAdmin){
    leagueConfigRef.get().then(snap=>{if(!snap.exists)return leagueConfigRef.set({competitions:structuredClone(DEFAULT_COMPETITIONS),currentCompetitionId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});}).catch(()=>{});
  }
});
document.querySelector("#playerProfileModal")?.addEventListener("click",e=>{
  const btn=e.target.closest("[data-profile-scope]");if(!btn)return;
  document.querySelectorAll("#playerProfileModal [data-profile-scope]").forEach(b=>b.classList.toggle("active",b===btn));
  const scope=btn.dataset.profileScope,name=document.querySelector("#playerProfileModal")?.dataset.playerName||"";
  if(scope==="competition"){
    const p=data.players.find(x=>String(x.name||"").trim().toLowerCase()===name.trim().toLowerCase());
    const target=document.querySelector("#playerProfileScopeContent");if(target&&p)target.innerHTML=`${profileStatsCards(statsFor(p.id))}<div class="muted" style="margin-top:10px">${competitionShortLabel()}${p.position?` • ${p.position}`:""}</div>`;
  }else loadPlayerProfileScope(name,scope).catch(()=>{const t=document.querySelector("#playerProfileScopeContent");if(t)t.innerHTML='<div class="muted">Unable to load aggregate statistics.</div>';});
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeLogin();closePlayerProfile();}});
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js?v=1.1.4").then(reg=>{
    reg.update().catch(()=>{});
    reg.addEventListener("updatefound",()=>{
      const worker=reg.installing;
      if(!worker)return;
      worker.addEventListener("statechange",()=>{
        if(worker.state==="installed" && navigator.serviceWorker.controller){
          // A newer release is ready. Reload once it takes control.
          worker.postMessage?.({type:"SKIP_WAITING"});
        }
      });
    });
  }).catch(err=>console.warn("Service worker registration failed",err));
  let reloading=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(reloading)return; reloading=true; location.reload();
  });
}
render();
updateAuthUI();
startMediaData();
startCompetitionConfig();


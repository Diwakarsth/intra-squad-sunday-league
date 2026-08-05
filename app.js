const ADMIN_CREDENTIALS = { username: "admin", password: "SundayLeague2026!" };
let isAdmin = sessionStorage.getItem("sisl-admin") === "true";

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
    "homeScore": 2,
    "awayScore": 1
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
  events: []
};

let data = JSON.parse(localStorage.getItem("sisl-data") || "null") || structuredClone(seed);
const save = () => localStorage.setItem("sisl-data", JSON.stringify(data));
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
  status.textContent=isAdmin?"Admin mode active":"";
  if(!isAdmin && document.querySelector("#admin").classList.contains("active")) activateTab("home");
}
function activateTab(tabId){
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tabId));
  document.querySelectorAll("main section").forEach(sec=>sec.classList.toggle("active",sec.id===tabId));
}


function standings(){
  const s = Object.fromEntries(data.teams.map(t=>[t.id,{team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}]));
  data.fixtures.filter(f=>f.id!=="F1" && Number.isInteger(f.homeScore) && Number.isInteger(f.awayScore)).forEach(f=>{
    const h=s[f.home], a=s[f.away]; h.p++;a.p++; h.gf+=f.homeScore;h.ga+=f.awayScore; a.gf+=f.awayScore;a.ga+=f.homeScore;
    if(f.homeScore>f.awayScore){h.w++;a.l++;h.pts+=3}
    else if(f.homeScore<f.awayScore){a.w++;h.l++;a.pts+=3}
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
function render(){
  const st=standings();
  const played=data.fixtures.filter(f=>Number.isInteger(f.homeScore)&&Number.isInteger(f.awayScore));
  document.querySelector("#kpiMatches").textContent=played.length;
  document.querySelector("#kpiGoals").textContent=played.reduce((n,f)=>n+f.homeScore+f.awayScore,0);
  document.querySelector("#kpiLeader").textContent=st[0]?.team.name||"—";

  const latest=played.at(-1);
  document.querySelector("#latestResult").innerHTML=latest?
    `<strong>${teamName(latest.home)} ${latest.homeScore}–${latest.awayScore} ${teamName(latest.away)}</strong><div class="muted">Week ${latest.week}</div>`:
    `No completed match yet.`;

  const next=data.fixtures.find(f=>f.homeScore===null||f.awayScore===null);
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
    const done=Number.isInteger(f.homeScore)&&Number.isInteger(f.awayScore);
    return `<div class="match"><div>${logoHtml(f.home)}<strong>${teamName(f.home)}</strong><div class="muted">Week ${f.week}</div></div>
      <div class="score">${done?`${f.homeScore}–${f.awayScore}`:"vs"}<div class="badge">${done?"Final":"Scheduled"}</div></div>
      <div class="team-right"><strong>${teamName(f.away)}</strong>${logoHtml(f.away)}<div class="muted">${f.date||""}${f.time?` • ${f.time}`:""}${f.venue?`<br>${f.venue}`:""}</div></div></div>`;
  }).join("");

  document.querySelector("#standingsBody").innerHTML=st.map((x,i)=>`<tr class="${i===0?"rank1":i===1?"rank2":i===2?"rank3":""}">
    <td>${i+1}</td><td>${logoHtml(x.team.id)}<strong>${x.team.name}</strong></td><td>${x.p}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gf}</td><td>${x.ga}</td><td>${x.gd}</td><td><strong>${x.pts}</strong></td></tr>`).join("");

  document.querySelector("#teamCards").innerHTML=data.teams.map(t=>{
    const ps=data.players.filter(p=>p.teamId===t.id);
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
    `<div class="player-row"><span><strong>${p.name}</strong><div class="muted">${teamName(p.teamId)}${p.captain?" • Captain":""}${p.position?` • ${p.position}`:""}${p.number?` • #${p.number}`:""}</div></span>
    <span class="muted">G ${p.goals} • A ${p.assists} • YC ${p.yellow} • RC ${p.red} • POTM ${p.potm}</span></div>`).join(""):`<div class="muted">No players added yet.</div>`;

  fillSelects();
}
function fillSelects(){
  const openMatches=data.fixtures;
  ["resultMatch","eventMatch"].forEach(id=>{
    const el=document.querySelector("#"+id), current=el.value;
    el.innerHTML=openMatches.map(f=>`<option value="${f.id}">${f.id}: ${teamName(f.home)} vs ${teamName(f.away)}</option>`).join("");
    if([...el.options].some(o=>o.value===current))el.value=current;
  });
  const teamOptions=data.teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  document.querySelector("#playerTeam").innerHTML=teamOptions;
  document.querySelector("#eventPlayer").innerHTML=data.players.map(p=>`<option value="${p.id}">${p.name} — ${teamName(p.teamId)}</option>`).join("");
}
document.querySelector("#tabs").addEventListener("click",e=>{
  if(!e.target.dataset.tab)return;
  if(e.target.dataset.tab==="admin"&&!isAdmin){openLogin();return;}
  activateTab(e.target.dataset.tab);
});
document.querySelector("#resultForm").addEventListener("submit",e=>{
  e.preventDefault(); if(!isAdmin)return openLogin(); const f=data.fixtures.find(x=>x.id===document.querySelector("#resultMatch").value);
  f.homeScore=Number(document.querySelector("#homeScore").value); f.awayScore=Number(document.querySelector("#awayScore").value);
  save(); flash(); render(); e.target.reset();
});
document.querySelector("#playerForm").addEventListener("submit",e=>{
  e.preventDefault(); if(!isAdmin)return openLogin();
  data.players.push({id:"P"+Date.now(),name:document.querySelector("#playerName").value.trim(),teamId:document.querySelector("#playerTeam").value,
    position:document.querySelector("#playerPosition").value.trim(),number:document.querySelector("#playerNumber").value});
  save(); flash(); render(); e.target.reset();
});
document.querySelector("#eventForm").addEventListener("submit",e=>{
  e.preventDefault(); if(!isAdmin)return openLogin();
  if(!document.querySelector("#eventPlayer").value)return alert("Add a player first.");
  data.events.push({id:"E"+Date.now(),matchId:document.querySelector("#eventMatch").value,playerId:document.querySelector("#eventPlayer").value,
    type:document.querySelector("#eventType").value,minute:Number(document.querySelector("#eventMinute").value||0)});
  save(); flash(); render(); e.target.reset();
});
document.querySelector("#resetBtn").addEventListener("click",()=>{
  if(!isAdmin)return openLogin();
  if(confirm("Reset all locally saved league data?")){data=structuredClone(seed);save();render();}
});
function flash(){const n=document.querySelector("#notice");n.style.display="block";setTimeout(()=>n.style.display="none",1800)}
function openLogin(){document.querySelector("#loginError").style.display="none";document.querySelector("#loginModal").classList.add("open");setTimeout(()=>document.querySelector("#adminUsername").focus(),50)}
function closeLogin(){document.querySelector("#loginModal").classList.remove("open");document.querySelector("#loginForm").reset()}
document.querySelector("#authBtn").addEventListener("click",()=>{
  if(isAdmin){isAdmin=false;sessionStorage.removeItem("sisl-admin");updateAuthUI();activateTab("home");}
  else openLogin();
});
document.querySelector("#closeLogin").addEventListener("click",closeLogin);
document.querySelector("#loginModal").addEventListener("click",e=>{if(e.target.id==="loginModal")closeLogin()});
document.querySelector("#loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const username=document.querySelector("#adminUsername").value.trim();
  const password=document.querySelector("#adminPassword").value;
  if(username===ADMIN_CREDENTIALS.username&&password===ADMIN_CREDENTIALS.password){
    isAdmin=true;sessionStorage.setItem("sisl-admin","true");closeLogin();updateAuthUI();activateTab("admin");
  }else document.querySelector("#loginError").style.display="block";
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLogin()});
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
render();
updateAuthUI();

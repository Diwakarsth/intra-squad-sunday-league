const APP_VERSION = "1.0.2";
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
const leagueRef = db.collection("league").doc("current");
const mediaRef = db.collection("matchMedia");
const ADMIN_EMAIL = "admin@intrasquadleague.com";
let isAdmin = false;
let cloudReady = false;
let unsubscribeLeague = null;
let unsubscribeMedia = null;
let matchMedia = [];
let expandedFixtureId = "";

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

function startMediaData(){
  if(unsubscribeMedia) unsubscribeMedia();
  unsubscribeMedia = mediaRef.orderBy("createdAtMs","desc").onSnapshot(snapshot=>{
    matchMedia = snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
    renderGallery();
    renderAdminGallery();
    renderLiveMatch();
    if(expandedFixtureId) render();
  }, error=>{
    console.warn("Gallery listener error", error);
    matchMedia = [];
    renderGallery();
    renderAdminGallery();
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
  const teamId=side==="home"?f.home:f.away;
  if(!ids.length)return `<div class="muted">Lineup not submitted.</div>`;
  return `<ul class="lineup-list">${ids.map(id=>`<li>${playerName(id)}${playerCaptainForFixture(id,teamId)?" (C)":""}</li>`).join("")}</ul>`;
}
function substitutionsHtml(f,teamId){
  const subs=substitutionEvents(f.id,teamId);
  if(!subs.length)return `<div class="muted">No substitutions.</div>`;
  return `<div class="sub-list">${subs.map(e=>`<div class="sub-line"><strong>${Number(e.minute||0)}'</strong> <span class="sub-out">⬇ ${playerName(e.playerOutId)}</span> &nbsp; <span class="sub-in">⬆ ${playerName(e.playerInId)}</span></div>`).join("")}</div>`;
}
function fixtureDetailsHtml(f){
  return `<div class="fixture-details">
    <div class="fixture-detail-grid">
      <div class="fixture-detail-team"><div class="live-lineup-team-head">${logoHtml(f.home)}<h4>${teamName(f.home)}</h4></div>${lineupHtml(f,"home")}${substitutionsHtml(f,f.home)}</div>
      <div class="fixture-detail-team away"><div class="live-lineup-team-head">${logoHtml(f.away)}<h4>${teamName(f.away)}</h4></div>${lineupHtml(f,"away")}${substitutionsHtml(f,f.away)}</div>
    </div>
    ${fixtureMediaSummaryHtml(f)}
  </div>`;
}

function mediaForMatch(matchId){
  return matchMedia.filter(m=>String(m.matchId)===String(matchId)).sort((a,b)=>Number(b.createdAtMs||0)-Number(a.createdAtMs||0));
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
  filter.innerHTML=`<option value="">All matches</option>${data.fixtures.map(f=>`<option value="${f.id}">Week ${f.week} • ${teamName(f.home)} vs ${teamName(f.away)}</option>`).join("")}`;
  if(data.fixtures.some(f=>f.id===previous))filter.value=previous;
  const selected=filter.value;
  const fixtures=selected?data.fixtures.filter(f=>f.id===selected):data.fixtures.filter(f=>mediaForMatch(f.id).length);
  if(!fixtures.length){
    content.innerHTML=`<div class="gallery-empty"><strong>No media yet</strong><div class="muted">Photos and videos added by the admin will appear here.</div></div>`;
    return;
  }
  content.innerHTML=fixtures.map(f=>{
    const items=mediaForMatch(f.id);
    if(!items.length)return "";
    return `<div class="gallery-match-group">
      <div class="gallery-match-head">
        <div><strong>${teamName(f.home)} vs ${teamName(f.away)}</strong><div class="muted">Week ${f.week}${f.date?` • ${f.date}`:""} • ${normalizedStatus(f)==="finished"?"Full Time":normalizedStatus(f)==="live"?"LIVE":normalizedStatus(f)==="halftime"?"Half Time":"Match Gallery"}</div></div>
        <span class="badge">${items.length} item${items.length===1?"":"s"}</span>
      </div>
      <div class="gallery-grid">${items.map(item=>mediaItemHtml(item)).join("")}</div>
    </div>`;
  }).join("");
}
function renderAdminGallery(){
  const panel=document.querySelector("#galleryAdminPanel");
  const matchSel=document.querySelector("#galleryUploadMatch");
  const list=document.querySelector("#galleryAdminList");
  if(panel)panel.classList.toggle("admin-hidden",!isAdmin);
  if(!matchSel||!list)return;
  const previous=matchSel.value;
  matchSel.innerHTML=data.fixtures.map(f=>`<option value="${f.id}">Week ${f.week} • ${teamName(f.home)} vs ${teamName(f.away)}</option>`).join("");
  if(data.fixtures.some(f=>f.id===previous))matchSel.value=previous;
  const matchId=matchSel.value || data.fixtures[0]?.id;
  const items=mediaForMatch(matchId);
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
        matchId,mediaType:"image",url:result.secure_url,caption,
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
    await mediaRef.add({matchId,mediaType:type,url,caption,storagePath:"",createdAtMs:Date.now(),createdBy:auth.currentUser?.email||ADMIN_EMAIL});
    document.querySelector("#galleryLinkUrl").value="";
    document.querySelector("#galleryLinkCaption").value="";
    document.querySelector("#galleryUploadProgress").textContent="Media link added.";
  }catch(err){alert(err.message||"Unable to add media link.");}
}
async function deleteGalleryMedia(id){
  if(!isAdmin)return openLogin();
  const item=matchMedia.find(m=>m.id===id);
  if(!item)return;
  if(!confirm("Remove this photo/video from the match gallery?"))return;
  try{
    await mediaRef.doc(id).delete();
  }catch(err){alert(err.message||"Unable to remove media.");}
}

function currentPlayersOnField(f,teamId){
  const side=teamId===f.home?"home":teamId===f.away?"away":"";
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
  homeBox.innerHTML=make(f.home,lineups.home);
  awayBox.innerHTML=make(f.away,lineups.away);
  renderSubstitutionOptions();
}
function renderSubstitutionOptions(){
  const f=selectedControlMatch(); if(!f)return;
  const teamSel=document.querySelector("#subTeam"), outSel=document.querySelector("#subPlayerOut"), inSel=document.querySelector("#subPlayerIn");
  if(!teamSel||!outSel||!inSel)return;
  const currentTeam=teamSel.value;
  teamSel.innerHTML=`<option value="${f.home}">${teamName(f.home)}</option><option value="${f.away}">${teamName(f.away)}</option>`;
  if([f.home,f.away].includes(currentTeam))teamSel.value=currentTeam;
  const teamId=teamSel.value;
  const onField=currentPlayersOnField(f,teamId);
  const roster=data.players.filter(p=>p.active!==false && p.teamId===teamId).sort((a,b)=>a.name.localeCompare(b.name));
  outSel.innerHTML=onField.length?`<option value="">Select player going off</option>${onField.map(id=>`<option value="${id}">${playerName(id)}</option>`).join("")}`:`<option value="">Save a lineup first</option>`;
  const bench=roster.filter(p=>!onField.includes(p.id));
  inSel.innerHTML=bench.length?`<option value="">Select player coming on</option>${bench.map(p=>`<option value="${p.id}">${p.name}</option>`).join("")}`:`<option value="">No available substitute</option>`;
  const status=normalizedStatus(f);
  document.querySelector("#recordSubBtn").disabled=!(["live","paused","halftime"].includes(status) && onField.length && bench.length);
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
    `<div class="player-row profile-clickable" data-player-profile="${p.id}"><span>${i+1}. <strong>${p.name}</strong><div class="muted">${teamName(p.teamId)}</div></span><span><strong>${p.goals}</strong> goal${p.goals===1?"":"s"}</span></div>`).join(""):`<div class="muted">No goals recorded yet.</div>`;

  document.querySelector("#topScorersFull").innerHTML=playersWithGoals.length?playersWithGoals.map((p,i)=>{
    const rankClass=i===0?"gold":i===1?"silver":i===2?"bronze":"";
    return `<div class="scorer-row profile-clickable" data-player-profile="${p.id}"><div class="scorer-rank ${rankClass}">${i+1}</div><div><strong>${p.name}</strong><div class="muted">${logoHtml(p.teamId,p.name)}${teamName(p.teamId)} • ${p.assists} assist${p.assists===1?"":"s"}</div></div><div class="goal-total">${p.goals}<small>Goals</small></div></div>`;
  }).join(""):`<div class="muted">No goals have been recorded. Admin can add goals from the Admin tab.</div>`;

  document.querySelector("#fixtureList").innerHTML=data.fixtures.map(f=>{
    const status=normalizedStatus(f);
    const matchHasScore=hasScore(f);
    const label=status==="live"?"🔴 LIVE":status==="halftime"?"Half Time":status==="paused"?"Paused":status==="finished"?"Full Time":"Scheduled";
    const canOpen=["live","paused","halftime","finished"].includes(status);
    return `<div class="match ${canOpen?"fixture-clickable":""}" ${canOpen?`data-fixture-id="${f.id}"`:""}><div>${logoHtml(f.home)}<strong>${teamName(f.home)}</strong><div class="muted">Week ${f.week}</div></div>
      <div class="score">${matchHasScore?`${Number(f.homeScore)}–${Number(f.awayScore)}`:"VS"}<div class="badge">${label}</div>${canOpen?`<div class="fixture-details-hint">${expandedFixtureId===f.id?"Hide":"View"} lineups</div>`:""}</div>
      <div class="team-right"><strong>${teamName(f.away)}</strong>${logoHtml(f.away)}<div class="muted">${f.date||""}${f.time?` • ${f.time}`:""}${f.venue?`<br>${f.venue}`:""}</div></div>
      ${expandedFixtureId===f.id?fixtureDetailsHtml(f):""}</div>`;
  }).join("");

  renderLiveTableNotice();
  renderGallery();
  renderAdminGallery();

  document.querySelector("#standingsBody").innerHTML=st.map((x,i)=>`<tr class="${i===0?"rank1":i===1?"rank2":i===2?"rank3":""}">
    <td>${i+1}</td><td>${logoHtml(x.team.id)}<strong>${x.team.name}</strong></td><td>${x.p}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gf}</td><td>${x.ga}</td><td>${x.gd}</td><td><strong>${x.pts}</strong></td></tr>`).join("");

  const homeStandingsBody=document.querySelector("#homeStandingsBody");
  if(homeStandingsBody) homeStandingsBody.innerHTML=st.slice(0,3).map((x,i)=>`<tr><td>${i+1}</td><td>${logoHtml(x.team.id)}<strong>${x.team.name}</strong></td><td>${x.p}</td><td>${x.gd>0?"+":""}${x.gd}</td><td><strong>${x.pts}</strong></td></tr>`).join("");
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
          <h4>Players</h4>
          <ul class="squad-list">${ps.map(p=>`<li><strong>${p.name}</strong>${p.captain?`<span class="captain-tag">Captain</span>`:""}</li>`).join("")}</ul>
        </div>
      </div>
    </article>`;
  }).join("");

  document.querySelector("#playerList").innerHTML=scorers.length?scorers.map(p=>
    `<div class="player-row profile-clickable" data-player-profile="${p.id}"><span><strong>${p.name}</strong>${p.active===false?`<span class="inactive-tag">Former player</span>`:""}<div class="muted">${teamName(p.teamId)}${p.captain?" • Captain":""}${p.position?` • ${p.position}`:""}${p.number?` • #${p.number}`:""}</div></span>
    <span class="muted">G ${p.goals} • A ${p.assists} • YC ${p.yellow} • RC ${p.red} • POTM ${p.potm}</span></div>`).join(""):`<div class="muted">No players added yet.</div>`;

  renderAwards(scorers,st);
  fillSelects();
  renderLiveMatch();
  renderControlCenter();
  renderEventManager();
  renderTeamManager();
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
    card("🔥","League Activity","${finished} / ${data.fixtures.length}","matches completed")
  ].join("");
}

function openPlayerProfile(playerId){
  const p=data.players.find(x=>x.id===playerId); if(!p)return;
  const s=statsFor(p.id), media=TEAM_MEDIA[p.teamId]||{};
  document.querySelector("#playerProfileTitle").textContent=p.name;
  document.querySelector("#playerProfileContent").innerHTML=`
    <div class="player-profile-head">${media.logo?`<img class="player-profile-logo" src="${encodeURI(media.logo)}" alt="${teamName(p.teamId)} logo">`:""}<div><strong style="font-size:20px">${p.name}</strong><div class="muted">${teamName(p.teamId)}${p.captain?" • Captain":""}${p.number?` • #${p.number}`:""}${p.active===false?" • Former player":""}</div></div></div>
    <div class="player-profile-stats">
      <div class="profile-stat"><strong>${s.goals}</strong><span>Goals</span></div>
      <div class="profile-stat"><strong>${s.assists}</strong><span>Assists</span></div>
      <div class="profile-stat"><strong>${s.yellow}</strong><span>Yellow</span></div>
      <div class="profile-stat"><strong>${s.red}</strong><span>Red</span></div>
      <div class="profile-stat"><strong>${s.potm}</strong><span>POTM</span></div>
      <div class="profile-stat"><strong>${p.position||"—"}</strong><span>Position</span></div>
    </div>`;
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
  return data.players
    .filter(p=>p.active!==false && [match.home,match.away].includes(p.teamId) && (!teamFilterId || p.teamId===teamFilterId))
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
    if(e.type==="Substitution")return `<div class="timeline-item"><strong>${e.minute||0}'</strong><span>🔁 Substitution — <span class="sub-out">⬇ ${playerName(e.playerOutId)}</span> / <span class="sub-in">⬆ ${playerName(e.playerInId)}</span></span></div>`;
    return `<div class="timeline-item"><strong>${e.minute||0}'</strong><span>${eventIcon(e.type)} ${e.type}${p?` — ${p.name}${e.type==="Own Goal"?` <span class="og-tag">OG</span>`:""}`:""}</span></div>`;
  }).join(""):`<div class="muted">Live match events will appear here.</div>`;
  const liveLineups=document.querySelector("#liveLineupsContent");
  if(liveLineups){
    liveLineups.innerHTML=`<div class="live-lineup-grid">
      <div class="live-lineup-team"><div class="live-lineup-team-head">${teamLogo(f.home)?`<img class="live-lineup-logo" src="${encodeURI(teamLogo(f.home))}" alt="${teamName(f.home)} logo">`:""}<h4>${teamName(f.home)}</h4></div>${lineupHtml(f,"home")}<h4 style="margin-top:12px">Substitutions</h4>${substitutionsHtml(f,f.home)}</div>
      <div class="live-lineup-team away"><div class="live-lineup-team-head">${teamLogo(f.away)?`<img class="live-lineup-logo" src="${encodeURI(teamLogo(f.away))}" alt="${teamName(f.away)} logo">`:""}<h4>${teamName(f.away)}</h4></div>${lineupHtml(f,"away")}<h4 style="margin-top:12px">Substitutions</h4>${substitutionsHtml(f,f.away)}</div>
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
        <div class="match-stat-value">${count(f.home,"Yellow Card")}</div><div class="match-stat-label">Yellow Cards</div><div class="match-stat-value">${count(f.away,"Yellow Card")}</div>
        <div class="match-stat-value">${count(f.home,"Red Card")}</div><div class="match-stat-label">Red Cards</div><div class="match-stat-value">${count(f.away,"Red Card")}</div>
        <div class="match-stat-value">${count(f.home,"Substitution")}</div><div class="match-stat-label">Substitutions</div><div class="match-stat-value">${count(f.away,"Substitution")}</div>
      </div>`;
    }
  }
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
  document.querySelector("#resetCompletedMatchBtn").disabled=status!=="finished";
  document.querySelector("#homeGoalBtn").disabled=status!=="live";
  document.querySelector("#awayGoalBtn").disabled=status!=="live";
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
  if([match.home,match.away].includes(player.teamId))return player.teamId;
  if([match.home,match.away].includes(player.previousTeamId))return player.previousTeamId;
  if(existingEvent && String(existingEvent.playerId)===String(player.id) && [match.home,match.away].includes(existingEvent.teamId))return existingEvent.teamId;
  return "";
}
function adjustScoreForEvent(event, direction){
  if(!event || !["Goal","Own Goal"].includes(event.type))return;
  const match=data.fixtures.find(f=>f.id===event.matchId);
  if(!match)return;
  const scoringTeamId=eventScoringTeamId(event,match);
  const delta=direction>=0?1:-1;
  if(scoringTeamId===match.home)match.homeScore=Math.max(0,Number(match.homeScore||0)+delta);
  else if(scoringTeamId===match.away)match.awayScore=Math.max(0,Number(match.awayScore||0)+delta);
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
  refreshEventPlayerOptions();
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
  if(![eventMatch.home,eventMatch.away].includes(playerTeamId))return alert("The selected player is not on either team in this match.");
  if(eventType==="Goal" && pendingGoalTeamId && playerTeamId!==pendingGoalTeamId)return alert(`Select a scorer from ${teamName(pendingGoalTeamId)}.`);
  const newEvent={id:"E"+Date.now(),matchId,playerId:document.querySelector("#eventPlayer").value,teamId:playerTeamId,
    type:eventType,minute:minuteInput===""?autoMinute:Number(minuteInput),createdAtMs:Date.now()};
  data.events.push(newEvent);
  if(eventType==="Goal"){
    if(playerTeamId===eventMatch.home)eventMatch.homeScore=Number(eventMatch.homeScore||0)+1;
    else if(playerTeamId===eventMatch.away)eventMatch.awayScore=Number(eventMatch.awayScore||0)+1;
  }else if(eventType==="Own Goal"){
    if(playerTeamId===eventMatch.home)eventMatch.awayScore=Number(eventMatch.awayScore||0)+1;
    else if(playerTeamId===eventMatch.away)eventMatch.homeScore=Number(eventMatch.homeScore||0)+1;
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


document.querySelector("#galleryMatchFilter")?.addEventListener("change",renderGallery);
document.querySelector("#galleryUploadMatch")?.addEventListener("change",renderAdminGallery);
document.querySelector("#galleryPhotoUploadBtn")?.addEventListener("click",uploadGalleryPhotos);
document.querySelector("#galleryAddLinkBtn")?.addEventListener("click",addGalleryLink);
document.querySelector("#galleryAdminList")?.addEventListener("click",e=>{
  const btn=e.target.closest("[data-delete-media]");
  if(btn)deleteGalleryMedia(btn.dataset.deleteMedia);
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

document.querySelector("#homeGoalBtn").addEventListener("click",()=>{const f=selectedControlMatch();if(f)prepareGoalEvent(f.home);});
document.querySelector("#awayGoalBtn").addEventListener("click",()=>{const f=selectedControlMatch();if(f)prepareGoalEvent(f.away);});
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
  e.preventDefault(); deferredInstallPrompt=e;
  document.querySelector("#installAppBtn")?.classList.add("show");
});
document.querySelector("#installAppBtn")?.addEventListener("click",async()=>{
  if(!deferredInstallPrompt)return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt=null;
  document.querySelector("#installAppBtn")?.classList.remove("show");
});
window.addEventListener("appinstalled",()=>document.querySelector("#installAppBtn")?.classList.remove("show"));

auth.onAuthStateChanged(user=>{
  isAdmin=Boolean(user && user.email?.toLowerCase()===ADMIN_EMAIL);
  updateAuthUI();
  if(isAdmin && !cloudReady) setStatus("Admin connected • Connecting to live data…");
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeLogin();closePlayerProfile();}});
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js?v=1.0.2").then(reg=>{
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
startLiveData();
startMediaData();


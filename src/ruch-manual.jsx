import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { MapPin, Clock, X, Phone, Mail, ArrowRight, ArrowUpRight, ChevronLeft, Check, Star, Info, MousePointerClick, Menu, Quote } from "lucide-react"
import IMG_BACK from "./assets/back.jpg"
import IMG_KNEE from "./assets/knee.jpg"
import IMG_THERAPY from "./assets/therapy.jpg"
import IMG_REHAB from "./assets/rehab.jpg"
import IMG_LOGO from "./assets/logo.svg"

const BP = {
  head:"Głowa / szyja",shoulder_l:"Lewe ramię",shoulder_r:"Prawe ramię",
  elbow_l:"Lewy łokieć",elbow_r:"Prawy łokieć",upper_back:"Górny kręgosłup",lower_back:"Dolny kręgosłup",
  hip_l:"Lewe biodro",hip_r:"Prawe biodro",knee_l:"Lewe kolano",
  knee_r:"Prawe kolano",ankle_l:"Lewa kostka",ankle_r:"Prawa kostka",
}

const SVCS = [
  {id:"fizjo",  name:"Fizjoterapia manualna", dur:50,price:180,abbr:"FM",
    desc:"Precyzyjna terapia tkanek miękkich i mobilizacja stawów kręgosłupa metodą Kaltenborna-Evjentha.",
    map:{head:1,shoulder_l:3,shoulder_r:3,upper_back:3,lower_back:3,hip_l:2,hip_r:2,knee_l:2,knee_r:2}},
  {id:"masaz",  name:"Masaż leczniczy",       dur:60,price:150,abbr:"ML",
    desc:"Głęboki masaż mięśniowo-powięziowy, redukujący napięcie i przywracający zakres ruchu.",
    map:{shoulder_l:2,shoulder_r:2,upper_back:3,lower_back:3,hip_l:1,hip_r:1,head:1}},
  {id:"kinezjo",name:"Kinesiotaping",         dur:30,price:100,abbr:"KT",
    desc:"Taśmowanie funkcjonalne wspierające stabilizację stawów i przyspieszające regenerację.",
    map:{knee_l:3,knee_r:3,ankle_l:3,ankle_r:3,shoulder_l:2,shoulder_r:2,elbow_l:3,elbow_r:3}},
  {id:"iglo",   name:"Suche igłowanie",       dur:45,price:130,abbr:"SI",
    desc:"Dezaktywacja mięśniowych punktów spustowych igłami akupunkturowymi - trwała ulga w bólu.",
    map:{lower_back:3,upper_back:2,shoulder_l:2,shoulder_r:2,hip_l:1,hip_r:1}},
  {id:"rehab",  name:"Rehabilitacja pooperacyjna", dur:60,price:200,abbr:"R+",
    desc:"Specjalistyczna opieka po zabiegach ortopedycznych kolana, biodra i kręgosłupa.",
    map:{knee_l:3,knee_r:3,hip_l:3,hip_r:3,ankle_l:2,ankle_r:2}},
  {id:"dno",    name:"Terapia dna miednicy",  dur:50,price:160,abbr:"TP",
    desc:"Holistyczna terapia mięśni głębokich miednicy. Specjalizacja: kobiety po porodzie.",
    map:{hip_l:2,hip_r:2,lower_back:1}},
]

const TIMES = ["09:00","09:50","10:40","11:30","13:00","13:50","14:40","15:30","16:20"]

// Najbliższe trzy dni robocze (bez niedziel), żeby terminy w demo zawsze wyglądały aktualnie
const DAYS = (() => {
  const out = [], d = new Date()
  const fmt = new Intl.DateTimeFormat("pl-PL",{weekday:"short",day:"numeric",month:"long"})
  while(out.length < 3){
    d.setDate(d.getDate()+1)
    if(d.getDay() !== 0) out.push(fmt.format(d))
  }
  return out
})()

const SVG_ZONES = [
  {id:"head",      el:"ellipse",p:{cx:90,cy:46,rx:30,ry:37}},
  {id:"shoulder_l",el:"ellipse",p:{cx:44,cy:108,rx:22,ry:26}},
  {id:"shoulder_r",el:"ellipse",p:{cx:136,cy:108,rx:22,ry:26}},
  {id:"elbow_l",   el:"circle", p:{cx:38,cy:174,r:17}},
  {id:"elbow_r",   el:"circle", p:{cx:142,cy:174,r:17}},
  {id:"upper_back",el:"rect",   p:{x:64,y:97,width:52,height:62,rx:6}},
  {id:"lower_back",el:"rect",   p:{x:61,y:159,width:58,height:74,rx:6}},
  {id:"hip_l",     el:"ellipse",p:{cx:65,cy:270,rx:20,ry:24}},
  {id:"hip_r",     el:"ellipse",p:{cx:115,cy:270,rx:20,ry:24}},
  {id:"knee_l",    el:"circle", p:{cx:65,cy:346,r:22}},
  {id:"knee_r",    el:"circle", p:{cx:107,cy:346,r:22}},
  {id:"ankle_l",   el:"circle", p:{cx:66,cy:416,r:20}},
  {id:"ankle_r",   el:"circle", p:{cx:108,cy:416,r:20}},
]

const POPULAR = ["lower_back","shoulder_r","knee_l","head"]

const TH = [
  {id:"ak",name:"Anna Kowalska",gen:"Anny",title:"mgr fizjoterapii, cert. OMT",
    bio:"8 lat doświadczenia w fizjoterapii manualnej. Absolwentka AWF Kraków, certyfikowana terapeutka Ortopedycznej Terapii Manualnej.",
    tags:["Kręgosłup","Barki","Rehabilitacja"],svcs:["fizjo","masaz","iglo"],photo:IMG_THERAPY,pos:"center 20%"},
  {id:"pn",name:"Piotr Nowak",gen:"Piotra",title:"dr n. med., spec. ortopedii",
    bio:"Doktor nauk medycznych, specjalista rehabilitacji pooperacyjnej kolana i biodra. Publikacje w European Journal of Physiotherapy.",
    tags:["Kolano","Biodro","Po operacji"],svcs:["fizjo","rehab","kinezjo"],photo:IMG_KNEE,pos:"center 35%"},
  {id:"mw",name:"Marta Wiśniewska",gen:"Marty",title:"mgr fizjoterapii, cert. kinesiotaping",
    bio:"Certyfikowana terapeutka dna miednicy i kinesiotapingu. Specjalizacja w fizjoterapii sportowej i perinatalnej.",
    tags:["Kinesiotaping","Sportowa","Dno miednicy"],svcs:["kinezjo","masaz","dno"],photo:IMG_REHAB,pos:"center 25%"},
]

const LOCK = {ak:[1,4,7],pn:[0,3,6],mw:[2,5]}

const NAV = [["Mapa ciała","body-map"],["Usługi","uslugi"],["Terapeuci","terapeuci"],["Kontakt","kontakt"]]

const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const CSS = `
  .rm{
    --g:#0D5442;--g-deep:#0A4636;--g-mint:#9FD3BC;--gp:#E4EFE8;
    --cr:#F5F1EA;--wh:#FBF9F4;--ink:#18201C;--mu:#69675F;--bd:rgba(13,84,66,.14);
    --star:#B98A3E;--err:#B4432F;
    --serif:"Fraunces",Georgia,"Times New Roman",serif;
    --sans:"Geist",system-ui,"Segoe UI",sans-serif;
    --ease:cubic-bezier(.22,1,.36,1);
    --spring:cubic-bezier(.34,1.56,.64,1);
    --z-grain:40;--z-nav:50;--z-progress:60;--z-modal:100;--z-cursor:200;--z-skip:300;
    font-family:var(--sans);font-size:16px;line-height:1.6;
    background:var(--cr);color:var(--ink);min-height:100dvh;overflow-x:clip;
  }
  .rm section[id],.rm footer[id]{scroll-margin-top:64px}
  .rm :focus-visible{outline:2px solid var(--g);outline-offset:3px;border-radius:8px}
  .rm ::selection{background:var(--g);color:#fff}

  /* ── Keyframes ── */
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
  @keyframes scaleUp{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:none}}
  @keyframes sheetUp{from{transform:translateY(100%)}to{transform:none}}
  @keyframes clipUp{from{clip-path:inset(100% 0 0 0);transform:translateY(40%)}to{clip-path:inset(0 0 0 0);transform:none}}
  @keyframes slowZoom{from{transform:scale(1.12)}to{transform:scale(1.02)}}
  @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(47,163,122,.45)}60%{box-shadow:0 0 0 7px rgba(47,163,122,0)}}
  @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes drift{to{transform:translate3d(5%,-4%,0) scale(1.06)}}

  .line{display:block;overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em}
  .line>span{display:block;animation:clipUp 1s var(--ease) both}
  .line:nth-child(2)>span{animation-delay:.1s}
  .line:nth-child(3)>span{animation-delay:.2s}
  .rise{animation:rise .9s var(--ease) both}
  .rise.d1{animation-delay:.35s}.rise.d2{animation-delay:.5s}.rise.d3{animation-delay:.65s}.rise.d4{animation-delay:.8s}

  /* ── Scroll reveals ── */
  .fade-in{opacity:0;transform:translateY(24px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
  .fade-in.vis{opacity:1;transform:none}
  .fade-in.d1{transition-delay:.06s}.fade-in.d2{transition-delay:.12s}.fade-in.d3{transition-delay:.18s}
  .fade-in.d4{transition-delay:.24s}.fade-in.d5{transition-delay:.3s}.fade-in.d6{transition-delay:.36s}

  /* ── Grain ── */
  .grain{position:fixed;inset:0;z-index:var(--z-grain);pointer-events:none;background-image:${NOISE};opacity:.045;mix-blend-mode:multiply}

  /* ── Layout ── */
  .wrap{max-width:1200px;margin:0 auto;padding:0 clamp(20px,4vw,56px)}
  .sec{padding:clamp(88px,11vw,144px) 0 clamp(104px,12vw,168px)}
  .sec-wh{background:var(--wh)}
  .sec-head{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(24px,5vw,80px);align-items:end;margin-bottom:clamp(48px,6vw,80px)}
  .eyebrow{display:flex;align-items:center;gap:12px;font-size:14px;font-weight:500;color:var(--g);margin-bottom:20px}
  .eyebrow .n{font-size:12.5px;color:var(--mu);font-variant-numeric:tabular-nums;letter-spacing:.04em;display:flex;align-items:center;gap:12px}
  .eyebrow .n::after{content:"";width:28px;height:1px;background:currentColor;opacity:.55}
  .h-sec{font-family:var(--serif);font-weight:420;font-size:clamp(36px,4.8vw,64px);line-height:1;letter-spacing:-.03em;text-wrap:balance}
  .h-sec em,.hero-h em,.cta h2 em{font-style:italic;font-weight:380;color:var(--g)}
  .lead{font-size:17px;color:var(--mu);line-height:1.65;max-width:44ch;text-wrap:pretty}

  /* ── Skip link ── */
  .skip{position:fixed;left:16px;top:-80px;z-index:var(--z-skip);background:var(--g);color:#fff;padding:12px 18px;border-radius:10px;font-weight:600;text-decoration:none;transition:top .2s var(--ease)}
  .skip:focus{top:16px}

  /* ── Buttons ── */
  .btn{--bg:var(--g);--fg:#fff;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 28px;border:0;border-radius:999px;background:var(--bg);color:var(--fg);font-family:var(--sans);font-size:15px;font-weight:600;letter-spacing:-.005em;text-decoration:none;cursor:pointer;white-space:nowrap;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 10px 24px -10px rgba(13,84,66,.6);
    transition:transform .3s var(--spring),background .2s,box-shadow .3s,color .2s}
  .btn:hover{--bg:var(--g-deep);transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 16px 32px -12px rgba(13,84,66,.65)}
  .btn:active{transform:translateY(0) scale(.98);transition-duration:.08s}
  .btn svg{transition:transform .3s var(--spring)}
  .btn:hover svg{transform:translateX(3px)}
  .btn-sm{min-height:42px;padding:0 20px;font-size:14px}
  .btn-light{--bg:var(--cr);--fg:var(--g);box-shadow:0 14px 34px -12px rgba(0,0,0,.5)}
  .btn-light:hover{--bg:#fff}
  .btn:disabled{--bg:var(--gp);--fg:#8F9C95;box-shadow:none;cursor:not-allowed;transform:none}
  .btn:disabled svg{transform:none}
  .text-link{display:inline-flex;align-items:center;gap:8px;padding:6px 0;border:0;border-bottom:1px solid rgba(24,32,28,.25);background:none;color:var(--ink);font-family:var(--sans);font-size:15px;font-weight:500;text-decoration:none;cursor:pointer;transition:color .2s,border-color .2s}
  .text-link:hover{color:var(--g);border-color:var(--g)}
  .text-link svg{transition:transform .3s var(--spring)}
  .text-link:hover svg{transform:translate(2px,2px)}
  .text-link.on-dark{color:#fff;border-color:rgba(255,255,255,.35)}
  .text-link.on-dark:hover{color:var(--g-mint);border-color:var(--g-mint)}
  .back-btn{display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 4px;border:0;background:none;color:var(--mu);font-size:14px;cursor:pointer;transition:color .2s}
  .back-btn:hover{color:var(--ink)}

  /* ── Progress ── */
  .progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:var(--z-progress);pointer-events:none}
  .progress i{display:block;height:100%;background:var(--g);transform:scaleX(0);transform-origin:left}

  /* ── Nav ── */
  .nav{position:fixed;top:0;left:0;right:0;z-index:var(--z-nav);height:80px;display:flex;align-items:center;transition:height .35s var(--ease),background .35s,box-shadow .35s}
  .nav.solid{height:66px;background:rgba(245,241,234,.84);backdrop-filter:blur(18px) saturate(1.5);-webkit-backdrop-filter:blur(18px) saturate(1.5);box-shadow:0 1px 0 var(--bd)}
  .nav-in{width:100%;max-width:1200px;margin:0 auto;padding:0 clamp(20px,4vw,56px);display:flex;align-items:center;justify-content:space-between;gap:24px}
  .logo-btn{display:flex;align-items:center;min-height:44px;border:0;background:none;cursor:pointer}
  .logo-btn img{height:48px;width:auto;transition:height .35s var(--ease)}
  .nav.solid .logo-btn img{height:40px}
  .nav-right{display:flex;align-items:center;gap:12px}
  .nav-links{display:flex;align-items:center;gap:2px;list-style:none}
  .nav-link{display:block;padding:9px 14px;border-radius:999px;color:var(--ink);font-size:15px;font-weight:500;text-decoration:none;transition:background .2s,color .2s}
  .nav-link:hover{background:rgba(13,84,66,.07)}
  .nav-link[aria-current="true"]{color:var(--g);background:rgba(13,84,66,.1)}
  .menu-btn{display:none;width:44px;height:44px;align-items:center;justify-content:center;border:0;border-radius:12px;background:rgba(13,84,66,.07);color:var(--ink);cursor:pointer}
  .mmenu{position:fixed;top:72px;left:12px;right:12px;z-index:var(--z-nav);display:grid;padding:10px;border-radius:22px;background:var(--wh);box-shadow:0 0 0 1px var(--bd),0 30px 60px -24px rgba(13,84,66,.45);animation:scaleUp .3s var(--ease)}
  .mmenu a{display:flex;align-items:center;justify-content:space-between;min-height:56px;padding:0 14px;border-radius:14px;color:var(--ink);font-family:var(--serif);font-size:22px;text-decoration:none}
  .mmenu a:hover,.mmenu a[aria-current="true"]{background:var(--gp);color:var(--g)}

  /* ── Hero ── */
  .hero{position:relative;min-height:100dvh;display:flex;align-items:center;padding:128px 0 88px;overflow:hidden;
    background:radial-gradient(55% 60% at 88% 28%,rgba(26,122,94,.17),transparent 70%),radial-gradient(45% 45% at 0% 100%,rgba(196,164,116,.16),transparent 70%),var(--cr)}
  .hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(48px,6vw,96px);align-items:center}
  .kicker{display:inline-flex;align-items:center;gap:10px;margin-bottom:32px;padding:6px 16px 6px 10px;border-radius:999px;background:rgba(255,255,255,.6);box-shadow:inset 0 0 0 1px var(--bd);font-size:13.5px;font-weight:500;color:var(--g)}
  .live-dot{width:8px;height:8px;border-radius:50%;background:#2FA37A;animation:pulse 2.4s ease-out infinite;flex-shrink:0}
  .hero-h{font-family:var(--serif);font-weight:420;font-size:clamp(50px,7.4vw,104px);line-height:.95;letter-spacing:-.04em;margin-bottom:32px}
  .hero-p{font-size:clamp(16.5px,1.35vw,18.5px);color:var(--mu);line-height:1.65;max-width:42ch;margin-bottom:40px;text-wrap:pretty}
  .hero-actions{display:flex;align-items:center;gap:28px;flex-wrap:wrap;margin-bottom:64px}
  .stats{display:flex;gap:clamp(28px,5vw,56px);padding-top:28px;border-top:1px solid var(--bd)}
  .stat-v{font-family:var(--serif);font-size:clamp(30px,3vw,42px);font-weight:420;line-height:1;letter-spacing:-.03em;font-variant-numeric:lining-nums tabular-nums}
  .stat-l{margin-top:8px;font-size:13.5px;color:var(--mu)}

  .hero-vis{position:relative;justify-self:end;width:min(100%,440px)}
  .arch{position:relative;aspect-ratio:4/5.3;border-radius:999px 999px 28px 28px;overflow:hidden;background:var(--gp);box-shadow:0 0 0 1px rgba(13,84,66,.08),0 50px 90px -40px rgba(13,84,66,.6)}
  .arch img{width:100%;height:100%;object-fit:cover;object-position:center 30%;animation:slowZoom 2.4s var(--ease) both}
  .arch::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(10,40,32,.32),transparent 45%);pointer-events:none}
  .inset-photo{position:absolute;left:-20%;bottom:9%;width:40%;aspect-ratio:3/4;border-radius:22px;overflow:hidden;border:6px solid var(--cr);box-shadow:0 26px 50px -18px rgba(13,84,66,.55);animation:rise .9s .9s var(--ease) both}
  .inset-photo img{width:100%;height:100%;object-fit:cover;object-position:center 15%}
  .float-card{position:absolute;padding:12px 16px;border-radius:16px;background:rgba(251,249,244,.86);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);box-shadow:inset 0 0 0 1px rgba(255,255,255,.75),0 20px 44px -18px rgba(13,84,66,.45)}
  .float-card .t{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink)}
  .float-card .s{margin-top:2px;font-size:12.5px;color:var(--mu);font-variant-numeric:tabular-nums}
  .fc-slot{top:11%;left:-16%;animation:rise .9s 1.05s var(--ease) both}
  .fc-slot>div{animation:floatY 5s 2s ease-in-out infinite}
  .fc-rate{top:46%;right:-9%;animation:rise .9s 1.2s var(--ease) both}
  .fc-rate>div{animation:floatY 5.6s 2.6s ease-in-out infinite}
  .stars{display:flex;gap:2px}

  /* ── Photo strip ── */
  .strip{display:grid;grid-template-columns:1.5fr 1fr 1.25fr;gap:6px;height:clamp(200px,24vw,330px);padding:0 6px;background:var(--cr)}
  .strip figure{overflow:hidden;border-radius:6px}
  .strip img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease)}
  .strip figure:hover img{transform:scale(1.05)}

  /* ── Marquee ── */
  .marquee{overflow:hidden;margin-top:6px;padding:20px 0;background:var(--g);color:#EAF3EE}
  .marquee-track{display:flex;width:max-content;animation:marquee 38s linear infinite}
  .marquee:hover .marquee-track{animation-play-state:paused}
  .marquee-item{display:inline-flex;align-items:center;gap:28px;padding-right:28px;font-family:var(--serif);font-style:italic;font-size:clamp(18px,1.8vw,22px);white-space:nowrap}
  .marquee-item::after{content:"";width:6px;height:6px;border-radius:50%;background:var(--g-mint);opacity:.7}

  /* ── Body map ── */
  .bm-grid{display:grid;grid-template-columns:300px minmax(0,1fr);gap:clamp(32px,6vw,96px);align-items:start}
  .figure-card{position:sticky;top:96px;display:flex;flex-direction:column;align-items:center;padding:28px 20px 22px;border-radius:30px;background:linear-gradient(180deg,#E6F0E9,#D5E7DC);box-shadow:inset 0 0 0 1px rgba(13,84,66,.1)}
  .figure-card>svg{width:190px;height:auto;overflow:visible}
  .zone{cursor:pointer;outline:none}
  .hov-label{height:22px;margin-top:12px;font-size:14px;font-weight:600;color:var(--g);transition:opacity .2s}
  .chips{display:flex;flex-wrap:wrap;gap:6px}
  .figure-card .chips{justify-content:center;margin-top:10px}
  .chip{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border:0;border-radius:10px;background:#fff;color:var(--g);font-family:var(--sans);font-size:13px;font-weight:500;cursor:pointer;box-shadow:inset 0 0 0 1px var(--bd);transition:box-shadow .2s,background .2s,transform .25s var(--spring)}
  .chip:hover{box-shadow:inset 0 0 0 1px var(--g)}
  .chip:active{transform:scale(.96)}
  .chip.on{background:var(--g);color:#fff;box-shadow:none}
  .bm-empty{display:flex;flex-direction:column;justify-content:center;min-height:420px;padding:clamp(28px,4vw,48px);border-radius:28px;background:radial-gradient(70% 80% at 100% 0%,rgba(26,122,94,.08),transparent 70%),var(--cr);box-shadow:inset 0 0 0 1px var(--bd)}
  .bm-empty-ic{display:grid;place-items:center;width:56px;height:56px;margin-bottom:24px;border-radius:16px;background:#fff;color:var(--g);box-shadow:0 12px 24px -14px rgba(13,84,66,.5)}
  .bm-empty h3{font-family:var(--serif);font-size:clamp(24px,2.4vw,30px);font-weight:450;letter-spacing:-.02em;margin-bottom:10px}
  .bm-empty p{font-size:15.5px;color:var(--mu);max-width:42ch;line-height:1.65;margin-bottom:32px}
  .mini-label{font-size:13px;font-weight:500;color:var(--ink);margin-bottom:12px}
  .bm-for{margin-bottom:20px;font-size:14px;color:var(--mu)}
  .bm-for strong{color:var(--ink);font-weight:600}
  .matches{display:grid;gap:10px}
  .match{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;width:100%;padding:22px 24px;border:0;border-radius:20px;background:#fff;text-align:left;font-family:var(--sans);color:var(--ink);cursor:pointer;box-shadow:inset 0 0 0 1px var(--bd);transition:transform .3s var(--spring),box-shadow .3s;animation:rise .5s var(--ease) both}
  .match:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(13,84,66,.35),0 20px 40px -24px rgba(13,84,66,.55)}
  .match:active{transform:scale(.99)}
  .match.best{box-shadow:inset 0 0 0 1.5px var(--g),0 20px 40px -28px rgba(13,84,66,.6)}
  .match-top{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:6px}
  .abbr{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:var(--gp);color:var(--g);font-family:var(--serif);font-size:13px;font-weight:600;flex-shrink:0}
  .match-name{font-family:var(--serif);font-size:20px;font-weight:450;letter-spacing:-.015em}
  .flag{padding:3px 8px;border-radius:5px;background:var(--g);color:#fff;font-size:11.5px;font-weight:600}
  .match-desc{max-width:56ch;margin-bottom:14px;font-size:14.5px;color:var(--mu);line-height:1.6}
  .fit{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--mu);font-variant-numeric:tabular-nums}
  .bar{flex:1;max-width:220px;height:4px;border-radius:99px;background:var(--gp);overflow:hidden}
  .bar i{display:block;height:100%;border-radius:99px;background:var(--g);transform-origin:left;transition:transform .6s var(--ease)}
  .match-side{text-align:right}
  .price{font-family:var(--serif);font-size:24px;font-weight:450;letter-spacing:-.02em;font-variant-numeric:lining-nums tabular-nums;white-space:nowrap}
  .dur{display:inline-flex;align-items:center;gap:5px;font-size:13px;color:var(--mu)}
  .note{display:flex;gap:10px;align-items:flex-start;margin-top:16px;padding:14px 16px;border-radius:14px;background:var(--cr);font-size:13.5px;color:var(--mu);line-height:1.55}
  .note svg{flex-shrink:0;margin-top:2px;color:var(--g)}

  /* ── Services list ── */
  .svc-list{list-style:none;border-top:1px solid var(--bd)}
  .svc-btn{position:relative;display:grid;grid-template-columns:48px minmax(0,1fr) minmax(0,1.2fr) 140px 52px;grid-template-areas:"num name desc meta arrow";gap:clamp(16px,3vw,40px);align-items:center;width:100%;padding:34px 12px;border:0;border-bottom:1px solid var(--bd);background:none;text-align:left;font-family:var(--sans);color:var(--ink);cursor:pointer}
  .svc-btn::before{content:"";position:absolute;inset:6px -12px;border-radius:22px;background:var(--wh);box-shadow:0 24px 48px -32px rgba(13,84,66,.5);opacity:0;transform:scaleY(.8);transition:opacity .3s,transform .45s var(--ease)}
  .svc-btn>*{position:relative}
  .svc-btn:hover::before,.svc-btn:focus-visible::before{opacity:1;transform:none}
  .svc-num{grid-area:num;font-size:13px;color:var(--mu);font-variant-numeric:tabular-nums}
  .svc-name{grid-area:name;font-family:var(--serif);font-size:clamp(23px,2.5vw,32px);font-weight:420;line-height:1.08;letter-spacing:-.025em;text-wrap:balance;transition:transform .45s var(--ease),color .25s}
  .svc-btn:hover .svc-name{color:var(--g);transform:translateX(6px)}
  .svc-desc{grid-area:desc;max-width:44ch;font-size:15px;color:var(--mu);line-height:1.6}
  .svc-meta{grid-area:meta;display:flex;flex-direction:column;align-items:flex-end;gap:4px}
  .svc-arrow{grid-area:arrow;display:grid;place-items:center;width:52px;height:52px;border-radius:50%;color:var(--g);box-shadow:inset 0 0 0 1px var(--bd);transition:background .25s,color .25s,box-shadow .25s,transform .45s var(--spring)}
  .svc-btn:hover .svc-arrow{background:var(--g);color:#fff;box-shadow:none;transform:rotate(45deg)}

  /* ── Quote ── */
  .quote{display:grid;grid-template-columns:1fr 1fr;min-height:clamp(340px,38vw,520px)}
  .quote-img{position:relative;overflow:hidden}
  .quote-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 40%}
  .quote-body{position:relative;display:flex;flex-direction:column;justify-content:center;padding:clamp(48px,6vw,104px);overflow:hidden;color:#fff;background:radial-gradient(80% 70% at 100% 0%,rgba(159,211,188,.16),transparent 65%),var(--g)}
  .qmark{margin-bottom:24px;color:var(--g-mint);opacity:.7}
  .quote-text{max-width:22ch;margin-bottom:32px;font-family:var(--serif);font-style:italic;font-weight:380;font-size:clamp(24px,2.6vw,36px);line-height:1.25;letter-spacing:-.015em;text-wrap:balance}
  .quote-by{display:flex;align-items:center;gap:12px;font-size:14px;color:rgba(255,255,255,.7)}
  .quote-by::before{content:"";width:28px;height:1px;background:currentColor}

  /* ── Therapists ── */
  .th-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(20px,2.6vw,36px);align-items:start}
  .th-card:nth-child(2){margin-top:88px}
  .th-photo{position:relative;aspect-ratio:4/5;border-radius:26px;overflow:hidden;background:var(--gp)}
  .th-photo img{width:100%;height:100%;object-fit:cover;transition:transform 1s var(--ease)}
  .th-card:hover .th-photo img{transform:scale(1.05)}
  .th-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(10,40,32,.28),transparent 40%);pointer-events:none}
  .th-body{padding:24px 4px 0}
  .th-name{font-family:var(--serif);font-size:clamp(24px,2.2vw,28px);font-weight:420;line-height:1.1;letter-spacing:-.02em}
  .th-title{margin:4px 0 14px;font-size:14px;font-weight:500;color:var(--g)}
  .th-bio{max-width:40ch;margin-bottom:18px;font-size:15px;color:var(--mu);line-height:1.65}
  .tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:22px}
  .tag{padding:4px 10px;border-radius:7px;background:var(--gp);color:var(--g);font-size:12.5px;font-weight:500}

  /* ── CTA ── */
  .cta{position:relative;isolation:isolate;overflow:hidden;padding:clamp(96px,12vw,152px) 0 clamp(104px,13vw,168px);background:#0B3A2E;color:#fff}
  .cta::before{content:"";position:absolute;inset:-25%;z-index:-1;background:radial-gradient(38% 48% at 18% 30%,rgba(47,163,122,.42),transparent 70%),radial-gradient(34% 44% at 86% 78%,rgba(159,211,188,.2),transparent 70%);animation:drift 16s ease-in-out infinite alternate}
  .cta::after{content:"";position:absolute;inset:0;z-index:-1;background-image:${NOISE};opacity:.08;mix-blend-mode:overlay}
  .cta-in{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(32px,6vw,96px);align-items:end}
  .cta h2{font-family:var(--serif);font-weight:420;font-size:clamp(40px,5.6vw,76px);line-height:.98;letter-spacing:-.035em;text-wrap:balance}
  .cta h2 em{color:var(--g-mint)}
  .cta p{max-width:38ch;margin-bottom:32px;font-size:17px;color:rgba(255,255,255,.72);line-height:1.65}
  .cta-actions{display:flex;align-items:center;gap:28px;flex-wrap:wrap}

  /* ── Footer ── */
  .foot{padding:clamp(64px,8vw,96px) 0 32px;background:#0B1F1A;color:rgba(255,255,255,.66)}
  .foot-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:clamp(32px,6vw,80px);margin-bottom:56px}
  .foot-logo{height:64px;width:auto;margin:-8px 0 16px -6px;filter:brightness(0) invert(1)}
  .foot-about{max-width:34ch;margin-bottom:24px;font-size:14.5px;line-height:1.7}
  .foot-h{margin-bottom:18px;font-size:13px;font-weight:600;color:#fff}
  .foot-c{display:flex;align-items:center;gap:10px;min-height:32px;font-size:14.5px;color:inherit;text-decoration:none;transition:color .2s}
  a.foot-c:hover{color:#fff}
  .foot-c svg{color:var(--g-mint)}
  .foot-link{display:block;min-height:32px;padding:0;border:0;background:none;color:inherit;font-family:var(--sans);font-size:14.5px;text-align:left;cursor:pointer;transition:color .2s}
  .foot-link:hover{color:#fff}
  .hours{display:flex;justify-content:space-between;padding:7px 0;font-size:14.5px;font-variant-numeric:tabular-nums}
  .hours span:last-child{color:#fff;font-weight:500}
  .hours.closed span:last-child{color:rgba(255,255,255,.35);font-weight:400}
  .stack{margin-top:24px;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
  .stack-l{margin-bottom:4px;font-size:12px;color:rgba(255,255,255,.4)}
  .stack-v{font-size:13px;color:rgba(255,255,255,.55);line-height:1.7}
  .foot-bottom{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;padding-top:24px;border-top:1px solid rgba(255,255,255,.08);font-size:13px}

  /* ── Booking modal ── */
  .overlay{position:fixed;inset:0;z-index:var(--z-modal);display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(11,31,26,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:fadeIn .25s ease}
  .modal{position:relative;width:100%;max-width:540px;max-height:min(92dvh,780px);overflow-y:auto;padding:clamp(24px,4vw,36px);border-radius:30px;background:var(--wh);box-shadow:0 50px 100px -30px rgba(0,0,0,.55);animation:scaleUp .35s var(--ease);outline:none}
  .modal-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
  .modal-h{font-family:var(--serif);font-size:30px;font-weight:420;line-height:1.1;letter-spacing:-.025em}
  .modal-sub{margin-top:4px;font-size:13px;color:var(--mu);font-variant-numeric:tabular-nums}
  .close{display:grid;place-items:center;width:44px;height:44px;margin:-6px -6px 0 0;border:0;border-radius:50%;background:transparent;color:var(--mu);cursor:pointer;transition:background .2s,color .2s}
  .close:hover{background:var(--gp);color:var(--ink)}
  .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:20px 0 28px}
  .steps i{height:3px;border-radius:99px;background:var(--gp);transition:background .4s var(--ease)}
  .steps i.on{background:var(--g)}
  .step-h{margin-bottom:4px;font-family:var(--serif);font-size:19px;font-weight:450}
  .step-p{margin-bottom:16px;font-size:13.5px;color:var(--mu)}
  .opts{display:grid;gap:8px}
  .opt{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:12px 16px;border:0;border-radius:16px;background:#fff;text-align:left;font-family:var(--sans);color:var(--ink);cursor:pointer;box-shadow:inset 0 0 0 1px var(--bd);transition:box-shadow .2s,background .2s,transform .25s var(--spring)}
  .opt:hover{box-shadow:inset 0 0 0 1px rgba(13,84,66,.45)}
  .opt:active{transform:scale(.99)}
  .opt[aria-pressed="true"]{background:var(--gp);box-shadow:inset 0 0 0 1.5px var(--g)}
  .opt-l{display:flex;align-items:center;gap:12px}
  .opt-name{font-family:var(--serif);font-size:16px;font-weight:500}
  .opt-sub{font-size:12.5px;color:var(--mu)}
  .avatar{width:48px;height:48px;border-radius:15px;overflow:hidden;flex-shrink:0;background:var(--gp)}
  .avatar img{width:100%;height:100%;object-fit:cover}
  .days{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
  .day{min-height:40px;padding:0 14px;border:0;border-radius:11px;background:transparent;color:var(--mu);font-family:var(--sans);font-size:13px;cursor:pointer;box-shadow:inset 0 0 0 1px var(--bd);transition:background .2s,color .2s}
  .day:hover{color:var(--ink)}
  .day[aria-pressed="true"]{background:var(--g);color:#fff;font-weight:600;box-shadow:none}
  .slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px}
  .slot{min-height:44px;border:0;border-radius:11px;background:#fff;color:var(--ink);font-family:var(--sans);font-size:14px;font-weight:500;font-variant-numeric:tabular-nums;cursor:pointer;box-shadow:inset 0 0 0 1px var(--bd);transition:background .15s,color .15s,box-shadow .15s,transform .25s var(--spring)}
  .slot:hover:not(:disabled){color:var(--g);box-shadow:inset 0 0 0 1.5px var(--g)}
  .slot:active:not(:disabled){transform:scale(.96)}
  .slot[aria-pressed="true"]{background:var(--g);color:#fff;box-shadow:none}
  .slot:disabled{background:transparent;color:#B3B0A7;text-decoration:line-through;cursor:not-allowed;box-shadow:inset 0 0 0 1px rgba(13,84,66,.06)}
  .step-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:22px}
  .sum{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--bd);font-size:14px}
  .sum span:first-child{min-width:92px;color:var(--mu)}
  .sum span:last-child{font-weight:600}
  .fields{display:grid;gap:14px;margin-top:20px}
  .field label{display:block;margin-bottom:6px;font-size:13px;font-weight:500}
  .input{width:100%;min-height:48px;padding:0 14px;border:0;border-radius:12px;background:#fff;color:var(--ink);font-family:var(--sans);font-size:15px;box-shadow:inset 0 0 0 1px var(--bd);transition:box-shadow .2s}
  .input:focus{outline:none;box-shadow:inset 0 0 0 1.5px var(--g),0 0 0 4px rgba(13,84,66,.12)}
  .input[aria-invalid="true"]{box-shadow:inset 0 0 0 1.5px var(--err)}
  .err{margin-top:6px;font-size:13px;color:var(--err)}
  .legal{margin-top:12px;font-size:12.5px;color:var(--mu);line-height:1.6}
  .done{text-align:center;padding:8px 0}
  .done-ic{display:grid;place-items:center;width:72px;height:72px;margin:0 auto 22px;border-radius:22px;background:var(--g);color:#fff;box-shadow:0 18px 36px -16px rgba(13,84,66,.7);animation:scaleUp .5s var(--spring)}
  .done p{margin-bottom:24px;font-size:15px;color:var(--mu);line-height:1.65}
  .done-sum{display:grid;gap:6px;margin-bottom:24px;text-align:left}
  .done-sum div{display:flex;gap:12px;padding:10px 14px;border-radius:12px;background:var(--gp);font-size:14px}
  .done-sum span:first-child{min-width:92px;font-weight:600;color:var(--g)}

  /* ── Custom cursor (tylko mysz) ── */
  .rm-cursor-on,.rm-cursor-on *{cursor:none!important}
  .rm-cursor-on input,.rm-cursor-on textarea{cursor:text!important}
  .cur{position:fixed;top:0;left:0;z-index:var(--z-cursor);pointer-events:none;will-change:transform;transition:opacity .2s}
  .cur-dot i{display:block;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:var(--g);transition:transform .25s var(--ease)}
  .cur-ring i{display:block;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;border:1.5px solid rgba(13,84,66,.45);transition:transform .35s var(--ease),background .25s,border-color .25s}
  .cur-ring.big i{transform:scale(1.55);background:rgba(13,84,66,.08);border-color:rgba(13,84,66,.25)}
  .cur-dot.big i{transform:scale(.5)}

  /* ── Responsive ── */
  @media (max-width:1080px){
    .fc-slot{left:-6%}
    .inset-photo{left:-10%}
    .fc-rate{right:-4%}
  }
  @media (max-width:960px){
    .hero{min-height:auto;padding-top:112px}
    .hero-grid{grid-template-columns:1fr}
    .hero-vis{justify-self:center;width:min(78%,380px);margin-top:8px}
    .sec-head{grid-template-columns:1fr;align-items:start}
    .bm-grid{grid-template-columns:1fr}
    .figure-card{position:relative;top:0;max-width:340px;width:100%;margin:0 auto}
    .bm-empty{min-height:0}
    .svc-btn{grid-template-columns:36px minmax(0,1fr) 44px;grid-template-areas:"num name arrow" ". desc desc" ". meta meta";row-gap:10px;padding:28px 4px}
    .svc-btn::before{inset:4px -8px}
    .svc-meta{flex-direction:row;align-items:baseline;gap:14px}
    .svc-arrow{width:44px;height:44px}
    .th-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    .th-card:nth-child(2){margin-top:0}
    .cta-in{grid-template-columns:1fr}
    .foot-grid{grid-template-columns:1fr 1fr}
    .foot-grid>div:first-child{grid-column:1/-1}
  }
  @media (max-width:860px){
    .nav-links{display:none}
    .menu-btn{display:inline-flex}
  }
  @media (max-width:640px){
    .stats{gap:24px;justify-content:space-between}
    .strip{grid-template-columns:1.4fr 1fr}
    .strip figure:nth-child(3){display:none}
    .quote{grid-template-columns:1fr}
    .quote-img{height:280px}
    .th-grid{grid-template-columns:1fr}
    .match{grid-template-columns:1fr;gap:14px}
    .match-side{display:flex;align-items:baseline;gap:12px;text-align:left}
    .foot-grid{grid-template-columns:1fr}
    .overlay{align-items:flex-end;padding:0}
    .modal{max-height:92dvh;border-radius:26px 26px 0 0;animation:sheetUp .4s var(--ease)}
  }
  @media (max-width:420px){
    .nav-cta-long{display:none}
    .hero-vis{width:86%}
    .fc-slot{left:-8%;top:6%}
    .fc-rate{right:-6%}
  }

  @media (prefers-reduced-motion:reduce){
    .rm *,.rm *::before,.rm *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01ms!important}
    .fade-in{opacity:1;transform:none}
  }
`

function Eyebrow({n,children}) {
  return <p className="eyebrow"><span className="n">{n}</span>{children}</p>
}

export default function RuchManual() {
  const [navSolid,setNavSolid] = useState(false)
  const [active,setActive]     = useState(null)
  const [menuOpen,setMenuOpen] = useState(false)
  const [selParts,setSelParts] = useState([])
  const [hov,setHov]           = useState(null)
  const [bookOpen,setBookOpen] = useState(false)
  const [step,setStep]         = useState(1)
  const [selSvc,setSelSvc]     = useState(null)
  const [selTh,setSelTh]       = useState(null)
  const [selSlot,setSelSlot]   = useState(null)
  const [selDay,setSelDay]     = useState(0)
  const [fName,setFName]       = useState("")
  const [fPhone,setFPhone]     = useState("")
  const [touched,setTouched]   = useState({})
  const [done,setDone]         = useState(false)
  const [fineCursor]           = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover:hover) and (pointer:fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion:reduce)").matches)

  const progRef  = useRef(null)
  const dotRef   = useRef(null)
  const ringRef  = useRef(null)
  const modalRef = useRef(null)

  // Scroll: pasek postępu bez re-renderów, stan tylko przy przekroczeniu progu
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if(progRef.current) progRef.current.style.transform = `scaleX(${max > 0 ? y/max : 0})`
      setNavSolid(y > 40)
    }
    const h = () => { if(!raf) raf = requestAnimationFrame(update) }
    h()
    window.addEventListener("scroll", h, {passive:true})
    return () => { window.removeEventListener("scroll", h); cancelAnimationFrame(raf) }
  },[])

  // Własny kursor tylko dla myszy; pozycja przez transform w rAF, bez re-renderów
  useEffect(() => {
    if(!fineCursor) return
    const root = document.documentElement
    root.classList.add("rm-cursor-on")
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0
    const loop = () => {
      rx += (x - rx) * .2; ry += (y - ry) * .2
      if(dotRef.current)  dotRef.current.style.transform  = `translate3d(${x}px,${y}px,0)`
      if(ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px,${ry}px,0)`
      raf = requestAnimationFrame(loop)
    }
    const move = e => { x = e.clientX; y = e.clientY }
    const over = e => {
      const big = !!e.target.closest("a,button,[role=button],.zone")
      dotRef.current?.classList.toggle("big", big)
      ringRef.current?.classList.toggle("big", big)
    }
    const show = v => () => [dotRef.current,ringRef.current].forEach(el => el && (el.style.opacity = v))
    const leave = show("0"), enter = show("1")
    raf = requestAnimationFrame(loop)
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseover", over)
    document.addEventListener("mouseleave", leave)
    document.addEventListener("mouseenter", enter)
    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove("rm-cursor-on")
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseover", over)
      document.removeEventListener("mouseleave", leave)
      document.removeEventListener("mouseenter", enter)
    }
  },[fineCursor])

  // Wejścia sekcji przy scrollu
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){ e.target.classList.add("vis"); obs.unobserve(e.target) }
      })
    },{threshold:0.08, rootMargin:"0px 0px -6% 0px"})
    document.querySelectorAll(".fade-in").forEach(el => obs.observe(el))
    return () => obs.disconnect()
  },[])

  // Aktywna pozycja w nawigacji
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) setActive(e.target.id) })
    },{rootMargin:"-45% 0px -50% 0px"})
    NAV.forEach(([,id]) => { const el = document.getElementById(id); if(el) obs.observe(el) })
    return () => obs.disconnect()
  },[])

  const closeBook = useCallback(() => {
    setBookOpen(false)
    setTimeout(()=>{
      setStep(1);setSelSvc(null);setSelTh(null);setSelSlot(null)
      setSelDay(0);setFName("");setFPhone("");setTouched({});setDone(false)
    },280)
  },[])

  // Modal: Escape, blokada scrolla, fokus
  useEffect(() => {
    if(!bookOpen) return
    const prev = document.activeElement
    const key = e => { if(e.key === "Escape") closeBook() }
    document.body.style.overflow = "hidden"
    modalRef.current?.focus()
    window.addEventListener("keydown", key)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", key)
      prev?.focus?.()
    }
  },[bookOpen,closeBook])

  useEffect(() => {
    if(!menuOpen) return
    const key = e => { if(e.key === "Escape") setMenuOpen(false) }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  },[menuOpen])

  const togglePart = useCallback(id =>
    setSelParts(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id])
  ,[])

  const scored = useMemo(() =>
    SVCS.map(s => {
      let score=0, covered=0
      selParts.forEach(p => { if(s.map[p]){ score+=s.map[p]; covered++ } })
      return {...s, score, covered, pct: selParts.length ? covered/selParts.length : 0}
    }).sort((a,b) => b.covered-a.covered || b.score-a.score)
  ,[selParts])

  const openBook = (svcId=null,thId=null) => {
    if(svcId) setSelSvc(svcId)
    if(thId)  setSelTh(thId)
    setStep(svcId ? 2 : 1)
    setBookOpen(true); setDone(false); setMenuOpen(false)
  }
  const toTop = () => window.scrollTo({top:0,behavior:"smooth"})

  const thForSvc  = TH.filter(t => !selSvc || t.svcs.includes(selSvc))
  const svcObj    = SVCS.find(s => s.id === selSvc)
  const thObj     = TH.find(t => t.id === selTh)
  const slotTime  = selSlot ? TIMES[parseInt(selSlot.split("-")[1])] : null
  const nameOk    = fName.trim().length >= 3
  const phoneOk   = fPhone.replace(/\D/g,"").length >= 9
  const summary   = [["Usługa",svcObj?.name],["Terapeuta",thObj?.name],["Termin",slotTime && `${DAYS[selDay]}, godz. ${slotTime}`]].filter(([,v])=>v)

  return (
    <div className="rm">
      <style>{CSS}</style>
      <a className="skip" href="#main">Przejdź do treści</a>
      <div className="grain" aria-hidden="true"/>

      {fineCursor && <>
        <div ref={ringRef} className="cur cur-ring" aria-hidden="true"><i/></div>
        <div ref={dotRef} className="cur cur-dot" aria-hidden="true"><i/></div>
      </>}

      <div className="progress" aria-hidden="true"><i ref={progRef}/></div>

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <header className={`nav ${navSolid || menuOpen ? "solid" : ""}`}>
        <nav className="nav-in" aria-label="Główna nawigacja">
          <button className="logo-btn" onClick={toTop} aria-label="Ruch Manual - na górę strony">
            <img src={IMG_LOGO} alt="Ruch Manual"/>
          </button>
          <div className="nav-right">
            <ul className="nav-links">
              {NAV.map(([l,id])=>(
                <li key={id}><a className="nav-link" href={`#${id}`} aria-current={active===id || undefined}>{l}</a></li>
              ))}
            </ul>
            <button className="btn btn-sm" onClick={()=>openBook()}>
              <span>Umów<span className="nav-cta-long"> wizytę</span></span>
            </button>
            <button className="menu-btn" onClick={()=>setMenuOpen(o=>!o)} aria-expanded={menuOpen} aria-controls="mmenu" aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}>
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </nav>
      </header>
      {menuOpen && (
        <div id="mmenu" className="mmenu">
          {NAV.map(([l,id])=>(
            <a key={id} href={`#${id}`} onClick={()=>setMenuOpen(false)} aria-current={active===id || undefined}>
              {l} <ArrowRight size={18}/>
            </a>
          ))}
        </div>
      )}

      <main id="main">
        {/* ══ HERO ════════════════════════════════════════════════ */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="kicker rise"><span className="live-dot"/>Gabinet fizjoterapii · Kraków, Stare Miasto</p>
              <h1 className="hero-h">
                <span className="line"><span>Ruch, który</span></span>
                <span className="line"><span>przywraca</span></span>
                <span className="line"><span><em>sprawność</em></span></span>
              </h1>
              <p className="hero-p rise d1">
                Fizjoterapia manualna i rehabilitacja w jednym miejscu. Zaznacz na mapie ciała, gdzie boli - dopasujemy terapię i terapeutę.
              </p>
              <div className="hero-actions rise d2">
                <button className="btn" onClick={()=>openBook()}>Umów wizytę <ArrowRight size={17}/></button>
                <a className="text-link" href="#body-map">albo wskaż, gdzie boli <ArrowRight size={15} style={{transform:"rotate(45deg)"}}/></a>
              </div>
              <dl className="stats rise d3">
                {[["1 240","pacjentów od 2018 r."],["8 lat","praktyki klinicznej"],["3","specjalistów w zespole"]].map(([v,l])=>(
                  <div key={l}>
                    <dt className="stat-v">{v}</dt>
                    <dd className="stat-l">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="hero-vis">
              <div className="arch">
                <img src={IMG_BACK} alt="Terapeuta wykonuje masaż pleców stemplami ziołowymi"/>
              </div>
              <div className="inset-photo">
                <img src={IMG_THERAPY} alt="Terapeutka mobilizuje biodro pacjentki na stole terapeutycznym"/>
              </div>
              <div className="float-card fc-slot">
                <div>
                  <div className="t"><span className="live-dot"/>Wolny termin dziś</div>
                  <div className="s">15:30 · Anna Kowalska</div>
                </div>
              </div>
              <div className="float-card fc-rate">
                <div>
                  <div className="t">
                    <span className="stars" aria-hidden="true">{[0,1,2,3,4].map(i=><Star key={i} size={12} fill="var(--star)" color="var(--star)"/>)}</span>
                    4,9
                  </div>
                  <div className="s">128 opinii w Google</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PHOTO STRIP + MARQUEE ═══════════════════════════════ */}
        <div className="strip">
          {[[IMG_REHAB,"Ćwiczenia korekcyjne ramienia pod okiem terapeutki"],[IMG_KNEE,"Terapia manualna mięśni uda"],[IMG_BACK,"Masaż pleców w gabinecie"]].map(([src,alt])=>(
            <figure key={alt}><img src={src} alt={alt} loading="lazy"/></figure>
          ))}
        </div>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0,1].map(ri=>(
              <div key={ri} style={{display:"flex"}}>
                {["Fizjoterapia manualna","Kinesiotaping","Rehabilitacja pooperacyjna","Suche igłowanie","Terapia dna miednicy","Masaż leczniczy","Rezerwacja online"].map(txt=>(
                  <span key={txt} className="marquee-item">{txt}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ══ BODY MAP ════════════════════════════════════════════ */}
        <section id="body-map" className="sec sec-wh">
          <div className="wrap">
            <header className="sec-head fade-in">
              <div>
                <Eyebrow n="01">Mapa ciała</Eyebrow>
                <h2 className="h-sec">Gdzie odczuwasz <em>ból?</em></h2>
              </div>
              <p className="lead">Kliknij obszar na figurze - dopasujemy usługi i terapeutów, którzy specjalizują się w takich dolegliwościach.</p>
            </header>

            <div className="bm-grid">
              <div className="figure-card fade-in">
                <svg viewBox="0 0 180 470" role="group" aria-label="Figura anatomiczna - wybierz obszary bólu">
                  <g fill="#CDE2D4" stroke="#6A9E80" strokeWidth="1.4">
                    <ellipse cx="90" cy="43" rx="24" ry="30"/>
                    <rect x="83" y="70" width="14" height="18" stroke="none"/>
                    <path d="M62 96C60 122 59 164 61 172L119 172C121 164 120 122 118 96Q104 91 90 90Q76 91 62 96Z"/>
                    <path d="M62 170L62 240Q64 256 90 258Q116 256 118 240L118 170Z" fill="#BCD7C6"/>
                    <rect x="36" y="94" width="24" height="78" rx="9" transform="rotate(-4,48,94)"/>
                    <rect x="39" y="170" width="20" height="64" rx="8" fill="#BCD7C6" transform="rotate(3,49,170)"/>
                    <rect x="120" y="94" width="24" height="78" rx="9" transform="rotate(4,132,94)"/>
                    <rect x="121" y="170" width="20" height="64" rx="8" fill="#BCD7C6" transform="rotate(-3,131,170)"/>
                    <rect x="60" y="256" width="26" height="92" rx="10"/>
                    <rect x="94" y="256" width="26" height="92" rx="10"/>
                    <rect x="62" y="344" width="22" height="82" rx="8" fill="#BCD7C6"/>
                    <rect x="96" y="344" width="22" height="82" rx="8" fill="#BCD7C6"/>
                    <ellipse cx="72" cy="432" rx="20" ry="10"/>
                    <ellipse cx="108" cy="432" rx="20" ry="10"/>
                  </g>

                  {SVG_ZONES.map(({id,el,p})=>{
                    const Shape=el
                    const sel=selParts.includes(id), isHov=hov===id
                    const cx = p.cx ?? (p.x + (p.width??0)/2)
                    const cy = p.cy ?? (p.y + (p.height??0)/2)
                    return (
                      <g key={id} className="zone" role="button" tabIndex={0} aria-label={BP[id]} aria-pressed={sel}
                        onClick={()=>togglePart(id)}
                        onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); togglePart(id) } }}
                        onMouseEnter={()=>setHov(id)} onMouseLeave={()=>setHov(null)}
                        onFocus={()=>setHov(id)} onBlur={()=>setHov(null)}>
                        {sel && (
                          <circle cx={cx} cy={cy} r="0" fill="none" stroke="rgba(13,84,66,.5)" strokeWidth="2">
                            <animate attributeName="r" from="0" to="26" dur="1.4s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" from="0.6" to="0" dur="1.4s" repeatCount="indefinite"/>
                          </circle>
                        )}
                        <Shape {...p}
                          fill={sel?"rgba(13,84,66,.6)":isHov?"rgba(13,84,66,.22)":"transparent"}
                          stroke={(sel||isHov)?"#0D5442":"transparent"}
                          strokeWidth={sel?2.5:2}
                          style={{transition:"fill .18s,stroke .18s"}}
                        />
                      </g>
                    )
                  })}
                </svg>

                <div className="hov-label" style={{opacity:hov?1:0}} aria-hidden="true">{hov ? BP[hov] : ""}</div>

                {selParts.length > 0 && (
                  <div className="chips">
                    {selParts.map(id=>(
                      <button key={id} className="chip on" onClick={()=>togglePart(id)} aria-label={`Usuń: ${BP[id]}`}>
                        {BP[id]} <X size={12}/>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div aria-live="polite">
                {!selParts.length ? (
                  <div className="bm-empty fade-in d2">
                    <div className="bm-empty-ic"><MousePointerClick size={24}/></div>
                    <h3>Zacznij od figury obok</h3>
                    <p>Zaznacz jedno lub kilka miejsc. Usługi ułożą się od najlepiej dopasowanej, z ceną i czasem trwania.</p>
                    <p className="mini-label">Najczęściej wybierane</p>
                    <div className="chips">
                      {POPULAR.map(id=>(
                        <button key={id} className="chip" onClick={()=>togglePart(id)}>{BP[id]}</button>
                      ))}
                    </div>
                  </div>
                ):(
                  <div>
                    <p className="bm-for">Usługi dla: <strong>{selParts.map(p=>BP[p]).join(", ")}</strong></p>
                    <div className="matches">
                      {scored.filter(s=>s.covered>0).slice(0,5).map((svc,i)=>(
                        <button key={svc.id} className={`match ${i===0?"best":""}`} onClick={()=>openBook(svc.id)} style={{animationDelay:`${i*.05}s`}}>
                          <div>
                            <div className="match-top">
                              <span className="abbr" aria-hidden="true">{svc.abbr}</span>
                              <span className="match-name">{svc.name}</span>
                              {i===0 && <span className="flag">Najlepsze dopasowanie</span>}
                            </div>
                            <p className="match-desc">{svc.desc}</p>
                            <div className="fit">
                              <span className="bar"><i style={{transform:`scaleX(${svc.pct})`}}/></span>
                              {svc.covered} z {selParts.length} obszarów
                            </div>
                          </div>
                          <div className="match-side">
                            <div className="price">{svc.price} zł</div>
                            <div className="dur"><Clock size={12}/>{svc.dur} min</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="note"><Info size={15}/>Rekomendacje to wstępny filtr, nie diagnoza medyczna. Ostateczny plan terapii ustalamy na pierwszej wizycie.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══ SERVICES ════════════════════════════════════════════ */}
        <section id="uslugi" className="sec">
          <div className="wrap">
            <header className="sec-head fade-in">
              <div>
                <Eyebrow n="02">Oferta</Eyebrow>
                <h2 className="h-sec">Zakres <em>terapii</em></h2>
              </div>
              <p className="lead">Każda wizyta zaczyna się od krótkiego badania funkcjonalnego. Technikę dobieramy dopiero wtedy, gdy wiemy, skąd bierze się ból.</p>
            </header>
            <ol className="svc-list">
              {SVCS.map((svc,i)=>(
                <li key={svc.id} className={`fade-in d${i+1}`}>
                  <button className="svc-btn" onClick={()=>openBook(svc.id)} aria-label={`${svc.name}, ${svc.dur} minut, ${svc.price} zł - umów wizytę`}>
                    <span className="svc-num">{String(i+1).padStart(2,"0")}</span>
                    <span className="svc-name">{svc.name}</span>
                    <span className="svc-desc">{svc.desc}</span>
                    <span className="svc-meta">
                      <span className="price">{svc.price} zł</span>
                      <span className="dur"><Clock size={12}/>{svc.dur} min</span>
                    </span>
                    <span className="svc-arrow" aria-hidden="true"><ArrowUpRight size={20}/></span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══ QUOTE ═══════════════════════════════════════════════ */}
        <figure className="quote">
          <div className="quote-img"><img src={IMG_KNEE} alt="Terapeuta uciska mięsień uda pacjenta" loading="lazy"/></div>
          <div className="quote-body">
            <Quote className="qmark" size={44} strokeWidth={1.25} aria-hidden="true"/>
            <blockquote className="quote-text fade-in">Każdy ból ma swoją przyczynę. Naszym zadaniem jest ją znaleźć i trwale wyeliminować, a nie tylko uśmierzyć.</blockquote>
            <figcaption className="quote-by">Zespół Ruch Manual</figcaption>
          </div>
        </figure>

        {/* ══ THERAPISTS ══════════════════════════════════════════ */}
        <section id="terapeuci" className="sec sec-wh">
          <div className="wrap">
            <header className="sec-head fade-in">
              <div>
                <Eyebrow n="03">Zespół</Eyebrow>
                <h2 className="h-sec">Poznaj <em>terapeutów</em></h2>
              </div>
              <p className="lead">Troje specjalistów z różnymi ścieżkami - od ortopedii po fizjoterapię perinatalną. Wybierz osobę albo zostaw dobór nam.</p>
            </header>
            <div className="th-grid">
              {TH.map((th,i)=>(
                <article key={th.id} className={`th-card fade-in d${i+1}`}>
                  <div className="th-photo">
                    <img src={th.photo} alt={th.name} loading="lazy" style={{objectPosition:th.pos}}/>
                  </div>
                  <div className="th-body">
                    <h3 className="th-name">{th.name}</h3>
                    <p className="th-title">{th.title}</p>
                    <p className="th-bio">{th.bio}</p>
                    <div className="tags">{th.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
                    <button className="text-link" onClick={()=>openBook(null,th.id)}>
                      Zarezerwuj u {th.gen} <ArrowRight size={15}/>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ═════════════════════════════════════════════════ */}
        <section className="cta">
          <div className="wrap cta-in">
            <h2 className="fade-in">Pierwsza wizyta <em>jeszcze w tym tygodniu</em></h2>
            <div className="fade-in d2">
              <p>Wskaż obszar bólu na mapie ciała albo wybierz usługę z listy. Rezerwacja zajmuje około dwóch minut, bez dzwonienia.</p>
              <div className="cta-actions">
                <button className="btn btn-light" onClick={()=>openBook()}>Umów wizytę online <ArrowRight size={17}/></button>
                <a className="text-link on-dark" href="#body-map">Otwórz mapę ciała</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <footer id="kontakt" className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <img className="foot-logo" src={IMG_LOGO} alt="Ruch Manual"/>
              <p className="foot-about">Gabinet fizjoterapii w centrum Krakowa. Specjalizujemy się w fizjoterapii manualnej, rehabilitacji i terapii sportowej.</p>
              <address style={{fontStyle:"normal"}}>
                <div className="foot-c"><MapPin size={15}/>ul. Karmelicka 34/2, 31-128 Kraków</div>
                <a className="foot-c" href="tel:+48123847192"><Phone size={15}/>+48 12 384 71 92</a>
                <a className="foot-c" href="mailto:kontakt@ruchmanual.pl"><Mail size={15}/>kontakt@ruchmanual.pl</a>
              </address>
            </div>
            <div>
              <h3 className="foot-h">Usługi</h3>
              {SVCS.map(s=>(
                <button key={s.id} className="foot-link" onClick={()=>openBook(s.id)}>{s.name}</button>
              ))}
            </div>
            <div>
              <h3 className="foot-h">Godziny otwarcia</h3>
              {[["Pon - Pt","8:00 - 20:00"],["Sobota","9:00 - 14:00"],["Niedziela","Zamknięte"]].map(([d,h])=>(
                <div key={d} className={`hours ${d==="Niedziela"?"closed":""}`}><span>{d}</span><span>{h}</span></div>
              ))}
              <div className="stack">
                <div className="stack-l">Tech stack</div>
                <div className="stack-v">React 19 · Vite<br/>Cloudflare Workers</div>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} Ruch Manual. Wszelkie prawa zastrzeżone.</span>
            <span style={{color:"rgba(255,255,255,.35)"}}>Projekt demonstracyjny - portfolio fullstack</span>
          </div>
        </div>
      </footer>

      {/* ══ BOOKING MODAL ════════════════════════════════════════ */}
      {bookOpen && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&closeBook()}>
          <div ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="book-title" tabIndex={-1}>
            <div className="modal-top">
              <div>
                <h2 id="book-title" className="modal-h">{done ? "Rezerwacja potwierdzona" : "Umów wizytę"}</h2>
                {!done && <p className="modal-sub">Krok {step} z 4</p>}
              </div>
              <button className="close" onClick={closeBook} aria-label="Zamknij"><X size={20}/></button>
            </div>

            {!done && <div className="steps" aria-hidden="true">{[1,2,3,4].map(n=><i key={n} className={n<=step?"on":""}/>)}</div>}

            {/* Step 1 */}
            {!done && step===1 && (
              <div>
                <h3 className="step-h">Wybierz usługę</h3>
                <p className="step-p">{selParts.length ? `Posortowane dla: ${selParts.map(p=>BP[p]).join(", ")}` : "Wszystkie usługi gabinetu"}</p>
                <div className="opts">
                  {scored.map(svc=>(
                    <button key={svc.id} className="opt" aria-pressed={selSvc===svc.id} onClick={()=>{setSelSvc(svc.id);setStep(2)}}>
                      <span className="opt-l">
                        <span className="abbr" aria-hidden="true">{svc.abbr}</span>
                        <span>
                          <span className="opt-name" style={{display:"block"}}>{svc.name}</span>
                          <span className="opt-sub">{svc.dur} min</span>
                        </span>
                      </span>
                      <span className="price" style={{fontSize:18}}>{svc.price} zł</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {!done && step===2 && (
              <div>
                <h3 className="step-h">Wybierz terapeutę</h3>
                <p className="step-p">{svcObj?.name}</p>
                <div className="opts">
                  {thForSvc.map(th=>(
                    <button key={th.id} className="opt" aria-pressed={selTh===th.id} onClick={()=>{setSelTh(th.id);setStep(3)}}>
                      <span className="opt-l">
                        <span className="avatar"><img src={th.photo} alt="" style={{objectPosition:th.pos}}/></span>
                        <span>
                          <span className="opt-name" style={{display:"block"}}>{th.name}</span>
                          <span className="opt-sub">{th.title}</span>
                        </span>
                      </span>
                      <ArrowRight size={16} color="var(--g)"/>
                    </button>
                  ))}
                </div>
                <div className="step-foot">
                  <button className="back-btn" onClick={()=>setStep(1)}><ChevronLeft size={16}/>Wróć</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {!done && step===3 && (
              <div>
                <h3 className="step-h">Wybierz termin</h3>
                <p className="step-p">{thObj?.name} · {svcObj?.dur} min</p>
                <div className="days">
                  {DAYS.map((d,i)=>(
                    <button key={d} className="day" aria-pressed={selDay===i} onClick={()=>{setSelDay(i);setSelSlot(null)}}>{d}</button>
                  ))}
                </div>
                <div className="slots">
                  {TIMES.map((t,i)=>{
                    const lk=(LOCK[thObj?.id]||[]).includes(i)
                    const sel=selSlot===`${selDay}-${i}`
                    return (
                      <button key={t} className="slot" disabled={lk} aria-pressed={sel} aria-label={lk ? `${t}, zajęte` : t}
                        onClick={()=>setSelSlot(`${selDay}-${i}`)}>{t}</button>
                    )
                  })}
                </div>
                <div className="step-foot">
                  <button className="back-btn" onClick={()=>setStep(2)}><ChevronLeft size={16}/>Wróć</button>
                  <button className="btn btn-sm" onClick={()=>setStep(4)} disabled={!selSlot}>Dane kontaktowe <ArrowRight size={15}/></button>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {!done && step===4 && (
              <form onSubmit={e=>{ e.preventDefault(); setTouched({name:true,phone:true}); if(nameOk && phoneOk) setDone(true) }} noValidate>
                <h3 className="step-h" style={{marginBottom:12}}>Dane kontaktowe</h3>
                {[...summary,["Cena",svcObj && `${svcObj.price} zł`]].filter(([,v])=>v).map(([l,v])=>(
                  <div key={l} className="sum"><span>{l}</span><span>{v}</span></div>
                ))}
                <div className="fields">
                  <div className="field">
                    <label htmlFor="f-name">Imię i nazwisko</label>
                    <input id="f-name" className="input" type="text" autoComplete="name" value={fName}
                      onChange={e=>setFName(e.target.value)} onBlur={()=>setTouched(t=>({...t,name:true}))}
                      aria-invalid={touched.name && !nameOk} aria-describedby={touched.name && !nameOk ? "f-name-err" : undefined}/>
                    {touched.name && !nameOk && <p id="f-name-err" className="err">Podaj imię i nazwisko (min. 3 znaki).</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="f-phone">Numer telefonu</label>
                    <input id="f-phone" className="input" type="tel" autoComplete="tel" inputMode="tel" placeholder="np. 512 384 719" value={fPhone}
                      onChange={e=>setFPhone(e.target.value)} onBlur={()=>setTouched(t=>({...t,phone:true}))}
                      aria-invalid={touched.phone && !phoneOk} aria-describedby={touched.phone && !phoneOk ? "f-phone-err" : undefined}/>
                    {touched.phone && !phoneOk && <p id="f-phone-err" className="err">Numer powinien mieć co najmniej 9 cyfr.</p>}
                  </div>
                </div>
                <p className="legal">Dane przetwarzamy zgodnie z RODO wyłącznie w celu realizacji rezerwacji.</p>
                <div className="step-foot">
                  <button type="button" className="back-btn" onClick={()=>setStep(3)}><ChevronLeft size={16}/>Wróć</button>
                  <button type="submit" className="btn btn-sm">Potwierdź rezerwację</button>
                </div>
              </form>
            )}

            {/* Confirmation */}
            {done && (
              <div className="done">
                <div className="done-ic"><Check size={32} strokeWidth={2.5}/></div>
                <p>
                  Wysłaliśmy SMS z potwierdzeniem na numer {fPhone}.<br/>
                  Do zobaczenia, <strong style={{color:"var(--ink)"}}>{fName.trim().split(" ")[0]}</strong>.
                </p>
                <div className="done-sum">
                  {summary.map(([l,v])=>(
                    <div key={l}><span>{l}</span><span>{v}</span></div>
                  ))}
                </div>
                <button className="btn" onClick={closeBook}>Zamknij</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

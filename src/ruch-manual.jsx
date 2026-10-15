import { useState, useEffect, useMemo, useRef } from "react"
import { ArrowRight, ArrowUp, Check, Menu, X } from "lucide-react"
import IMG_BACK from "./assets/back.jpg"
import IMG_KNEE from "./assets/knee.jpg"
import IMG_THERAPY from "./assets/therapy.jpg"
import IMG_REHAB from "./assets/rehab.jpg"
import IMG_LOGO from "./assets/logo.svg"
import IMG_PLATE from "./assets/found/dagoty-posterior.jpg"
import IMG_STREET from "./assets/found/karmelicka.jpg"

const SVCS = [
  {id:"fizjo",  group:"manual", name:"Fizjoterapia manualna", dur:50, price:180,
    desc:"Mobilizacja stawów kręgosłupa i kończyn metodą Kaltenborna-Evjentha, praca na tkankach miękkich.",
    map:{head:1,shoulder_l:3,upper_back:3,lower_back:3,hip_l:2,knee_l:2}},
  {id:"masaz",  group:"manual", name:"Masaż leczniczy", dur:60, price:150,
    desc:"Głęboki masaż mięśniowo-powięziowy, który zmniejsza napięcie i przywraca zakres ruchu.",
    map:{shoulder_l:2,upper_back:3,lower_back:3,hip_l:1,head:1}},
  {id:"iglo",   group:"manual", name:"Suche igłowanie", dur:45, price:130,
    desc:"Dezaktywacja mięśniowych punktów spustowych igłami akupunkturowymi.",
    map:{lower_back:3,upper_back:2,shoulder_l:2,hip_l:1,head:2}},
  {id:"rehab",  group:"rehab", name:"Rehabilitacja pooperacyjna", dur:60, price:200,
    desc:"Powrót do sprawności po zabiegach ortopedycznych kolana, biodra i kręgosłupa.",
    map:{knee_l:3,hip_l:3,ankle_l:2,lower_back:1}},
  {id:"kinezjo",group:"rehab", name:"Kinesiotaping", dur:30, price:100,
    desc:"Taśmowanie funkcjonalne, które stabilizuje staw i odciąża przeciążone mięśnie.",
    map:{knee_l:3,ankle_l:3,shoulder_l:2}},
  {id:"dno",    group:"rehab", name:"Terapia dna miednicy", dur:50, price:160,
    desc:"Terapia mięśni głębokich miednicy, w tym po porodzie i przy bólu krzyża.",
    map:{hip_l:2,lower_back:1}},
]

const GROUPS = [["manual","Terapia manualna"],["rehab","Rehabilitacja"]]

// Orientacyjne normy zakresu ruchu u dorosłych; x/y to miejsce stawu na rycinie d'Agoty
const JOINTS = [
  {id:"szyja",   name:"Szyja",   key:"head",       deg:80,  move:"Skręt głowy w bok",           x:.392, y:.215},
  {id:"bark",    name:"Bark",    key:"shoulder_l", deg:180, move:"Uniesienie ręki w przód",     x:.462, y:.262},
  {id:"ledzwie", name:"Lędźwie", key:"lower_back", deg:60,  move:"Skłon tułowia w przód",       x:.39,  y:.43},
  {id:"biodro",  name:"Biodro",  key:"hip_l",      deg:120, move:"Zgięcie biodra",              x:.335, y:.455},
  {id:"kolano",  name:"Kolano",  key:"knee_l",     deg:135, move:"Zgięcie kolana",              x:.355, y:.70},
  {id:"kostka",  name:"Kostka",  key:"ankle_l",    deg:20,  move:"Zgięcie stopy ku górze",      x:.365, y:.925},
]

const TH = [
  {id:"ak",name:"Anna Kowalska",gen:"Anny",title:"mgr fizjoterapii, cert. OMT",
    bio:"Osiem lat w fizjoterapii manualnej. Absolwentka AWF Kraków, terapeutka Ortopedycznej Terapii Manualnej.",
    focus:"Kręgosłup, barki, rehabilitacja",svcs:["fizjo","masaz","iglo"]},
  {id:"pn",name:"Piotr Nowak",gen:"Piotra",title:"dr n. med., spec. ortopedii",
    bio:"Specjalista rehabilitacji po operacjach kolana i biodra. Publikuje w European Journal of Physiotherapy.",
    focus:"Kolano, biodro, po operacji",svcs:["fizjo","rehab","kinezjo"]},
  {id:"mw",name:"Marta Wiśniewska",gen:"Marty",title:"mgr fizjoterapii, cert. kinesiotaping",
    bio:"Terapeutka dna miednicy i kinesiotapingu. Pracuje ze sportowcami i z kobietami w okresie okołoporodowym.",
    focus:"Taping, sport, dno miednicy",svcs:["kinezjo","masaz","dno"]},
]

const STAGES = [
  {name:"Rozmowa", min:10, text:"Zaczynamy od wywiadu. Weź ze sobą wyniki badań i opisy zdjęć, jeśli je masz.", img:null, asks:["Kiedy boli?","Co pomaga?","Co pogarsza?","Od kiedy?"]},
  {name:"Pomiar", min:10, text:"Goniometrem mierzymy zakres ruchu w stopniach i sprawdzamy siłę mięśni. To punkt odniesienia na kolejne wizyty.", img:IMG_REHAB, alt:"Terapeutka sprawdza zakres uniesienia ramienia pacjentki"},
  {name:"Terapia", min:25, text:"Techniki dobrane do wyniku pomiaru: mobilizacja stawów, praca na tkankach miękkich, czasem igłowanie albo taping.", img:IMG_KNEE, alt:"Dłonie terapeuty uciskają mięsień uda"},
  {name:"Plan do domu", min:5, text:"Wychodzisz z kartką trzech, czterech ćwiczeń na najbliższe dni i z terminem kontroli.", img:IMG_THERAPY, alt:"Terapeutka prowadzi ćwiczenie biodra pacjentki leżącej na stole"},
]

const TIMES = ["09:00","09:50","10:40","11:30","13:00","13:50","14:40","15:30","16:20"]
const LOCK = {ak:[1,4,7],pn:[0,3,6],mw:[2,5]}

// Najbliższe trzy dni robocze (bez niedziel), żeby terminy w demo zawsze wyglądały aktualnie
const DAYS = (() => {
  const out = [], d = new Date()
  const fmt = new Intl.DateTimeFormat("pl-PL",{weekday:"long",day:"numeric",month:"long"})
  while(out.length < 3){
    d.setDate(d.getDate()+1)
    if(d.getDay() !== 0) out.push(fmt.format(d))
  }
  return out
})()

const NAV = [["Gdzie boli","gdzie-boli"],["Cennik","cennik"],["Zespół","zespol"],["Dojazd","dojazd"]]

const CREDITS = [
  ["Arnauld Éloi Gautier d'Agoty, Posterior View of Muscle Man, 1773","domena publiczna (CC0), Art Institute of Chicago","https://www.artic.edu/artworks/149518"],
  ["Igor123121, Karmelicka street, view to S, 2025","CC BY 4.0, Wikimedia Commons","https://commons.wikimedia.org/wiki/File:Karmelicka_street,_view_to_S,_2025,_Krak%C3%B3w,_Poland.jpg"],
  ["Reiseandenken, Tram in Krakow (wideo)","CC BY 3.0, Wikimedia Commons","https://commons.wikimedia.org/wiki/File:Tram_in_Krakow_(Full_HD_Video).webm"],
]

// Tarcza czasu wizyty: wycinek godziny, jak goniometr dla stawu
function Dial({min}) {
  const a = min / 60 * 360
  if(a >= 360) return <svg className="dial" viewBox="-50 -50 100 100" aria-hidden="true"><circle r="50" className="dial-fill"/></svg>
  const rad = (a - 90) * Math.PI / 180
  const d = `M0 0V-50A50 50 0 ${a > 180 ? 1 : 0} 1 ${(50*Math.cos(rad)).toFixed(2)} ${(50*Math.sin(rad)).toFixed(2)}Z`
  return (
    <svg className="dial" viewBox="-50 -50 100 100" aria-hidden="true">
      <circle r="50" className="dial-track"/>
      <path d={d} className="dial-fill"/>
    </svg>
  )
}

// Wycinek koła jako wielokąt clip-path, w procentach pudełka tarczy
function sectorPolygon(a0, a1) {
  const pts = ["50% 50%"], n = 48
  for(let i = 0; i <= n; i++){
    const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180
    pts.push(`${(50 + 50.5*Math.cos(a)).toFixed(2)}% ${(50 + 50.5*Math.sin(a)).toFixed(2)}%`)
  }
  return `polygon(${pts.join(",")})`
}

const HERO_FROM = 180, HERO_TO = 315

const CSS = `
  .rm{
    --bg:#dce6df;--surface:#cfdcd3;--ink:#0b3a2e;--muted:#3e5c51;
    --on-ink:#dce6df;--track:#bccfc3;--on-ink-muted:#9cc0b0;--ink-2:#145140;--card-field:#edf3ef;--err:#a3271c;
    --t1:#0b3a2e;--t2:#145140;--t3:#2a6b56;--t4:#9cc0b0;
    --font:"Hanken Grotesk",system-ui,"Segoe UI",sans-serif;
    --step-small:clamp(.8125rem,.79rem + .1vw,.875rem);
    --step-body:clamp(1.0625rem,1rem + .25vw,1.1875rem);
    --step-lead:clamp(1.25rem,1.1rem + .7vw,1.625rem);
    --step-head:clamp(2rem,1.3rem + 3.2vw,4rem);
    --step-display:clamp(3.4rem,6.4vw,6.25rem);
    --m:clamp(16px,2.2vw,32px);
    --gap-section:clamp(120px,14vw,200px);
    --ease-out:cubic-bezier(.22,1,.36,1);
    --ease-in-out:cubic-bezier(.65,0,.35,1);
    --z-nav:50;--z-skip:100;
    font-family:var(--font);font-size:var(--step-body);line-height:1.45;letter-spacing:-.005em;
    font-weight:400;background:var(--bg);color:var(--ink);overflow-x:clip;
    font-variant-numeric:tabular-nums;
  }
  .rm h1,.rm h2,.rm h3{font-weight:500;letter-spacing:-.04em;line-height:.95;text-wrap:balance}
  .rm p{max-width:62ch;text-wrap:pretty}
  .rm a:not(.btn):not(.skip){color:inherit}
  .rm :focus-visible{outline:3px solid currentColor;outline-offset:3px}
  .rm ::selection{background:var(--ink);color:var(--on-ink)}
  .rm section[id]{scroll-margin-top:72px}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  .skip{position:fixed;left:var(--m);top:-80px;z-index:var(--z-skip);padding:12px 18px;background:var(--ink);color:var(--on-ink);text-decoration:none;transition:top .2s}
  .skip:focus{top:12px}



  /* Motyw: ćwiartka koła. Ten sam łuk tnie przyciski, zdjęcia i punktory. */
  .q{border-top-right-radius:100%;overflow:hidden}
  .btn{display:inline-flex;align-items:center;gap:12px;min-height:56px;padding:0 40px 0 24px;border:0;border-top-right-radius:999px;background:var(--ink);color:var(--on-ink);font:inherit;font-weight:500;text-decoration:none;cursor:pointer;transition:transform .15s var(--ease-out),background-color .2s,color .2s}
  .btn:active{transform:scale(.97)}
  .btn.light{background:var(--on-ink);color:var(--ink)}
  .btn svg{transition:transform .25s var(--ease-out)}
  .tlink{display:inline-flex;align-items:center;gap:8px;padding:6px 0;border:0;background:none;color:inherit;font:inherit;font-weight:500;cursor:pointer;text-decoration:underline;text-decoration-color:transparent;text-underline-offset:.22em;text-decoration-thickness:.08em;transition:text-decoration-color .2s}
  @media (hover:hover) and (pointer:fine){
    .btn:hover{background:var(--ink-2)}
    .btn.light:hover{background:#fff}
    .btn:hover svg,.tlink:hover svg{transform:translateX(4px)}
    .tlink:hover{text-decoration-color:currentColor}
  }

  /* Nawigacja */
  .nav{position:sticky;top:0;z-index:var(--z-nav);display:flex;align-items:center;justify-content:space-between;gap:24px;height:72px;padding:0 var(--m);background:var(--bg);transition:background-color .3s}
  .brand{display:flex;align-items:center;gap:12px;color:var(--ink);font-size:var(--step-lead);font-weight:500;letter-spacing:-.04em;text-decoration:none;white-space:nowrap}
  .mark{width:40px;height:40px;background:currentColor;-webkit-mask:url(${IMG_LOGO}) center/contain no-repeat;mask:url(${IMG_LOGO}) center/contain no-repeat;flex-shrink:0}
  .nav-r{display:flex;align-items:center;gap:clamp(16px,2.4vw,36px)}
  .nav-links{display:flex;gap:clamp(16px,2vw,32px);list-style:none}
  .nav-links a{text-decoration:underline;text-decoration-color:transparent;text-underline-offset:.3em;text-decoration-thickness:.08em;transition:text-decoration-color .2s}
  .nav-links a:hover,.nav-links a[aria-current="true"]{text-decoration-color:currentColor}
  .nav .btn{min-height:48px;padding:0 32px 0 20px}
  .menu-btn{display:none;align-items:center;gap:8px;min-height:44px;padding:0 4px;border:0;background:none;color:inherit;font:inherit;font-weight:500;cursor:pointer}
  .mmenu{position:fixed;inset:72px 0 auto;z-index:var(--z-nav);display:grid;padding:8px var(--m) 24px;background:var(--bg)}
  .mmenu a{display:flex;align-items:center;justify-content:space-between;min-height:60px;font-size:var(--step-head);letter-spacing:-.04em;text-decoration:none}

  /* Hero */
  .hero{position:relative;min-height:calc(100svh - 72px);display:grid;align-items:center;overflow:hidden;padding:48px var(--m) 72px}
  .hero-disc{position:absolute;left:85%;top:55%;width:min(120vh,70vw);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:var(--ink)}
  .hero-wedge{position:absolute;inset:0;overflow:hidden}
  .hero-wedge img{position:absolute;left:-5%;top:-40%;width:90%;height:160%;max-width:none;object-fit:cover;transform-origin:40% 35%;transition:transform 1.5s var(--ease-out)}
  .js .hero-disc:not(.open) .hero-wedge img{transform:scale(1.12)}
  .hero-copy{position:relative;max-width:min(44vw,640px)}
  .hero h1{font-size:var(--step-display);line-height:.9;letter-spacing:-.05em;margin-bottom:32px}
  .hero-p{font-size:var(--step-lead);line-height:1.3;letter-spacing:-.015em;max-width:30ch;margin-bottom:40px}
  .hero-meta{margin-top:40px;color:var(--muted);font-size:var(--step-small)}

  /* Gdzie boli */
  .joints{background:var(--ink);color:var(--on-ink);padding:var(--gap-section) var(--m)}
  .joints-grid{display:grid;grid-template-columns:minmax(0,.9fr) auto minmax(0,1fr);gap:clamp(24px,4vw,64px);align-items:end}
  .jlist{list-style:none}
  .jlist .jh{font-size:var(--step-head);line-height:1.05;color:var(--on-ink-muted);margin-bottom:6px}
  .jbtn{display:flex;align-items:center;gap:16px;padding:0;border:0;background:none;color:var(--on-ink-muted);font:inherit;font-size:var(--step-head);font-weight:500;letter-spacing:-.04em;line-height:1.12;cursor:pointer;transition:color .2s}
  .jbtn[aria-pressed="true"]{color:var(--on-ink)}
  .jbtn i{width:.42em;height:.42em;background:currentColor;border-top-right-radius:100%;opacity:0;transform:scale(.6);transition:transform .35s var(--ease-out),opacity .2s}
  .jbtn[aria-pressed="true"] i{opacity:1;transform:none}
  @media (hover:hover) and (pointer:fine){.jbtn:hover{color:var(--on-ink)}}
  .gonio{position:relative;width:min(64vh,40vw);aspect-ratio:1;align-self:center}
  .gonio-plate{position:absolute;inset:9%;border-radius:50%;overflow:hidden;background:#5c5a3c}
  .gonio-plate img{position:absolute;left:50%;top:50%;width:330%;max-width:none;height:auto;transition:transform .8s var(--ease-in-out)}
  .gonio svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
  .gonio .track{stroke:var(--ink-2)}
  .gonio .arc{stroke:var(--on-ink);transition:stroke-dashoffset .9s var(--ease-in-out)}
  .jfact .deg{display:block;font-size:var(--step-display);font-weight:500;letter-spacing:-.05em;line-height:.9;margin-bottom:16px}
  .jfact .move{font-size:var(--step-lead);letter-spacing:-.015em;line-height:1.3;margin-bottom:12px}
  .jfact p{margin-bottom:28px;max-width:40ch}
  .jfact .for{font-size:var(--step-small);color:var(--on-ink-muted);margin-bottom:8px}
  .jsvcs{list-style:none;display:grid;gap:4px;margin-bottom:28px}
  .jsvc{display:flex;justify-content:space-between;align-items:baseline;gap:16px;width:100%;max-width:440px;min-height:48px;padding:8px 0;border:0;background:none;color:var(--on-ink);font:inherit;text-align:left;cursor:pointer}
  .jsvc span:first-child{display:flex;align-items:center;gap:12px;font-weight:500}
  .jsvc i{width:12px;height:12px;background:currentColor;border-top-right-radius:100%;flex-shrink:0}
  .jsvc .pr{color:var(--on-ink-muted);white-space:nowrap}
  @media (hover:hover) and (pointer:fine){.jsvc:hover span:first-child{text-decoration:underline;text-underline-offset:.22em;text-decoration-thickness:.08em}}
  .jnote{font-size:var(--step-small);color:var(--on-ink-muted)}

  /* Cennik */
  .price{padding:calc(var(--gap-section) * .6) var(--m) calc(var(--gap-section) * .5)}
  .price-head{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:0 24px;align-items:end;margin-bottom:24px}
  .price-head h2{grid-column:1/6;font-size:var(--step-display);line-height:.9;letter-spacing:-.05em}
  .price-head p{grid-column:7/12;font-size:var(--step-lead);line-height:1.3;letter-spacing:-.015em}
  .cat{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin:80px 0 40px}
  .cat h3{font-size:var(--step-head)}
  .cat span{color:var(--muted)}
  .cats{display:grid;grid-template-columns:1fr 1fr;gap:0 64px}
  .items{display:grid;gap:36px;list-style:none}
  .item{display:grid;grid-template-columns:64px minmax(0,1fr);gap:20px;align-items:start;width:100%;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
  .dial{width:64px;height:64px;transition:transform .45s var(--ease-out)}
  .dial-track{fill:var(--track)}
  .dial-fill{fill:var(--ink)}
  .item-top{display:flex;justify-content:space-between;align-items:baseline;gap:16px;font-weight:500;margin-bottom:4px}
  .item-top .nm{text-decoration:underline;text-decoration-color:transparent;text-underline-offset:.22em;text-decoration-thickness:.08em;transition:text-decoration-color .2s}
  .item p{max-width:42ch;margin-bottom:6px}
  .item .dur{color:var(--muted);font-size:var(--step-small)}
  .item:active .dial{transform:scale(.94)}
  @media (hover:hover) and (pointer:fine){.item:hover .dial{transform:rotate(30deg)}.item:hover .nm{text-decoration-color:currentColor}}

  /* Pierwsza wizyta */
  .visit{padding:calc(var(--gap-section) * .5) var(--m) var(--gap-section)}
  .visit-head{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:0 24px;align-items:end;margin-bottom:64px}
  .visit-head h2{grid-column:1/6;font-size:var(--step-head)}
  .visit-head p{grid-column:7/12}
  .acc{display:flex;height:540px}
  .stage{position:relative;flex:1 1 0;min-width:0;overflow:hidden;transition:flex-grow .45s var(--ease-in-out)}
  .stage.open{flex-grow:5.2}
  .stage:nth-child(1){background:var(--t1);color:var(--on-ink)}
  .stage:nth-child(2){background:var(--t2);color:var(--on-ink)}
  .stage:nth-child(3){background:var(--t3);color:var(--on-ink)}
  .stage:nth-child(4){background:var(--t4);color:var(--ink)}
  .stage-btn{position:absolute;inset:0;width:100%;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
  .stage-btn .vert{position:absolute;left:24px;bottom:24px;transform-origin:left bottom;transform:rotate(-90deg) translateY(100%);white-space:nowrap;font-size:var(--step-lead);font-weight:500;letter-spacing:-.02em;transition:opacity .25s}
  .stage.open .stage-btn{pointer-events:none}
  .stage.open .stage-btn .vert{opacity:0}
  .stage-body{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);opacity:0;visibility:hidden;transition:opacity .35s .1s}
  .stage.open .stage-body{opacity:1;visibility:visible}
  .stage-txt{display:flex;flex-direction:column;justify-content:space-between;padding:32px;min-width:320px}
  .stage-txt h3{font-size:var(--step-head)}
  .stage-txt .min{display:block;font-size:var(--step-lead);font-weight:500;letter-spacing:-.02em;margin-top:12px}
  .stage-txt p{max-width:36ch}
  .stage-img{position:relative;overflow:hidden}
  .stage-asks{list-style:none;display:flex;flex-direction:column;justify-content:center;gap:4px;padding:32px;font-size:var(--step-head);font-weight:500;letter-spacing:-.04em;line-height:1.05}
  .stage-asks li:nth-child(even){color:var(--on-ink-muted)}
  .stage-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-top-left-radius:100% 60%}

  /* Zespół */
  .team{margin:0 20px;background:var(--ink);color:var(--on-ink);border-radius:0;position:relative;overflow:hidden;min-height:110svh;display:grid;grid-template-columns:minmax(0,.62fr) minmax(0,.38fr)}
  .team-l{position:relative;padding:56px}
  .team-l h2{font-size:var(--step-head)}
  .team-photo{position:absolute;left:56px;bottom:-12%;width:min(38vw,620px);aspect-ratio:1;border-top-right-radius:100%;overflow:hidden}
  .team-photo img{width:100%;height:100%;object-fit:cover;object-position:center 22%}
  .team-r{padding:56px 56px 72px 0;display:flex;flex-direction:column;gap:48px}
  .person h3{font-size:var(--step-lead);letter-spacing:-.02em;line-height:1.15}
  .person .tt{color:var(--on-ink-muted);font-size:var(--step-small);margin:4px 0 12px}
  .person p{margin-bottom:8px}
  .person .fc{color:var(--on-ink-muted);margin-bottom:6px}

  /* Rezerwacja */
  .book{background:var(--ink);color:var(--on-ink);padding:var(--gap-section) var(--m) calc(var(--gap-section) * .6);margin-top:var(--gap-section)}
  .coupon{position:relative;display:grid;grid-template-columns:46fr 54fr;max-width:1280px;margin:0 auto;background:var(--on-ink);color:var(--ink)}
  .coupon::before,.coupon::after{content:"";position:absolute;left:46%;width:28px;height:28px;margin-left:-14px;border-radius:50%;background:var(--ink)}
  .coupon::before{top:-14px}
  .coupon::after{bottom:-14px}
  .coupon-l{display:flex;flex-direction:column;justify-content:space-between;gap:32px;padding:48px;border-right:5px dotted var(--ink)} /* taste-skill-ignore: perforacja karty-formularza */
  .coupon-l h2{font-size:var(--step-head);margin-bottom:20px}
  .coupon-p{max-width:30ch}
  .coupon-sum{display:grid;gap:6px}
  .coupon-sum div{display:flex;justify-content:space-between;gap:16px}
  .coupon-sum span:first-child{color:var(--muted)}
  .coupon-r{padding:48px;display:grid;gap:10px;align-content:start}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .fld label{display:block;margin-bottom:4px;font-size:var(--step-small);color:var(--muted)}
  .fld select,.fld input{width:100%;min-height:52px;padding:0 14px;border:0;border-radius:0;background:var(--card-field);color:var(--ink);font:inherit;appearance:none;-webkit-appearance:none}
  .fld select{background-image:none;cursor:pointer}
  .fld input::placeholder{color:var(--muted)}
  .fld [aria-invalid="true"]{outline:2px solid var(--err);outline-offset:-2px}
  .fld .err{margin-top:4px;color:var(--err);font-size:var(--step-small)}
  .fld select:focus-visible,.fld input:focus-visible{outline:3px solid var(--ink);outline-offset:-3px}
  .submit{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:56px;margin-top:6px;padding:0 40px 0 20px;border:0;border-top-right-radius:999px;background:var(--ink);color:var(--on-ink);font:inherit;font-weight:500;cursor:pointer;transition:transform .15s var(--ease-out),background-color .2s}
  .submit:active{transform:scale(.985)}
  @media (hover:hover) and (pointer:fine){.submit:hover{background:var(--ink-2)}}
  .legal{font-size:var(--step-small);color:var(--muted);margin-top:4px}
  .done{padding:48px;display:flex;flex-direction:column;justify-content:center;gap:16px}
  .done-ic{display:grid;place-items:center;width:64px;height:64px;background:var(--ink);color:var(--on-ink);border-top-right-radius:100%}
  .done h3{font-size:var(--step-head)}

  .route{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:0 24px;align-items:start;max-width:1280px;margin:var(--gap-section) auto 0}
  .route-txt{grid-column:1/5}
  .route-txt h2{font-size:var(--step-head);margin-bottom:24px}
  .route-txt p{margin-bottom:16px}
  .route-txt .mut{color:var(--on-ink-muted)}
  .route-pics{grid-column:6/13;position:relative;padding-bottom:10%}
  .route-street{width:100%;aspect-ratio:16/9;object-fit:cover;border-top-right-radius:100% 60%}
  .route-tram{position:absolute;left:-12%;bottom:0;width:42%;aspect-ratio:1;border-top-right-radius:100%;overflow:hidden;background:var(--ink-2)}
  .route-tram video{width:100%;height:100%;object-fit:cover;object-position:32% center}

  /* Stopka */
  .foot{padding:96px var(--m) 32px}
  .blocks{display:flex;align-items:flex-end;gap:4px;height:34svh;min-height:220px;margin-bottom:56px}
  .blk{flex:1;display:flex;align-items:flex-end;background:var(--ink);color:var(--bg);overflow:hidden}
  .blk:last-child{border-top-right-radius:100%}
  .blk span{font-size:min(30svh,17vw);font-weight:500;letter-spacing:-.06em;line-height:.74;padding:0 0 0 .04em}
  .foot-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:40px 24px;margin-bottom:56px}
  .foot-col{grid-column:span 3}
  .foot-col h3{font-size:var(--step-body);letter-spacing:-.005em;line-height:1.45;margin-bottom:12px}
  .foot-col ul{list-style:none;display:grid;gap:6px}
  .foot-col a{text-decoration:underline;text-decoration-color:transparent;text-underline-offset:.22em;transition:text-decoration-color .2s}
  .foot-col a:hover{text-decoration-color:currentColor}
  .hours{display:flex;justify-content:space-between;gap:12px;max-width:260px}
  .credits{font-size:var(--step-small);color:var(--muted);margin-bottom:32px;max-width:none}
  .credits a{text-underline-offset:.2em}
  .foot-bottom{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;font-size:var(--step-small);color:var(--muted)}
  .foot-bottom .btn{min-height:44px;padding:0 28px 0 16px;font-size:var(--step-small)}

  /* Ruch: wejścia sekcji */
  @media (prefers-reduced-motion:no-preference){
    .js .rv{opacity:0;transform:translateY(24px);transition:opacity .7s var(--ease-out),transform .7s var(--ease-out);transition-delay:calc(var(--i,0) * 75ms)}
    .js .rv.in{opacity:1;transform:none}
  }
  @media (prefers-reduced-motion:reduce){
    .rm *{transition-duration:.01ms!important;animation-duration:.01ms!important}
  }

  /* Tablet */
  @media (max-width:1100px){
    .joints-grid{grid-template-columns:1fr 1fr;align-items:start}
    .jlist{grid-column:1}
    .gonio{grid-column:2;grid-row:1/3;width:min(48vw,520px)}
    .jfact{grid-column:1}
    .team{grid-template-columns:1fr;min-height:0}
    .team-l{padding:48px 40px 0}
    .team-photo{position:relative;left:auto;bottom:auto;width:min(70vw,520px);margin:0 40px -14%}
    .team-r{padding:48px 40px 64px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}
  }
  @media (max-width:900px){
    .nav-links{display:none}
    .menu-btn{display:inline-flex}
    .hero{align-items:start;padding-top:12svh;min-height:calc(100svh - 72px)}
    .hero-disc{left:50%;top:calc(56svh + 65vw);width:130vw}
    .hero-copy{max-width:none}
    .hero h1{font-size:var(--step-display)}
    .hero-p{font-size:var(--step-body);margin-bottom:28px}
    .hero-meta{display:none}
    .price-head h2,.price-head p,.visit-head h2,.visit-head p{grid-column:1/-1}
    .price-head p,.visit-head p{margin-top:20px}
    .cats{grid-template-columns:1fr}
    .acc{flex-direction:column;height:auto}
    .stage{flex:none;min-height:64px}
    .stage-btn{position:relative;inset:auto;min-height:64px;padding:0 20px}
    .stage-btn .vert{position:static;transform:none;display:flex;align-items:center;min-height:64px;font-size:var(--step-body)}
    .stage.open .stage-btn{display:none}
    .stage-body{position:static;display:none;grid-template-columns:1fr}
    .stage.open .stage-body{display:grid}
    .stage-txt{min-width:0;padding:24px 20px}
    .stage-txt p{margin-top:16px}
    .stage-img{height:240px}
    .stage-asks{padding:0 20px 24px;font-size:var(--step-head)}
    .team{margin:0 10px}
    .team-l{padding:40px 20px 0}
    .team-r{grid-template-columns:1fr;padding:32px 20px 48px}
    .team-photo{width:86vw;margin:0 auto -22%}
    .coupon{grid-template-columns:1fr}
    .coupon::before,.coupon::after{left:auto;top:auto;margin:0}
    .coupon::before{left:-14px;top:var(--perf,240px)}
    .coupon::after{right:-14px;top:var(--perf,240px)}
    .coupon-l{border-right:0;border-bottom:5px dotted var(--ink);padding:32px 20px} /* taste-skill-ignore: perforacja karty-formularza */
    .coupon-r,.done{padding:32px 20px}
    .route-txt,.route-pics{grid-column:1/-1}
    .route-pics{margin-top:40px;padding-bottom:24%}
    .route-tram{left:auto;right:0;width:46%}
    .foot-col{grid-column:span 6}
  }
  @media (max-width:640px){
    .brand{font-size:var(--step-body);gap:8px}
    .mark{width:32px;height:32px}
    .nav-long{display:none}
    .joints-grid{grid-template-columns:1fr}
    .gonio{grid-column:1;grid-row:1;width:86vw;justify-self:center}
    .jlist{display:flex;gap:24px;overflow-x:auto;padding-bottom:8px;scroll-snap-type:x proximity;margin:0 calc(var(--m) * -1);padding-left:var(--m);padding-right:var(--m)}
    .jlist li{scroll-snap-align:start}
    .jlist .jh{display:none}
    .jbtn{font-size:var(--step-head);white-space:nowrap}
    .row2{grid-template-columns:1fr}
    .blocks{height:22svh;min-height:140px}
    .foot-col{grid-column:1/-1}
  }
`

export default function RuchManual() {
  const [menuOpen,setMenuOpen] = useState(false)
  const [active,setActive]     = useState(null)
  const [joint,setJoint]       = useState("kolano")
  const [stage,setStage]       = useState(0)
  const [form,setForm]         = useState({svc:"fizjo",th:"ak",day:0,time:"",name:"",phone:""})
  const [touched,setTouched]   = useState({})
  const [done,setDone]         = useState(false)
  const [wedge,setWedge]       = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion:no-preference)").matches ? HERO_FROM + 1 : HERO_TO)
  const discRef = useRef(null)
  const videoRef = useRef(null)

  // Podpis: wycinek w hero otwiera się jak staw w zakresie ruchu
  useEffect(() => {
    if(wedge >= HERO_TO) { discRef.current?.classList.add("open"); return }
    let raf = 0, t0 = 0
    const ease = t => 1 - Math.pow(1 - t, 4)
    const step = now => {
      if(!t0) t0 = now
      const t = Math.min(1, (now - t0) / 1300)
      setWedge(HERO_FROM + 1 + (HERO_TO - HERO_FROM - 1) * ease(t))
      if(t < 1) raf = requestAnimationFrame(step)
    }
    const start = setTimeout(() => { discRef.current?.classList.add("open"); raf = requestAnimationFrame(step) }, 250)
    return () => { clearTimeout(start); cancelAnimationFrame(raf) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  // Wejścia elementów sekcji
  useEffect(() => {
    const obs = new IntersectionObserver(es => es.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add("in"); obs.unobserve(e.target) }
    }),{threshold:.12, rootMargin:"0px 0px -5% 0px"})
    document.querySelectorAll(".rv").forEach(el => obs.observe(el))
    return () => obs.disconnect()
  },[])

  // Aktywna pozycja w nawigacji
  useEffect(() => {
    const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) setActive(e.target.id) }),
      {rootMargin:"-45% 0px -50% 0px"})
    NAV.forEach(([,id]) => { const el = document.getElementById(id); if(el) obs.observe(el) })
    return () => obs.disconnect()
  },[])

  // Pętla wideo gra tylko na ekranie i bez ograniczenia ruchu
  useEffect(() => {
    const v = videoRef.current
    if(!v || !window.matchMedia("(prefers-reduced-motion:no-preference)").matches) return
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) v.play().catch(()=>{}); else v.pause() },{threshold:.2})
    obs.observe(v)
    return () => obs.disconnect()
  },[])

  useEffect(() => {
    if(!menuOpen) return
    const key = e => { if(e.key === "Escape") setMenuOpen(false) }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  },[menuOpen])

  const J = JOINTS.find(j => j.id === joint)
  const jointSvcs = useMemo(() =>
    SVCS.filter(s => s.map[J.key]).sort((a,b) => b.map[J.key] - a.map[J.key]).slice(0,3)
  ,[J])

  const svcObj = SVCS.find(s => s.id === form.svc)
  const thForSvc = TH.filter(t => t.svcs.includes(form.svc))
  const thObj = TH.find(t => t.id === form.th)
  const freeTimes = TIMES.filter((_,i) => !(LOCK[form.th]||[]).includes(i))
  const nameOk = form.name.trim().length >= 3
  const phoneOk = form.phone.replace(/\D/g,"").length >= 9

  const set = patch => setForm(f => {
    const next = {...f, ...patch}
    const ths = TH.filter(t => t.svcs.includes(next.svc))
    if(!ths.some(t => t.id === next.th)) next.th = ths[0].id
    if(next.time && (LOCK[next.th]||[]).includes(TIMES.indexOf(next.time))) next.time = ""
    return next
  })
  const book = patch => {
    if(patch) set(patch)
    setDone(false)
    setMenuOpen(false)
    document.getElementById("rezerwacja")?.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth"})
  }
  const submit = e => {
    e.preventDefault()
    setTouched({name:true,phone:true,time:true})
    if(nameOk && phoneOk && form.time) setDone(true)
  }

  const R = 45, C = 2 * Math.PI * R

  return (
    <div className="rm">
      <style>{CSS}</style>
      <a className="skip" href="#main">Przejdź do treści</a>

      <header className="nav">
        <a className="brand" href="#main" aria-label="Ruch Manual, początek strony"><span className="mark" aria-hidden="true"/>Ruch Manual</a>
        <nav className="nav-r" aria-label="Główna nawigacja">
          <ul className="nav-links">
            {NAV.map(([l,id]) => <li key={id}><a href={`#${id}`} aria-current={active===id || undefined}>{l}</a></li>)}
          </ul>
          <button className="menu-btn" onClick={()=>setMenuOpen(o=>!o)} aria-expanded={menuOpen} aria-controls="mmenu">
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}Menu
          </button>
          <a className="btn" href="#rezerwacja"><span>Umów<span className="nav-long"> wizytę</span></span></a>
        </nav>
      </header>
      {menuOpen && (
        <div id="mmenu" className="mmenu">
          {NAV.map(([l,id]) => <a key={id} href={`#${id}`} onClick={()=>setMenuOpen(false)}>{l}<ArrowRight size={24}/></a>)}
        </div>
      )}

      <main id="main">
        {/* ── Hero: wycinek koła = zakres ruchu ── */}
        <section className="hero">
          <div ref={discRef} className="hero-disc">
            <div className="hero-wedge" style={{clipPath:sectorPolygon(HERO_FROM, wedge)}}>
              <img src={IMG_BACK} alt="Dłonie terapeuty uciskają plecy pacjenta stemplami ziołowymi" width="506" height="900" fetchPriority="high"/>
            </div>
          </div>
          <div className="hero-copy">
            <h1>Pełen zakres ruchu</h1>
            <p className="hero-p">Fizjoterapia manualna przy Karmelickiej 34 w Krakowie. Wizyta trwa 50 minut i kosztuje od 100 zł.</p>
            <a className="btn" href="#rezerwacja">Umów wizytę <ArrowRight size={18}/></a>
            <p className="hero-meta">Poniedziałek-piątek 8-20, sobota 9-14</p>
          </div>
        </section>

        {/* ── Gdzie boli: tarcza-goniometr ── */}
        <section id="gdzie-boli" className="joints" aria-labelledby="jh">
          <div className="joints-grid">
            <ul className="jlist">
              <li className="jh" id="jh">Gdzie boli?</li>
              {JOINTS.map(j => (
                <li key={j.id}>
                  <button className="jbtn" aria-pressed={joint===j.id} onClick={()=>setJoint(j.id)}><i aria-hidden="true"/>{j.name}</button>
                </li>
              ))}
            </ul>

            <div className="gonio" role="img" aria-label={`${J.name}: norma około ${J.deg} stopni`}>
              <div className="gonio-plate">
                <img src={IMG_PLATE} alt="" width="2000" height="2665" loading="lazy"
                  style={{transform:`translate(${-J.x*100}%, ${-J.y*100}%)`}}/>
              </div>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="track" cx="50" cy="50" r={R} fill="none" strokeWidth="6"/>
                <circle className="arc" cx="50" cy="50" r={R} fill="none" strokeWidth="6"
                  strokeDasharray={C} strokeDashoffset={C * (1 - J.deg/360)}/>
              </svg>
            </div>

            <div className="jfact" aria-live="polite">
              <span className="deg">{J.deg}°</span>
              <p className="move">{J.move} do około {J.deg}°.</p>
              <p>Tyle wynosi orientacyjna norma u dorosłych. Na pierwszej wizycie mierzymy Twój zakres goniometrem; różnica pokazuje, od czego zacząć.</p>
              <p className="for">Pomaga przy tym stawie</p>
              <ul className="jsvcs">
                {jointSvcs.map(s => (
                  <li key={s.id}>
                    <button className="jsvc" onClick={()=>book({svc:s.id})}>
                      <span><i aria-hidden="true"/>{s.name}</span>
                      <span className="pr">{s.price} zł · {s.dur} min</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="jnote">To wstępny filtr, nie diagnoza. Ilustracja: Gautier d'Agoty, 1773.</p>
            </div>
          </div>
        </section>

        {/* ── Cennik ── */}
        <section id="cennik" className="price">
          <div className="price-head">
            <h2 className="rv">Cennik</h2>
            <p className="rv" style={{"--i":1}}>Ceny za jedną wizytę. Wybierz zabieg, a przeniesiemy go do karty rezerwacji.</p>
          </div>
          <div className="cats">
          {GROUPS.map(([g,label]) => {
            const list = SVCS.filter(s => s.group === g)
            return (
              <div key={g}>
                <div className="cat rv"><h3>{label}</h3><span>{list.length} zabiegi</span></div>
                <ul className="items">
                  {list.map((s,i) => (
                    <li key={s.id} className="rv" style={{"--i":i}}>
                      <button className="item" onClick={()=>book({svc:s.id})} aria-label={`${s.name}, ${s.price} zł, ${s.dur} minut. Umów wizytę`}>
                        <Dial min={s.dur}/>
                        <span>
                          <span className="item-top"><span className="nm">{s.name}</span><span>{s.price} zł</span></span>
                          <p>{s.desc}</p>
                          <span className="dur">{s.dur} minut</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
          </div>
        </section>

        {/* ── Pierwsza wizyta ── */}
        <section id="pierwsza-wizyta" className="visit">
          <div className="visit-head">
            <h2 className="rv">Pierwsza wizyta</h2>
            <p className="rv" style={{"--i":1}}>Trwa 50 minut. Zanim zajmiemy się bolącym miejscem, sprawdzamy, jak rusza się całe ciało.</p>
          </div>
          <div className="acc rv" style={{"--i":2}}>
            {STAGES.map((s,i) => (
              <div key={s.name} className={`stage ${stage===i ? "open" : ""}`}>
                <button className="stage-btn" onClick={()=>setStage(i)} aria-expanded={stage===i} aria-controls={`st-${i}`}>
                  <span className="vert">{s.name} · {s.min} min</span>
                </button>
                <div id={`st-${i}`} className="stage-body">
                  <div className="stage-txt">
                    <h3>{s.name}<span className="min">{s.min} minut</span></h3>
                    <p>{s.text}</p>
                  </div>
                  {s.img && <div className="stage-img"><img src={s.img} alt={s.alt} loading="lazy"/></div>}
                  {s.asks && <ul className="stage-asks">{s.asks.map(q => <li key={q}>{q}</li>)}</ul>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Zespół ── */}
        <section id="zespol" className="team">
          <div className="team-l">
            <h2 className="rv">Troje terapeutów</h2>
          </div>
          <div className="team-r">
            {TH.map((t,i) => (
              <article key={t.id} className="person rv" style={{"--i":i}}>
                <h3>{t.name}</h3>
                <p className="tt">{t.title}</p>
                <p>{t.bio}</p>
                <p className="fc">{t.focus}</p>
                <button className="tlink" onClick={()=>book({th:t.id, svc:t.svcs.includes(form.svc) ? form.svc : t.svcs[0]})}>Umów u {t.gen} <ArrowRight size={16}/></button>
              </article>
            ))}
          </div>
          <div className="team-photo rv" style={{"--i":1}}>
            <img src={IMG_THERAPY} alt="Anna Kowalska mobilizuje biodro pacjentki" loading="lazy"/>
          </div>
        </section>

        {/* ── Rezerwacja: karta wizyty do wycięcia ── */}
        <section id="rezerwacja" className="book">
          <div className="coupon rv">
            <div className="coupon-l">
              <div>
                <h2>Karta wizyty</h2>
                <p className="coupon-p">Wybierz zabieg, terapeutę i wolną godzinę. Potwierdzenie przyjdzie SMS-em.</p>
              </div>
              <div className="coupon-sum">
                <div><span>Zabieg</span><span>{svcObj.name}</span></div>
                <div><span>Terapeuta</span><span>{thObj.name}</span></div>
                <div><span>Czas</span><span>{svcObj.dur} minut</span></div>
                <div><span>Cena</span><span>{svcObj.price} zł</span></div>
              </div>
            </div>
            {done ? (
              <div className="done" aria-live="polite">
                <span className="done-ic"><Check size={30}/></span>
                <h3>Termin zarezerwowany</h3>
                <p>{DAYS[form.day]}, godz. {form.time}. Potwierdzenie wyślemy SMS-em na numer {form.phone}. Do zobaczenia, {form.name.trim().split(" ")[0]}.</p>
                <button className="tlink" onClick={()=>{setDone(false);setForm(f=>({...f,time:"",name:"",phone:""}));setTouched({})}}>Zarezerwuj kolejny termin <ArrowRight size={16}/></button>
              </div>
            ) : (
              <form className="coupon-r" onSubmit={submit} noValidate>
                <div className="fld">
                  <label htmlFor="f-svc">Zabieg</label>
                  <select id="f-svc" value={form.svc} onChange={e=>set({svc:e.target.value})}>
                    {SVCS.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price} zł</option>)}
                  </select>
                </div>
                <div className="fld">
                  <label htmlFor="f-th">Terapeuta</label>
                  <select id="f-th" value={form.th} onChange={e=>set({th:e.target.value})}>
                    {thForSvc.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="row2">
                  <div className="fld">
                    <label htmlFor="f-day">Dzień</label>
                    <select id="f-day" value={form.day} onChange={e=>set({day:+e.target.value})}>
                      {DAYS.map((d,i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div className="fld">
                    <label htmlFor="f-time">Godzina</label>
                    <select id="f-time" value={form.time} onChange={e=>set({time:e.target.value})} onBlur={()=>setTouched(t=>({...t,time:true}))}
                      aria-invalid={touched.time && !form.time} aria-describedby={touched.time && !form.time ? "f-time-err" : undefined}>
                      <option value="">Wybierz</option>
                      {freeTimes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {touched.time && !form.time && <p id="f-time-err" className="err">Wybierz godzinę.</p>}
                  </div>
                </div>
                <div className="fld">
                  <label htmlFor="f-name">Imię i nazwisko</label>
                  <input id="f-name" type="text" autoComplete="name" value={form.name} onChange={e=>set({name:e.target.value})}
                    onBlur={()=>setTouched(t=>({...t,name:true}))} aria-invalid={touched.name && !nameOk}
                    aria-describedby={touched.name && !nameOk ? "f-name-err" : undefined}/>
                  {touched.name && !nameOk && <p id="f-name-err" className="err">Podaj imię i nazwisko.</p>}
                </div>
                <div className="fld">
                  <label htmlFor="f-phone">Telefon</label>
                  <input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="np. 512 384 719" value={form.phone}
                    onChange={e=>set({phone:e.target.value})} onBlur={()=>setTouched(t=>({...t,phone:true}))}
                    aria-invalid={touched.phone && !phoneOk} aria-describedby={touched.phone && !phoneOk ? "f-phone-err" : undefined}/>
                  {touched.phone && !phoneOk && <p id="f-phone-err" className="err">Numer powinien mieć co najmniej 9 cyfr.</p>}
                </div>
                <button type="submit" className="submit">Zarezerwuj termin <ArrowRight size={18}/></button>
                <p className="legal">To strona demonstracyjna: dane zostają w przeglądarce i nigdzie nie są wysyłane.</p>
              </form>
            )}
          </div>

          <div id="dojazd" className="route">
            <div className="route-txt">
              <h2 className="rv">Dojazd</h2>
              <p className="rv" style={{"--i":1}}>ul. Karmelicka 34/2, 31-128 Kraków. Tramwajem do przystanku Batorego, stamtąd dwie minuty pieszo.</p>
              <p className="rv mut" style={{"--i":2}}>Poniedziałek-piątek 8:00-20:00<br/>Sobota 9:00-14:00</p>
              <p className="rv" style={{"--i":3}}><a href="tel:+48123847192">+48 12 384 71 92</a><br/><a href="mailto:kontakt@ruchmanual.pl">kontakt@ruchmanual.pl</a></p>
            </div>
            <div className="route-pics rv" style={{"--i":1}}>
              <img className="route-street" src={IMG_STREET} alt="Ulica Karmelicka w Krakowie, widok na południe, tory tramwajowe i kamienice" width="1400" height="788" loading="lazy"/>
              <div className="route-tram">
                <video ref={videoRef} muted loop playsInline preload="metadata" poster="/media/tram-krakow-poster.jpg" aria-label="Krakowski tramwaj na ulicy">
                  <source src="/media/tram-krakow.webm" type="video/webm"/>
                  <source src="/media/tram-krakow.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="blocks" aria-label="Ruch Manual">
          {[["R",100],["U",74],["C",88],["H",62]].map(([l,h]) => (
            <div key={l} className="blk" style={{height:`${h}%`}} aria-hidden="true"><span>{l}</span></div>
          ))}
        </div>
        <div className="foot-grid">
          <div className="foot-col">
            <h3>Strona</h3>
            <ul>
              {[...NAV.slice(0,2),["Pierwsza wizyta","pierwsza-wizyta"],["Zespół","zespol"],["Rezerwacja","rezerwacja"]].map(([l,id]) => <li key={id}><a href={`#${id}`}>{l}</a></li>)}
            </ul>
          </div>
          <div className="foot-col">
            <h3>Godziny</h3>
            <div className="hours"><span>Pon-pt</span><span>8:00-20:00</span></div>
            <div className="hours"><span>Sobota</span><span>9:00-14:00</span></div>
            <div className="hours"><span>Niedziela</span><span>zamknięte</span></div>
          </div>
          <div className="foot-col">
            <h3>Adres</h3>
            <p>ul. Karmelicka 34/2<br/>31-128 Kraków</p>
          </div>
          <div className="foot-col">
            <h3>Kontakt</h3>
            <p><a href="tel:+48123847192">+48 12 384 71 92</a><br/><a href="mailto:kontakt@ruchmanual.pl">kontakt@ruchmanual.pl</a></p>
          </div>
        </div>
        <p className="credits">
          Ilustracje i materiały z otwartych zbiorów: {CREDITS.map(([w,l,u],i) => (
            <span key={u}>{i>0 && "; "}<a href={u} target="_blank" rel="noreferrer">{w}</a>, {l}</span>
          ))}. Ryciny pokazują anatomię, nie pacjentów gabinetu.
        </p>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Ruch Manual · projekt demonstracyjny do portfolio · React 19, Vite, Cloudflare Workers</span>
          <a className="btn" href="#main">Na górę <ArrowUp size={16}/></a>
        </div>
      </footer>
    </div>
  )
}

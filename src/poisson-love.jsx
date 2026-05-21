import { useState, useEffect, useRef } from "react";

// ── Math helpers ──────────────────────────────────────────────
const factorial = (n) => { if (n<=1) return 1; let r=1; for(let i=2;i<=n;i++) r*=i; return r; };
const poissonPMF = (k,l) => (Math.pow(l,k)*Math.exp(-l))/factorial(k);
const poissonCDF = (k,l) => { let s=0; for(let i=0;i<=k;i++) s+=poissonPMF(i,l); return Math.min(s,1); };

// ── Colour tokens ─────────────────────────────────────────────
const C = {
  bg:      "#07080f",
  surface: "rgba(255,255,255,0.035)",
  border:  "rgba(255,255,255,0.08)",
  pink:    "#ff5fa0",
  violet:  "#b57bee",
  blue:    "#5ab4f5",
  teal:    "#2dd4bf",
  amber:   "#fbbf24",
  text:    "#ede8f5",
  muted:   "rgba(237,232,245,0.45)",
  faint:   "rgba(237,232,245,0.18)",
};

// ── Shared tiny components ────────────────────────────────────
const Divider = () => (
  <div style={{width:"100%",height:1,background:`linear-gradient(to right,transparent,${C.pink},transparent)`,margin:"28px 0",opacity:.35}}/>
);

const Tag = ({color,children}) => (
  <span style={{background:`${color}22`,border:`1px solid ${color}55`,borderRadius:20,padding:"2px 10px",fontSize:11,color,letterSpacing:".06em",fontFamily:"monospace"}}>{children}</span>
);

// ── Scenarios ─────────────────────────────────────────────────
const POISSON_SCENARIOS = [
  {label:"Hopeless Romantic", lambda:0.5, color:C.pink,  emoji:"💫", desc:"Believes in lightning-strike love — rare, electric, once-in-a-lifetime."},
  {label:"Pragmatist",        lambda:2,   color:C.violet, emoji:"🎯", desc:"Active dater, realistic expectations. Love is a numbers game."},
  {label:"Social Butterfly",  lambda:5,   color:C.blue,   emoji:"🦋", desc:"Perpetually surrounded by candidates. Quality over quantity."},
  {label:"Mathematician",     lambda:1,   color:C.teal,   emoji:"📐", desc:"Derived the optimal threshold. Will settle at exactly the 37% mark."},
];

const LOVEXY_SCENARIOS = [
  {label:"Casual Browser",    filterQ:.15, recallable:false, color:C.pink,   emoji:"👀", desc:"Uses a few demographic filters, no AI query, no recall."},
  {label:"Smart Searcher",    filterQ:.40, recallable:false, color:C.violet,  emoji:"🔍", desc:"Demographic + AI vector filter. Still treats matches as final."},
  {label:"Power User",        filterQ:.65, recallable:true,  color:C.blue,   emoji:"⚡", desc:"Full filters + AI text + transparent like/dislike recall."},
  {label:"Verified + AI",     filterQ:.85, recallable:true,  color:C.teal,   emoji:"✅", desc:"Verified profile, full AI filter, recall — maximum signal."},
];

// ═══════════════════════════════════════════════════════════════
//  TAB 1 — Pure Poisson  (original v1, fully restored)
// ═══════════════════════════════════════════════════════════════
function PoissonTab() {
  const [lambda,   setLambda]   = useState(2);
  const [scenario, setScenario] = useState(1);
  const [hovered,  setHovered]  = useState(null);
  const [showCDF,  setShowCDF]  = useState(false);

  const maxK = 15;
  const data  = Array.from({length:maxK+1},(_,k)=>({k,pmf:poissonPMF(k,lambda),cdf:poissonCDF(k,lambda)}));
  const maxPMF = Math.max(...data.map(d=>d.pmf));
  const mode   = Math.floor(lambda);

  const probZero       = poissonPMF(0,lambda)*100;
  const probAtLeastOne = (1-poissonPMF(0,lambda))*100;
  const mean = lambda, variance = lambda, stdDev = Math.sqrt(lambda);

  const pickScenario = (i) => { setScenario(i); setLambda(POISSON_SCENARIOS[i].lambda); };

  const barColor = (k,pmf) => {
    if (k === mode) return "#ff6b9d";
    if (k === Math.round(mean)) return "#c084fc";
    return `rgba(96,165,250,${.3+(pmf/maxPMF)*.7})`;
  };

  const interpretations = [
    "No one. Solo chapter.",
    "One soulmate candidate arrives.",
    "Two paths cross your orbit.",
    "A crowded heart.",
    "Rare abundance.",
    "Unusually rich romantic period.",
    "Something extraordinary is happening.",
    "Poisson would raise an eyebrow.",
    "Statistical outlier.",
    "You've broken the model.",
  ];

  return (
    <div>
      {/* The Model */}
      <div style={{background:"rgba(255,107,157,0.06)",border:"1px solid rgba(255,107,157,0.2)",borderRadius:16,padding:"24px 28px",marginBottom:32,lineHeight:1.75}}>
        <h2 style={{fontSize:14,letterSpacing:".12em",color:"#ff6b9d",margin:"0 0 12px",textTransform:"uppercase"}}>The Model</h2>
        <p style={{margin:"0 0 10px",color:"rgba(232,224,240,0.85)",fontSize:15}}>
          Let <em>X</em> be the number of "true love" candidates who arrive in a fixed time window.
          We model <em>X</em> ~ Poisson(λ), where <strong style={{color:"#ff6b9d"}}>λ</strong> is
          the expected rate of meaningful romantic encounters per period.
        </p>
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:15,color:"#c084fc",letterSpacing:".05em",textAlign:"center"}}>
          P(X = k) = (λ<sup>k</sup> · e<sup>−λ</sup>) / k! &nbsp;&nbsp;for k = 0, 1, 2, …
        </div>
        <p style={{margin:"10px 0 0",color:"rgba(232,224,240,0.6)",fontSize:13,fontStyle:"italic"}}>
          Assumptions: encounters arrive independently; the rate λ is constant; two encounters cannot coincide exactly.
          This mirrors the standard Poisson axioms — like meteor sightings, but with more heartbreak.
        </p>
      </div>

      {/* Scenarios */}
      <div style={{marginBottom:28}}>
        <p style={{fontSize:13,letterSpacing:".1em",color:"rgba(232,224,240,0.4)",textTransform:"uppercase",margin:"0 0 12px"}}>
          Choose a Romantic Archetype
        </p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {POISSON_SCENARIOS.map((s,i)=>(
            <button key={i} onClick={()=>pickScenario(i)} style={{
              background: scenario===i ? `${s.color}18` : "rgba(255,255,255,0.04)",
              border:`1px solid ${scenario===i ? s.color : "rgba(255,255,255,0.1)"}`,
              borderRadius:10,padding:"12px 16px",cursor:"pointer",textAlign:"left",color:"#e8e0f0",fontFamily:"inherit",transition:"all .25s"
            }}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:18}}>{s.emoji}</span>
                <span style={{fontSize:14,fontWeight:600,color:s.color}}>{s.label}</span>
                <span style={{marginLeft:"auto",fontSize:13,color:"rgba(232,224,240,0.5)"}}>λ={s.lambda}</span>
              </div>
              <p style={{margin:0,fontSize:12,color:"rgba(232,224,240,0.5)",lineHeight:1.5}}>{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lambda Slider */}
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"20px 24px",marginBottom:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
          <label style={{fontSize:14,color:"rgba(232,224,240,0.7)",letterSpacing:".05em"}}>
            Rate parameter <span style={{color:"#ff6b9d",fontStyle:"italic"}}>λ</span>
          </label>
          <span style={{fontSize:28,fontWeight:300,color:"#ff6b9d",filter:"drop-shadow(0 0 8px rgba(255,107,157,0.5))",letterSpacing:"-.02em"}}>
            {lambda.toFixed(1)}
            <span style={{fontSize:14,color:"rgba(232,224,240,0.4)",marginLeft:6}}>per year</span>
          </span>
        </div>
        <input type="range" min={0.1} max={8} step={0.1} value={lambda}
          onChange={e=>{setLambda(parseFloat(e.target.value));setScenario(null);}}
          style={{width:"100%",accentColor:"#ff6b9d",cursor:"pointer"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(232,224,240,0.3)",marginTop:6}}>
          <span>0.1 — extremely rare</span><span>8 — romantic avalanche</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28}}>
        {[
          {label:"Mean (E[X])", value:mean.toFixed(2),      sub:"= λ",                    color:"#ff6b9d"},
          {label:"Variance",    value:variance.toFixed(2),  sub:"= λ (equidispersion)",   color:"#c084fc"},
          {label:"Std Deviation",value:stdDev.toFixed(3),   sub:"= √λ",                   color:"#60a5fa"},
          {label:"Mode",        value:mode,                 sub:"⌊λ⌋",                    color:"#34d399"},
          {label:"P(X = 0)",    value:`${probZero.toFixed(1)}%`,   sub:"no one arrives",  color:"#fb923c"},
          {label:"P(X ≥ 1)",   value:`${probAtLeastOne.toFixed(1)}%`, sub:"at least one arrives", color:"#f472b6"},
        ].map((s,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,107,157,0.2)",borderRadius:12,padding:"16px 20px",backdropFilter:"blur(8px)",transition:"all .3s ease"}}>
            <div style={{fontSize:11,color:"rgba(232,224,240,0.4)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:300,color:s.color,letterSpacing:"-.02em"}}>{s.value}</div>
            <div style={{fontSize:11,color:"rgba(232,224,240,0.35)",fontStyle:"italic",marginTop:3}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"24px 20px 16px",marginBottom:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h3 style={{margin:0,fontSize:15,fontWeight:400,color:"rgba(232,224,240,0.85)"}}>Distribution of Romantic Arrivals</h3>
            <p style={{margin:"4px 0 0",fontSize:12,color:"rgba(232,224,240,0.35)",fontStyle:"italic"}}>λ = {lambda.toFixed(1)} · Hover bars for probabilities</p>
          </div>
          <button onClick={()=>setShowCDF(!showCDF)} style={{
            background: showCDF ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.06)",
            border:`1px solid ${showCDF ? "#c084fc" : "rgba(255,255,255,0.15)"}`,
            borderRadius:20,padding:"6px 16px",color: showCDF ? "#c084fc" : "#e8e0f0",
            fontFamily:"inherit",fontSize:13,cursor:"pointer",transition:"all .2s"
          }}>{showCDF?"Showing CDF":"Show CDF"}</button>
        </div>

        <svg viewBox="0 0 820 320" style={{width:"100%",height:"auto",overflow:"visible"}}>
          {[0.25,0.5,0.75,1].map(frac=>(
            <g key={frac}>
              <line x1={50} y1={280-frac*240} x2={800} y2={280-frac*240} stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>
              <text x={44} y={280-frac*240+4} fill="rgba(232,224,240,0.3)" fontSize={10} textAnchor="end">
                {showCDF ? frac.toFixed(2) : (maxPMF*frac).toFixed(3)}
              </text>
            </g>
          ))}

          {data.map(({k,pmf,cdf},i)=>{
            const barW=36, gap=48, x=60+i*gap;
            const val  = showCDF ? cdf : pmf;
            const maxV = showCDF ? 1 : maxPMF;
            const h    = (val/maxV)*240;
            const y    = 280-h;
            const color = showCDF ? `rgba(192,132,252,${.4+val*.6})` : barColor(k,pmf);
            return (
              <g key={k}>
                <rect x={x-barW/2} y={y} width={barW} height={Math.max(h,2)} rx={4} fill={color}
                  style={{
                    filter: hovered===k
                      ? "brightness(1.5) drop-shadow(0 0 8px currentColor)"
                      : k===mode && !showCDF ? "drop-shadow(0 0 6px rgba(255,107,157,0.5))" : "none",
                    transformOrigin:`${x}px 280px`,
                    animation:`barGrow .5s cubic-bezier(.34,1.56,.64,1) ${i*.03}s both`,
                    cursor:"pointer", transition:"filter .2s",
                  }}
                  onMouseEnter={()=>setHovered(k)} onMouseLeave={()=>setHovered(null)}/>

                {hovered===k && (
                  <g>
                    <rect x={x-42} y={y-44} width={84} height={36} rx={6}
                      fill="rgba(10,10,20,0.95)" stroke={k===mode?"#ff6b9d":"#c084fc"} strokeWidth={1}/>
                    <text x={x} y={y-27} textAnchor="middle" fill="#e8e0f0" fontSize={11}>
                      {showCDF?`P(X≤${k})`:`P(X=${k})`}
                    </text>
                    <text x={x} y={y-13} textAnchor="middle" fill={k===mode&&!showCDF?"#ff6b9d":"#c084fc"} fontSize={12} fontWeight="bold">
                      {(val*100).toFixed(2)}%
                    </text>
                  </g>
                )}

                <text x={x} y={296} textAnchor="middle" fill="rgba(232,224,240,0.45)" fontSize={11}>{k}</text>
                {k===mode && !showCDF && (
                  <text x={x} y={310} textAnchor="middle" fill="#ff6b9d" fontSize={9} letterSpacing=".05em">MODE</text>
                )}
              </g>
            );
          })}

          <line x1={50} y1={280} x2={810} y2={280} stroke="rgba(255,255,255,0.15)" strokeWidth={1}/>
          <line x1={50} y1={16}  x2={50}  y2={280} stroke="rgba(255,255,255,0.15)" strokeWidth={1}/>

          {showCDF && (
            <polyline
              points={data.map(({k,cdf},i)=>`${60+i*48},${280-(cdf/1)*240}`).join(" ")}
              fill="none" stroke="#c084fc" strokeWidth={2} strokeDasharray="4 2" opacity={.6}/>
          )}

          <text x={430} y={318} textAnchor="middle" fill="rgba(232,224,240,0.3)" fontSize={11} fontStyle="italic">
            k — number of true love candidates
          </text>
        </svg>

        <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:4,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(232,224,240,0.45)"}}>
            <div style={{width:12,height:12,borderRadius:3,background:"#ff6b9d"}}/>Mode (most likely count)
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(232,224,240,0.45)"}}>
            <div style={{width:12,height:12,borderRadius:3,background:"rgba(96,165,250,0.7)"}}/>PMF probability mass
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div style={{marginBottom:28}}>
        <h2 style={{fontSize:14,letterSpacing:".12em",color:"#c084fc",margin:"0 0 16px",textTransform:"uppercase"}}>Key Insights</h2>
        <div style={{display:"grid",gap:10}}>
          {[
            {icon:"💔",title:"The Loneliness Coefficient",
              text:`With λ = ${lambda.toFixed(1)}, there's a ${probZero.toFixed(1)}% chance of zero meaningful arrivals in the period. The Poisson distribution never truly reaches zero probability for any k — there's always a slim chance of many encounters.`},
            {icon:"⚖️",title:"Mean = Variance (Equidispersion)",
              text:`A beautiful and unusual property: E[X] = Var[X] = λ = ${lambda.toFixed(2)}. This means as the expected rate rises, so does the unpredictability. The luckier you are on average, the wilder the swings.`},
            {icon:"📊",title:"The Optimal Stopping Connection",
              text:`The famous Secretary Problem (37% Rule) assumes Poisson-like arrivals. If you reject the first ⌊N/e⌋ candidates, then accept the next one who surpasses all prior candidates, you maximize your chance of the global optimum.`},
            {icon:"🔗",title:"Memorylessness & Heartbreak",
              text:`The Poisson process has no memory — past dry spells don't make the next arrival more likely. A 5-year romantic drought does not increase tomorrow's odds. Each moment is independent, indifferent, and occasionally cruel.`},
          ].map((ins,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,107,157,0.2)",borderRadius:12,padding:"16px 20px",display:"flex",gap:14,alignItems:"flex-start"}}>
              <span style={{fontSize:22,lineHeight:1,flexShrink:0,marginTop:2}}>{ins.icon}</span>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"rgba(232,224,240,0.9)",marginBottom:5}}>{ins.title}</div>
                <div style={{fontSize:13,color:"rgba(232,224,240,0.55)",lineHeight:1.65}}>{ins.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Probability Table */}
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"20px 24px",marginBottom:28}}>
        <h2 style={{fontSize:14,letterSpacing:".12em",color:"#34d399",margin:"0 0 14px",textTransform:"uppercase"}}>
          Probability Table (λ = {lambda.toFixed(1)})
        </h2>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr>
                {["k","P(X = k)","P(X ≤ k)","P(X > k)","Interpretation"].map(h=>(
                  <th key={h} style={{padding:"8px 12px",color:"rgba(232,224,240,0.4)",fontWeight:400,letterSpacing:".06em",
                    borderBottom:"1px solid rgba(255,255,255,0.08)",textAlign:h==="Interpretation"?"left":"center",
                    fontSize:11,textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0,10).map(({k,pmf,cdf})=>(
                <tr key={k} style={{background:k===mode?"rgba(255,107,157,0.08)":"transparent",transition:"background .2s"}}>
                  <td style={{padding:"8px 12px",textAlign:"center",color:k===mode?"#ff6b9d":"rgba(232,224,240,0.7)",fontWeight:k===mode?700:400}}>
                    {k}{k===mode?" ★":""}
                  </td>
                  <td style={{padding:"8px 12px",textAlign:"center",color:"#c084fc",fontFamily:"monospace"}}>{(pmf*100).toFixed(3)}%</td>
                  <td style={{padding:"8px 12px",textAlign:"center",color:"rgba(96,165,250,0.8)",fontFamily:"monospace"}}>{(cdf*100).toFixed(2)}%</td>
                  <td style={{padding:"8px 12px",textAlign:"center",color:"rgba(232,224,240,0.4)",fontFamily:"monospace"}}>{((1-cdf)*100).toFixed(2)}%</td>
                  <td style={{padding:"8px 12px",color:"rgba(232,224,240,0.45)",fontStyle:"italic"}}>{interpretations[k]||"Mathematical infinity of longing."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 2 — LoveXY Model
// ═══════════════════════════════════════════════════════════════
function LoveXYTab() {
  const [baseLambda,  setBaseLambda]  = useState(2);
  const [filterQ,     setFilterQ]     = useState(.40);
  const [recallable,  setRecallable]  = useState(false);
  const [scenario,    setScenario]    = useState(1);
  const [hovered,     setHovered]     = useState(null);
  const [showCDF,     setShowCDF]     = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  // effective lambda after thinning
  const effectiveLambda = Math.max(.05, baseLambda * (1 - filterQ * .6));
  // quality multiplier — signal per arrival is higher
  const qualityMult     = 1 + filterQ * 2.2;
  // optimal stopping threshold
  const classicThreshold = .37;
  const lovexyThreshold  = recallable
    ? Math.max(.03, classicThreshold * (1 - filterQ) * .55)
    : Math.max(.05, classicThreshold * (1 - filterQ * .7));
  // expected candidates before commit
  const poolSize = 50;
  const classicN = Math.round(poolSize * classicThreshold);
  const lovexyN  = Math.max(2, Math.round(poolSize * lovexyThreshold));

  const maxK  = 15;
  const data  = Array.from({length:maxK+1},(_,k)=>({
    k,
    pmf:    poissonPMF(k, effectiveLambda),
    pmfRaw: poissonPMF(k, baseLambda),
    cdf:    poissonCDF(k, effectiveLambda),
  }));
  const maxPMF= Math.max(...data.map(d=>showCompare?Math.max(d.pmf,d.pmfRaw):d.pmf));
  const mode  = Math.floor(effectiveLambda);

  const probZero       = poissonPMF(0,effectiveLambda)*100;
  const probAtLeastOne = (1-poissonPMF(0,effectiveLambda))*100;

  const pickScenario = (i) => {
    setScenario(i);
    setFilterQ(LOVEXY_SCENARIOS[i].filterQ);
    setRecallable(LOVEXY_SCENARIOS[i].recallable);
  };

  return (
    <div>
      {/* hero banner */}
      <div style={{background:"linear-gradient(135deg,rgba(45,212,191,.07),rgba(91,180,245,.07))",border:`1px solid rgba(45,212,191,.25)`,borderRadius:14,padding:"18px 22px",marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{fontSize:22}}>🔬</span>
          <h3 style={{margin:0,fontSize:16,fontWeight:400,color:C.teal}}>From Poisson to Cox Process</h3>
        </div>
        <p style={{margin:"0 0 8px",color:C.muted,fontSize:14,lineHeight:1.75}}>
          LoveXY's filters transform random arrival into a <strong style={{color:C.teal}}>steered, thinned point process</strong>.
          The effective λ drops, but <em>quality per arrival rises</em>. The AI vector-similarity filter introduces semantic
          clustering — arrivals are no longer independent — upgrading the model to a <strong style={{color:C.blue}}>Cox (doubly stochastic Poisson) process</strong> where
          λ itself is shaped by your search query.
        </p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Tag color={C.teal}>Thinned arrivals</Tag>
          <Tag color={C.blue}>Non-stationary λ</Tag>
          <Tag color={C.violet}>Semantic clustering</Tag>
          <Tag color={C.pink}>Reversible decisions</Tag>
        </div>
      </div>

      {/* scenario picker */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:24}}>
        {LOVEXY_SCENARIOS.map((s,i)=>(
          <button key={i} onClick={()=>pickScenario(i)} style={{
            background: scenario===i ? `${s.color}18` : C.surface,
            border:`1px solid ${scenario===i ? s.color : C.border}`,
            borderRadius:10,padding:"12px 14px",cursor:"pointer",textAlign:"left",color:C.text,fontFamily:"inherit",transition:"all .2s"
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:18}}>{s.emoji}</span>
              <span style={{fontSize:13,fontWeight:600,color:s.color}}>{s.label}</span>
              <span style={{marginLeft:"auto",fontSize:11,color:C.muted}}>Q={Math.round(s.filterQ*100)}%</span>
            </div>
            <p style={{margin:0,fontSize:12,color:C.muted,lineHeight:1.5}}>{s.desc}</p>
          </button>
        ))}
      </div>

      {/* sliders */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 22px",marginBottom:24}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <label style={{fontSize:13,color:C.muted}}>Base rate <em style={{color:C.pink}}>λ</em></label>
              <span style={{fontSize:20,color:C.pink,fontWeight:300}}>{baseLambda.toFixed(1)}</span>
            </div>
            <input type="range" min={.5} max={8} step={.1} value={baseLambda}
              onChange={e=>{setBaseLambda(parseFloat(e.target.value));setScenario(null);}}
              style={{width:"100%",accentColor:C.pink,cursor:"pointer"}}/>
            <div style={{fontSize:11,color:C.faint,marginTop:4}}>Unfiltered arrival rate</div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <label style={{fontSize:13,color:C.muted}}>Filter quality <em style={{color:C.teal}}>Q</em></label>
              <span style={{fontSize:20,color:C.teal,fontWeight:300}}>{Math.round(filterQ*100)}%</span>
            </div>
            <input type="range" min={0} max={.95} step={.01} value={filterQ}
              onChange={e=>{setFilterQ(parseFloat(e.target.value));setScenario(null);}}
              style={{width:"100%",accentColor:C.teal,cursor:"pointer"}}/>
            <div style={{fontSize:11,color:C.faint,marginTop:4}}>0% = no filter · 95% = AI+verified</div>
          </div>
        </div>
        <div style={{marginTop:18,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setRecallable(!recallable)} style={{
            background: recallable ? "rgba(45,212,191,.15)" : C.surface,
            border:`1px solid ${recallable ? C.teal : C.border}`,
            borderRadius:20,padding:"6px 16px",color: recallable ? C.teal : C.muted,
            fontFamily:"inherit",fontSize:13,cursor:"pointer",transition:"all .2s"
          }}>
            {recallable ? "✓ Recall enabled" : "Recall disabled"}
          </button>
          <span style={{fontSize:12,color:C.faint,fontStyle:"italic"}}>Transparent like/dislike — can revisit past profiles</span>
        </div>
      </div>

      {/* key numbers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
        {[
          {l:"Effective λ",          v:effectiveLambda.toFixed(2), s:"after thinning",           c:C.teal},
          {l:"Quality multiplier",   v:`×${qualityMult.toFixed(1)}`, s:"signal per arrival",     c:C.blue},
          {l:"P(X=0)",               v:`${probZero.toFixed(1)}%`,  s:"no good match arrives",   c:C.amber},
          {l:"Classic threshold",    v:`${Math.round(classicThreshold*100)}%`, s:"37% rule (random order)", c:C.faint.replace("0.18","0.5")},
          {l:"LoveXY threshold",     v:`${Math.round(lovexyThreshold*100)}%`, s:"optimal explore phase",  c:C.pink},
          {l:"Explore N (pool=50)",  v:`${lovexyN} vs ${classicN}`, s:"LoveXY vs classic",       c:C.violet},
        ].map((s,i)=>(
          <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:10,color:C.faint,letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{s.l}</div>
            <div style={{fontSize:i===5?16:20,fontWeight:300,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:C.faint,fontStyle:"italic",marginTop:3}}>{s.s}</div>
          </div>
        ))}
      </div>

      {/* compare toggle */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <button onClick={()=>setShowCompare(!showCompare)} style={{
          background: showCompare ? "rgba(255,95,160,.15)" : C.surface,
          border:`1px solid ${showCompare ? C.pink : C.border}`,
          borderRadius:20,padding:"6px 16px",color: showCompare ? C.pink : C.muted,
          fontFamily:"inherit",fontSize:13,cursor:"pointer",transition:"all .2s"
        }}>
          {showCompare ? "Showing: LoveXY vs Raw" : "Compare with raw Poisson"}
        </button>
      </div>

      {/* chart */}
      <ChartPanel
        data={data} maxPMF={maxPMF} mode={mode} lambda={effectiveLambda}
        hovered={hovered} setHovered={setHovered} showCDF={showCDF} setShowCDF={setShowCDF}
        accentColor={C.teal}
        showCompare={showCompare}
        barColorFn={(k,pmf)=>{
          if(k===mode) return C.teal;
          return `rgba(45,212,191,${.2+(pmf/maxPMF)*.7})`;
        }}
      />

      <Divider/>

      {/* optimal stopping deep dive */}
      <h3 style={{fontSize:13,letterSpacing:".1em",color:C.teal,margin:"0 0 14px",textTransform:"uppercase"}}>Optimal Stopping — Revised</h3>

      {/* comparison table */}
      <div style={{overflowX:"auto",marginBottom:20}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr>
              {["Assumption","Secretary / Pure Poisson","LoveXY Model"].map(h=>(
                <th key={h} style={{padding:"10px 14px",color:C.faint,fontWeight:400,letterSpacing:".06em",
                  borderBottom:`1px solid ${C.border}`,textAlign:"left",fontSize:11,textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Arrival order",      "Random, unknown quality",            "AI-ranked by compatibility"],
              ["Prior information",  "None before process starts",         "Vector similarity pre-ranks candidates"],
              ["Recall",             "No — irreversible rejections",       "Yes — transparent likes, changeable anytime"],
              ["Independence",       "Arrivals are i.i.d.",                "Semantic clustering (Cox process)"],
              ["Optimal threshold",  `~37% of pool (≈${classicN} of 50)`, `~${Math.round(lovexyThreshold*100)}% of pool (≈${lovexyN} of 50)`],
              ["Decision model",     "Secretary Problem",                  "Weitzman Pandora's Box (reversible search)"],
            ].map(([asp,cls,lxy],i)=>(
              <tr key={i} style={{background: i%2===0 ? "rgba(255,255,255,.015)" : "transparent"}}>
                <td style={{padding:"9px 14px",color:C.muted,fontSize:12,fontStyle:"italic"}}>{asp}</td>
                <td style={{padding:"9px 14px",color:"rgba(237,232,245,.5)",fontSize:12}}>{cls}</td>
                <td style={{padding:"9px 14px",color:C.teal,fontSize:12,fontWeight:500}}>{lxy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* explore/exploit visual */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 22px",marginBottom:16}}>
        <h4 style={{margin:"0 0 14px",fontSize:14,color:C.text,fontWeight:400}}>Explore → Exploit Threshold (pool of 50 profiles)</h4>
        {/* bar */}
        <div style={{position:"relative",height:36,borderRadius:8,overflow:"hidden",background:"rgba(0,0,0,.3)",marginBottom:6}}>
          {/* classic fill */}
          <div style={{position:"absolute",left:0,top:0,width:`${classicThreshold*100}%`,height:"100%",
            background:`linear-gradient(to right,rgba(192,132,252,.3),rgba(192,132,252,.5))`,
            borderRight:`2px solid ${C.violet}`}}/>
          {/* lovexy fill */}
          <div style={{position:"absolute",left:0,top:0,width:`${lovexyThreshold*100}%`,height:"100%",
            background:`linear-gradient(to right,rgba(45,212,191,.35),rgba(45,212,191,.6))`,
            borderRight:`2px solid ${C.teal}`}}/>
        </div>
        {/* labels below bar as clean rows */}
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:12,height:12,borderRadius:2,background:"rgba(192,132,252,.5)",border:`1px solid ${C.violet}`,flexShrink:0}}/>
            <span style={{fontSize:12,color:C.violet}}>Classic threshold — explore first <strong>37%</strong> ({classicN} of 50 profiles)</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:12,height:12,borderRadius:2,background:"rgba(45,212,191,.5)",border:`1px solid ${C.teal}`,flexShrink:0}}/>
            <span style={{fontSize:12,color:C.teal}}>LoveXY threshold — explore first <strong>{Math.round(lovexyThreshold*100)}%</strong> ({lovexyN} of 50 profiles)</span>
          </div>
        </div>
        <p style={{margin:0,fontSize:12,color:C.muted,lineHeight:1.65}}>
          With <strong style={{color:C.teal}}>filter quality {Math.round(filterQ*100)}%</strong> and
          recall <strong style={{color:recallable?C.teal:C.faint}}>{recallable?"enabled":"disabled"}</strong>,
          the optimal explore phase shrinks from {classicN} to <strong style={{color:C.pink}}>{lovexyN} profiles</strong>.
          Each conversation is pre-selected to be relevant, compressing the explore phase without sacrificing quality.
        </p>
      </div>

      {[
        {icon:"🎯",title:"Thinning improves precision, not just rate",
          text:`Filters don't just reduce λ — they selectively remove incompatible profiles. The resulting effective λ=${effectiveLambda.toFixed(2)} represents arrivals with ×${qualityMult.toFixed(1)} higher compatibility signal per encounter.`},
        {icon:"🔄",title:"Recall transforms the decision geometry",
          text:`Transparent like/dislike with full recall converts the Secretary Problem's irreversible one-shot structure into Weitzman's Pandora's Box model. You keep opening boxes (profiles) while expected value exceeds switching cost.`},
        {icon:"🧠",title:"AI filter = prior information injection",
          text:`The vector similarity search on 'About Me' sections is mathematically equivalent to having a prior distribution over candidate quality before the process starts — collapsing the classic no-information assumption entirely.`},
      ].map((ins,i)=>(
        <div key={i} style={{display:"flex",gap:14,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 18px",marginBottom:10}}>
          <span style={{fontSize:22,flexShrink:0,marginTop:2}}>{ins.icon}</span>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>{ins.title}</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{ins.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Shared Chart Panel
// ═══════════════════════════════════════════════════════════════
function ChartPanel({data,maxPMF,mode,lambda,hovered,setHovered,showCDF,setShowCDF,accentColor,barColorFn,showCompare}) {
  const maxK = data.length - 1;
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"22px 18px 14px",marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <h3 style={{margin:0,fontSize:15,fontWeight:400,color:C.text}}>Distribution of Romantic Arrivals</h3>
          <p style={{margin:"4px 0 0",fontSize:12,color:C.faint,fontStyle:"italic"}}>λ = {lambda.toFixed(2)} · hover bars for probabilities</p>
        </div>
        <button onClick={()=>setShowCDF(!showCDF)} style={{
          background: showCDF ? "rgba(192,132,252,.2)" : C.surface,
          border:`1px solid ${showCDF ? C.violet : C.border}`,
          borderRadius:20,padding:"5px 14px",color: showCDF ? C.violet : C.muted,
          fontFamily:"inherit",fontSize:12,cursor:"pointer",transition:"all .2s"
        }}>{showCDF?"Showing CDF":"Show CDF"}</button>
      </div>

      <svg viewBox="0 0 820 300" style={{width:"100%",height:"auto",overflow:"visible"}}>
        {[.25,.5,.75,1].map(f=>(
          <g key={f}>
            <line x1={50} y1={260-f*220} x2={800} y2={260-f*220} stroke="rgba(255,255,255,.055)" strokeWidth={1}/>
            <text x={44} y={260-f*220+4} fill={C.faint} fontSize={10} textAnchor="end">
              {showCDF ? f.toFixed(2) : (maxPMF*f).toFixed(3)}
            </text>
          </g>
        ))}

        {data.map(({k,pmf,pmfRaw,cdf},i)=>{
          const gap=48, bw=32, x=60+i*gap;
          const val   = showCDF ? cdf : pmf;
          const maxV  = showCDF ? 1 : maxPMF;
          const h     = Math.max((val/maxV)*220, 2);
          const y     = 260-h;
          const color = barColorFn(k,pmf);

          // raw bar for comparison
          const hRaw  = showCompare && !showCDF ? Math.max((pmfRaw/maxPMF)*220,2) : 0;
          const yRaw  = 260-hRaw;

          return (
            <g key={k}>
              {/* raw comparison bar */}
              {showCompare && !showCDF && (
                <rect x={x-bw/2-1} y={yRaw} width={bw+2} height={hRaw} rx={3}
                  fill="rgba(192,132,252,.18)" stroke="rgba(192,132,252,.35)" strokeWidth={1}/>
              )}
              {/* main bar */}
              <rect x={x-bw/2} y={y} width={bw} height={h} rx={4} fill={color}
                style={{
                  filter: hovered===k ? `brightness(1.5) drop-shadow(0 0 8px ${accentColor})` : k===mode ? `drop-shadow(0 0 5px ${accentColor}88)` : "none",
                  cursor:"pointer", transition:"filter .2s",
                  transformOrigin:`${x}px 260px`,
                  animation:`barGrow .5s cubic-bezier(.34,1.56,.64,1) ${i*.03}s both`
                }}
                onMouseEnter={()=>setHovered(k)} onMouseLeave={()=>setHovered(null)}/>

              {/* tooltip */}
              {hovered===k && (
                <g>
                  <rect x={x-44} y={y-46} width={88} height={38} rx={6}
                    fill="rgba(7,8,15,.96)" stroke={accentColor} strokeWidth={1}/>
                  <text x={x} y={y-29} textAnchor="middle" fill={C.text} fontSize={11}>
                    {showCDF?`P(X≤${k})`:`P(X=${k})`}
                  </text>
                  <text x={x} y={y-14} textAnchor="middle" fill={accentColor} fontSize={12} fontWeight="bold">
                    {(val*100).toFixed(2)}%
                  </text>
                </g>
              )}

              <text x={x} y={276} textAnchor="middle" fill={C.faint} fontSize={11}>{k}</text>
              {k===mode && (
                <text x={x} y={290} textAnchor="middle" fill={accentColor} fontSize={9} letterSpacing=".05em">MODE</text>
              )}
            </g>
          );
        })}

        <line x1={50} y1={260} x2={810} y2={260} stroke="rgba(255,255,255,.12)" strokeWidth={1}/>
        <line x1={50} y1={16}  x2={50}  y2={260} stroke="rgba(255,255,255,.12)" strokeWidth={1}/>

        {showCDF && (
          <polyline
            points={data.map(({k,cdf},i)=>`${60+i*48},${260-(cdf/1)*220}`).join(" ")}
            fill="none" stroke={C.violet} strokeWidth={2} strokeDasharray="4 2" opacity={.6}/>
        )}

        <text x={430} y={304} textAnchor="middle" fill={C.faint} fontSize={11} fontStyle="italic">
          k — number of true love candidates
        </text>
      </svg>

      <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:4,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.faint}}>
          <div style={{width:12,height:12,borderRadius:3,background:accentColor}}/> Mode
        </div>
        {showCompare && (
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.faint}}>
            <div style={{width:12,height:12,borderRadius:3,background:"rgba(192,132,252,.4)",border:"1px solid rgba(192,132,252,.5)"}}/> Unfiltered (raw Poisson)
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Root App
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(()=>{ setTimeout(()=>setReady(true),80); },[]);

  const tabs = [
    {label:"Pure Poisson",  sub:"Classical model",        icon:"📊"},
    {label:"LoveXY.club",   sub:"Cox process + AI filter", icon:"💡"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.08;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes barGrow  { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        * { box-sizing: border-box; }
        input[type=range] { height:4px; }
        ::-webkit-scrollbar { width:6px; background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.12); border-radius:3px; }
      `}</style>

      {/* starfield */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
        {Array.from({length:70},(_,i)=>(
          <div key={i} style={{
            position:"absolute",
            width: i%8===0?2.5:1.5, height: i%8===0?2.5:1.5,
            borderRadius:"50%",
            background: i%6===0?C.pink:i%4===0?C.teal:"#fff",
            left:`${(i*137.5)%100}%`, top:`${(i*97.3)%100}%`,
            opacity:.1+(i%5)*.07,
            animation:`twinkle ${2+(i%4)}s ease-in-out infinite`,
            animationDelay:`${(i*.3)%3}s`
          }}/>
        ))}
      </div>

      <div style={{position:"relative",zIndex:1,maxWidth:880,margin:"0 auto",padding:"36px 20px 64px",
        opacity: ready?1:0, animation: ready?"fadeUp .7s ease both":"none"}}>

        {/* ── Header ── */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:38,marginBottom:10,filter:`drop-shadow(0 0 14px ${C.pink})`}}>♥</div>
          <h1 style={{fontSize:"clamp(24px,5vw,44px)",fontWeight:400,letterSpacing:"-.02em",margin:"0 0 8px",lineHeight:1.1,
            background:`linear-gradient(135deg,${C.pink},${C.violet},${C.teal})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Love & Probability
          </h1>
          <p style={{color:C.muted,fontSize:15,fontStyle:"italic",margin:0,letterSpacing:".04em"}}>
            Pure Poisson vs. LoveXY.club's AI-assisted Cox Process
          </p>
          <div style={{width:60,height:1,background:`linear-gradient(to right,transparent,${C.pink},transparent)`,margin:"18px auto 0"}}/>
        </div>

        {/* ── Tabs ── */}
        <div style={{display:"flex",gap:4,background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:14,padding:5,marginBottom:28}}>
          {tabs.map((t,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{
              flex:1, background: tab===i ? `linear-gradient(135deg,${i===0?"rgba(255,95,160,.2)":"rgba(45,212,191,.2)"},${i===0?"rgba(181,123,238,.2)":"rgba(91,180,245,.2)"})` : "transparent",
              border:`1px solid ${tab===i ? (i===0?C.pink:C.teal) : "transparent"}`,
              borderRadius:10,padding:"12px 16px",cursor:"pointer",color: tab===i ? C.text : C.muted,
              fontFamily:"inherit",fontSize:14,transition:"all .25s",display:"flex",alignItems:"center",justifyContent:"center",gap:8
            }}>
              <span style={{fontSize:18}}>{t.icon}</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontWeight: tab===i?600:400}}>{t.label}</div>
                <div style={{fontSize:11,color:tab===i?C.muted:C.faint}}>{t.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {tab===0 ? <PoissonTab/> : <LoveXYTab/>}

        {/* ── Footer ── */}
        <div style={{textAlign:"center",color:C.faint,fontSize:12,fontStyle:"italic",marginTop:32}}>
          "The heart, like a Poisson process, arrives without warning and without memory."<br/>
          <span style={{fontSize:11,letterSpacing:".08em"}}>LoveXY.club · Applied Probability Edition</span>
        </div>
      </div>
    </div>
  );
}
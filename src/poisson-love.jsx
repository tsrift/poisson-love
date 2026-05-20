import { useState, useEffect, useRef } from "react";

const factorial = (n) => {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

const poissonPMF = (k, lambda) =>
  (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);

const poissonCDF = (k, lambda) => {
  let sum = 0;
  for (let i = 0; i <= k; i++) sum += poissonPMF(i, lambda);
  return Math.min(sum, 1);
};

const scenarios = [
  {
    label: "The Hopeless Romantic",
    lambda: 0.5,
    desc: "Believes in lightning-strike love. Rare, electric, once-in-a-lifetime.",
    color: "#ff6b9d",
    emoji: "💫",
  },
  {
    label: "The Pragmatist",
    lambda: 2,
    desc: "Active dater, realistic expectations. Love is a numbers game, played wisely.",
    color: "#c084fc",
    emoji: "🎯",
  },
  {
    label: "The Social Butterfly",
    lambda: 5,
    desc: "Perpetually surrounded by candidates. The question is quality, not quantity.",
    color: "#60a5fa",
    emoji: "🦋",
  },
  {
    label: "The Mathematician",
    lambda: 1,
    desc: "Derived the optimal stopping threshold. Will settle at exactly the 37% mark.",
    color: "#34d399",
    emoji: "📐",
  },
];

const heartPath =
  "M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z";

export default function App() {
  const [lambda, setLambda] = useState(2);
  const [activeScenario, setActiveScenario] = useState(1);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [timeUnit, setTimeUnit] = useState("year");
  const [showCDF, setShowCDF] = useState(false);
  const [animated, setAnimated] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const maxK = 15;
  const pmfData = Array.from({ length: maxK + 1 }, (_, k) => ({
    k,
    pmf: poissonPMF(k, lambda),
    cdf: poissonCDF(k, lambda),
  }));

  const maxPMF = Math.max(...pmfData.map((d) => d.pmf));
  const mean = lambda;
  const variance = lambda;
  const stdDev = Math.sqrt(lambda);
  const mode = Math.floor(lambda);

  const probZero = poissonPMF(0, lambda) * 100;
  const probAtLeastOne = (1 - poissonPMF(0, lambda)) * 100;
  const probExactlyOne = poissonPMF(1, lambda) * 100;

  const timeLabels = {
    year: "per year",
    decade: "per decade",
    lifetime: "per lifetime (50 yrs)",
  };

  const lifetimeLambda = {
    year: lambda,
    decade: lambda * 10,
    lifetime: lambda * 50,
  };

  const currentLambda = lambda;

  const handleScenario = (i) => {
    setActiveScenario(i);
    setLambda(scenarios[i].lambda);
  };

  const barColor = (k, pmf) => {
    const intensity = pmf / maxPMF;
    if (k === mode) return "#ff6b9d";
    if (k === Math.round(mean)) return "#c084fc";
    return `rgba(96, 165, 250, ${0.3 + intensity * 0.7})`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e8e0f0",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Starfield background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: i % 7 === 0 ? 3 : 1.5,
              height: i % 7 === 0 ? 3 : 1.5,
              borderRadius: "50%",
              background: i % 5 === 0 ? "#ff6b9d" : "#ffffff",
              left: `${(i * 137.508) % 100}%`,
              top: `${(i * 97.3) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.08,
              animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.15); }
          28% { transform: scale(1); }
          42% { transform: scale(1.1); }
          70% { transform: scale(1); }
        }
        .bar-rect {
          transform-origin: bottom;
          animation: barGrow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          cursor: pointer;
          transition: filter 0.2s;
        }
        .bar-rect:hover { filter: brightness(1.4); }
        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,107,157,0.2);
          border-radius: 12px;
          padding: 16px 20px;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          background: rgba(255,107,157,0.08);
          border-color: rgba(255,107,157,0.5);
          transform: translateY(-2px);
        }
        .scenario-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
          color: #e8e0f0;
          font-family: inherit;
        }
        .scenario-btn:hover {
          background: rgba(255,107,157,0.1);
          border-color: rgba(255,107,157,0.4);
        }
        .scenario-btn.active {
          background: rgba(255,107,157,0.15);
          border-color: #ff6b9d;
        }
        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(to right, #ff6b9d 0%, #ff6b9d calc(var(--val) * 100% / 8), rgba(255,255,255,0.15) calc(var(--val) * 100% / 8));
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ff6b9d;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(255,107,157,0.6);
          transition: box-shadow 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 20px rgba(255,107,157,0.9);
        }
        .toggle-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 6px 16px;
          color: #e8e0f0;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn.on {
          background: rgba(192,132,252,0.2);
          border-color: #c084fc;
          color: #c084fc;
        }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 24px 60px",
          animation: animated ? "fadeSlideUp 0.8s ease both" : "none",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ marginBottom: 12 }}>
            <svg
              viewBox="0 0 24 24"
              width={40}
              height={40}
              style={{
                fill: "#ff6b9d",
                filter: "drop-shadow(0 0 12px rgba(255,107,157,0.7))",
                animation: "heartbeat 2.4s ease-in-out infinite",
                display: "inline-block",
              }}
            >
              <path d={heartPath} />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              margin: "0 0 10px",
              lineHeight: 1.1,
              background: "linear-gradient(135deg, #ff6b9d, #c084fc, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Love as a Rare Event
          </h1>
          <p
            style={{
              color: "rgba(232,224,240,0.55)",
              fontSize: 16,
              fontStyle: "italic",
              letterSpacing: "0.04em",
              margin: 0,
            }}
          >
            A Poisson Model of Romantic Arrivals
          </p>
          <div
            style={{
              width: 60,
              height: 1,
              background:
                "linear-gradient(to right, transparent, #ff6b9d, transparent)",
              margin: "20px auto 0",
            }}
          />
        </div>

        {/* The Model */}
        <div
          style={{
            background: "rgba(255,107,157,0.06)",
            border: "1px solid rgba(255,107,157,0.2)",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 32,
            lineHeight: 1.75,
          }}
        >
          <h2
            style={{
              fontSize: 14,
              letterSpacing: "0.12em",
              color: "#ff6b9d",
              margin: "0 0 12px",
              textTransform: "uppercase",
            }}
          >
            The Model
          </h2>
          <p
            style={{
              margin: "0 0 10px",
              color: "rgba(232,224,240,0.85)",
              fontSize: 15,
            }}
          >
            Let <em>X</em> be the number of "true love" candidates who arrive in
            a fixed time window. We model <em>X</em> ~ Poisson(λ), where{" "}
            <strong style={{ color: "#ff6b9d" }}>λ</strong> is the expected rate
            of meaningful romantic encounters per period.
          </p>
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: 10,
              padding: "14px 18px",
              fontFamily: "monospace",
              fontSize: 15,
              color: "#c084fc",
              letterSpacing: "0.05em",
              textAlign: "center",
            }}
          >
            P(X = k) = (λ<sup>k</sup> · e<sup>−λ</sup>) / k! &nbsp;&nbsp;for k =
            0, 1, 2, …
          </div>
          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(232,224,240,0.6)",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Assumptions: encounters arrive independently; the rate λ is
            constant; two encounters cannot coincide exactly. This mirrors the
            standard Poisson axioms — like meteor sightings, but with more
            heartbreak.
          </p>
        </div>

        {/* Scenarios */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.1em",
              color: "rgba(232,224,240,0.4)",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            Choose a Romantic Archetype
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {scenarios.map((s, i) => (
              <button
                key={i}
                className={`scenario-btn${
                  activeScenario === i ? " active" : ""
                }`}
                onClick={() => handleScenario(i)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{s.emoji}</span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: s.color }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 13,
                      color: "rgba(232,224,240,0.5)",
                    }}
                  >
                    λ={s.lambda}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "rgba(232,224,240,0.5)",
                    lineHeight: 1.5,
                  }}
                >
                  {s.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Lambda Slider */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 14,
            }}
          >
            <label
              style={{
                fontSize: 14,
                color: "rgba(232,224,240,0.7)",
                letterSpacing: "0.05em",
              }}
            >
              Rate parameter{" "}
              <span style={{ color: "#ff6b9d", fontStyle: "italic" }}>λ</span>
            </label>
            <span
              style={{
                fontSize: 28,
                fontWeight: 300,
                color: "#ff6b9d",
                filter: "drop-shadow(0 0 8px rgba(255,107,157,0.5))",
                letterSpacing: "-0.02em",
              }}
            >
              {lambda.toFixed(1)}
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(232,224,240,0.4)",
                  marginLeft: 6,
                }}
              >
                {timeLabels[timeUnit]}
              </span>
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={8}
            step={0.1}
            value={lambda}
            className="slider"
            style={{ "--val": lambda }}
            onChange={(e) => {
              setLambda(parseFloat(e.target.value));
              setActiveScenario(null);
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "rgba(232,224,240,0.3)",
              marginTop: 6,
            }}
          >
            <span>0.1 — extremely rare</span>
            <span>8 — romantic avalanche</span>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Mean (E[X])",
              value: mean.toFixed(2),
              sub: "= λ",
              color: "#ff6b9d",
            },
            {
              label: "Variance",
              value: variance.toFixed(2),
              sub: "= λ (equidispersion)",
              color: "#c084fc",
            },
            {
              label: "Std Deviation",
              value: stdDev.toFixed(3),
              sub: "= √λ",
              color: "#60a5fa",
            },
            { label: "Mode", value: mode, sub: "⌊λ⌋", color: "#34d399" },
            {
              label: "P(X = 0)",
              value: `${probZero.toFixed(1)}%`,
              sub: "no one arrives",
              color: "#fb923c",
            },
            {
              label: "P(X ≥ 1)",
              value: `${probAtLeastOne.toFixed(1)}%`,
              sub: "at least one arrives",
              color: "#f472b6",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="stat-card"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(232,224,240,0.4)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 300,
                  color: s.color,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(232,224,240,0.35)",
                  fontStyle: "italic",
                  marginTop: 3,
                }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "24px 20px 16px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 400,
                  color: "rgba(232,224,240,0.85)",
                }}
              >
                Distribution of Romantic Arrivals
              </h3>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  color: "rgba(232,224,240,0.35)",
                  fontStyle: "italic",
                }}
              >
                λ = {lambda.toFixed(1)} · Hover bars for probabilities
              </p>
            </div>
            <button
              className={`toggle-btn${showCDF ? " on" : ""}`}
              onClick={() => setShowCDF(!showCDF)}
            >
              {showCDF ? "Showing CDF" : "Show CDF"}
            </button>
          </div>

          {/* SVG Chart */}
          <svg
            viewBox="0 0 820 320"
            style={{ width: "100%", height: "auto", overflow: "visible" }}
          >
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((frac) => (
              <g key={frac}>
                <line
                  x1={50}
                  y1={280 - frac * 240}
                  x2={800}
                  y2={280 - frac * 240}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
                <text
                  x={44}
                  y={280 - frac * 240 + 4}
                  fill="rgba(232,224,240,0.3)"
                  fontSize={10}
                  textAnchor="end"
                >
                  {showCDF ? frac.toFixed(2) : (maxPMF * frac).toFixed(3)}
                </text>
              </g>
            ))}

            {/* Bars */}
            {pmfData.map(({ k, pmf, cdf }, i) => {
              const barW = 36;
              const gap = 48;
              const x = 60 + i * gap;
              const val = showCDF ? cdf : pmf;
              const maxVal = showCDF ? 1 : maxPMF;
              const h = (val / maxVal) * 240;
              const y = 280 - h;
              const isMode = k === mode;
              const color = showCDF
                ? `rgba(192,132,252,${0.4 + val * 0.6})`
                : isMode
                ? "#ff6b9d"
                : `rgba(96,165,250,${0.25 + (pmf / maxPMF) * 0.75})`;

              return (
                <g key={k}>
                  <rect
                    x={x - barW / 2}
                    y={y}
                    width={barW}
                    height={Math.max(h, 2)}
                    rx={4}
                    fill={color}
                    style={{
                      filter:
                        hoveredBar === k
                          ? "brightness(1.5) drop-shadow(0 0 8px currentColor)"
                          : isMode && !showCDF
                          ? "drop-shadow(0 0 6px rgba(255,107,157,0.5))"
                          : "none",
                      transformOrigin: `${x}px 280px`,
                      animation: `barGrow 0.5s cubic-bezier(0.34,1.56,0.64,1) ${
                        i * 0.03
                      }s both`,
                      cursor: "pointer",
                      transition: "filter 0.2s",
                    }}
                    onMouseEnter={() => setHoveredBar(k)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  {/* Tooltip */}
                  {hoveredBar === k && (
                    <g>
                      <rect
                        x={x - 42}
                        y={y - 44}
                        width={84}
                        height={36}
                        rx={6}
                        fill="rgba(10,10,20,0.95)"
                        stroke={isMode ? "#ff6b9d" : "#c084fc"}
                        strokeWidth={1}
                      />
                      <text
                        x={x}
                        y={y - 27}
                        textAnchor="middle"
                        fill="#e8e0f0"
                        fontSize={11}
                      >
                        {showCDF ? `P(X≤${k})` : `P(X=${k})`}
                      </text>
                      <text
                        x={x}
                        y={y - 13}
                        textAnchor="middle"
                        fill={isMode && !showCDF ? "#ff6b9d" : "#c084fc"}
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {(val * 100).toFixed(2)}%
                      </text>
                    </g>
                  )}
                  {/* X-axis labels */}
                  <text
                    x={x}
                    y={296}
                    textAnchor="middle"
                    fill="rgba(232,224,240,0.45)"
                    fontSize={11}
                  >
                    {k}
                  </text>
                  {isMode && !showCDF && (
                    <text
                      x={x}
                      y={310}
                      textAnchor="middle"
                      fill="#ff6b9d"
                      fontSize={9}
                      letterSpacing="0.05em"
                    >
                      MODE
                    </text>
                  )}
                </g>
              );
            })}

            {/* Axis */}
            <line
              x1={50}
              y1={280}
              x2={810}
              y2={280}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
            <line
              x1={50}
              y1={16}
              x2={50}
              y2={280}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />

            {/* CDF line overlay */}
            {showCDF && (
              <polyline
                points={pmfData
                  .map(({ k, cdf }, i) => {
                    const x = 60 + i * 48;
                    const y = 280 - (cdf / 1) * 240;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#c084fc"
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.6}
              />
            )}

            {/* X-axis label */}
            <text
              x={430}
              y={318}
              textAnchor="middle"
              fill="rgba(232,224,240,0.3)"
              fontSize={11}
              fontStyle="italic"
            >
              k — number of true love candidates
            </text>
          </svg>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              marginTop: 4,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "rgba(232,224,240,0.45)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: "#ff6b9d",
                }}
              />
              Mode (most likely count)
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "rgba(232,224,240,0.45)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: "rgba(96,165,250,0.7)",
                }}
              />
              PMF probability mass
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 14,
              letterSpacing: "0.12em",
              color: "#c084fc",
              margin: "0 0 16px",
              textTransform: "uppercase",
            }}
          >
            Key Insights
          </h2>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              {
                icon: "💔",
                title: "The Loneliness Coefficient",
                text: `With λ = ${lambda.toFixed(
                  1
                )}, there's a ${probZero.toFixed(
                  1
                )}% chance of zero meaningful arrivals in the period. The Poisson distribution never truly reaches zero probability for any k — there's always a slim chance of many encounters.`,
              },
              {
                icon: "⚖️",
                title: "Mean = Variance (Equidispersion)",
                text: `A beautiful and unusual property: E[X] = Var[X] = λ = ${lambda.toFixed(
                  2
                )}. This means as the expected rate rises, so does the unpredictability. The luckier you are on average, the wilder the swings.`,
              },
              {
                icon: "📊",
                title: "The Optimal Stopping Connection",
                text: `The famous Secretary Problem (37% Rule) assumes Poisson-like arrivals. If you reject the first ⌊N/e⌋ candidates, then accept the next one who surpasses all prior candidates, you maximize your chance of the global optimum.`,
              },
              {
                icon: "🔗",
                title: "Memorylessness & Heartbreak",
                text: `The Poisson process has no memory — past dry spells don't make the next arrival more likely. A 5-year romantic drought does not increase tomorrow's odds. Each moment is independent, indifferent, and occasionally cruel.`,
              },
            ].map((insight, i) => (
              <div
                key={i}
                className="stat-card"
                style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    fontSize: 22,
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {insight.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "rgba(232,224,240,0.9)",
                      marginBottom: 5,
                    }}
                  >
                    {insight.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(232,224,240,0.55)",
                      lineHeight: 1.65,
                    }}
                  >
                    {insight.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Probability Table */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              fontSize: 14,
              letterSpacing: "0.12em",
              color: "#34d399",
              margin: "0 0 14px",
              textTransform: "uppercase",
            }}
          >
            Probability Table (λ = {lambda.toFixed(1)})
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  {[
                    "k",
                    "P(X = k)",
                    "P(X ≤ k)",
                    "P(X > k)",
                    "Interpretation",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        color: "rgba(232,224,240,0.4)",
                        fontWeight: 400,
                        letterSpacing: "0.06em",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        textAlign: h === "Interpretation" ? "left" : "center",
                        fontSize: 11,
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pmfData.slice(0, 10).map(({ k, pmf, cdf }) => {
                  const isMode = k === mode;
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
                    <tr
                      key={k}
                      style={{
                        background: isMode
                          ? "rgba(255,107,157,0.08)"
                          : "transparent",
                        transition: "background 0.2s",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: isMode ? "#ff6b9d" : "rgba(232,224,240,0.7)",
                          fontWeight: isMode ? 700 : 400,
                        }}
                      >
                        {k}
                        {isMode && " ★"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: "#c084fc",
                          fontFamily: "monospace",
                        }}
                      >
                        {(pmf * 100).toFixed(3)}%
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: "rgba(96,165,250,0.8)",
                          fontFamily: "monospace",
                        }}
                      >
                        {(cdf * 100).toFixed(2)}%
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: "rgba(232,224,240,0.4)",
                          fontFamily: "monospace",
                        }}
                      >
                        {((1 - cdf) * 100).toFixed(2)}%
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "rgba(232,224,240,0.45)",
                          fontStyle: "italic",
                        }}
                      >
                        {interpretations[k] ||
                          "Mathematical infinity of longing."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer formula */}
        <div
          style={{
            textAlign: "center",
            color: "rgba(232,224,240,0.2)",
            fontSize: 12,
            fontStyle: "italic",
          }}
        >
          "The heart, like a Poisson process, arrives without warning and
          without memory." <br />
          <span style={{ fontSize: 11, letterSpacing: "0.08em" }}>
            — Applied Probability, Romantic Edition
          </span>
        </div>
      </div>
    </div>
  );
}

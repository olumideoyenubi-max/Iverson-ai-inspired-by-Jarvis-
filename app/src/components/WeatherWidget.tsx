import { useCallback, useEffect, useState } from "react";

type Weather = {
  place: string | null;
  temp: number;
  code: number;
  humidity: number;
  wind: number;
  unit: "°F" | "°C";
  days: { label: string; max: number; min: number; code: number }[];
};

const ENABLED_KEY = "iverson.weather.enabled";
const REFRESH_MS = 15 * 60 * 1000;

// WMO weather codes used by Open-Meteo.
function describe(code: number): { text: string; kind: "sun" | "cloud" | "rain" | "snow" | "storm" | "fog" } {
  if (code === 0) return { text: "Clear", kind: "sun" };
  if (code <= 2) return { text: "Partly cloudy", kind: "cloud" };
  if (code === 3) return { text: "Overcast", kind: "cloud" };
  if (code <= 48) return { text: "Fog", kind: "fog" };
  if (code <= 67 || (code >= 80 && code <= 82)) return { text: "Rain", kind: "rain" };
  if (code <= 77 || code === 85 || code === 86) return { text: "Snow", kind: "snow" };
  return { text: "Thunderstorm", kind: "storm" };
}

function usesFahrenheit() {
  return /^en-(US|LR|MM)|^my/.test(navigator.language);
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge: REFRESH_MS, timeout: 15000 })
  );
}

async function fetchWeather(): Promise<Weather> {
  const { latitude, longitude } = (await getPosition()).coords;
  const fahrenheit = usesFahrenheit();
  const params = new URLSearchParams({
    latitude: latitude.toFixed(3),
    longitude: longitude.toFixed(3),
    current: "temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "4",
    temperature_unit: fahrenheit ? "fahrenheit" : "celsius",
    wind_speed_unit: fahrenheit ? "mph" : "kmh",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Weather error ${res.status}`);
  const data = await res.json();

  let place: string | null = null;
  try {
    const geo = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    ).then((r) => r.json());
    place = geo.city || geo.locality || null;
  } catch {
    /* place name is optional */
  }

  return {
    place,
    temp: Math.round(data.current.temperature_2m),
    code: data.current.weather_code,
    humidity: data.current.relative_humidity_2m,
    wind: Math.round(data.current.wind_speed_10m),
    unit: fahrenheit ? "°F" : "°C",
    days: (data.daily.time as string[]).slice(1).map((iso, i) => ({
      label: new Date(`${iso}T12:00`).toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(),
      max: Math.round(data.daily.temperature_2m_max[i + 1]),
      min: Math.round(data.daily.temperature_2m_min[i + 1]),
      code: data.daily.weather_code[i + 1],
    })),
  };
}

function readEnabled() {
  try {
    return localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function WeatherWidget() {
  const [enabled, setEnabled] = useState(readEnabled);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const next = await fetchWeather();
      setWeather(next);
      setError(null);
    } catch (err) {
      const e = err as GeolocationPositionError | Error;
      setError("code" in e && e.code === 1 ? "Location permission denied" : "Weather unavailable");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [enabled, load]);

  const enable = () => {
    try {
      localStorage.setItem(ENABLED_KEY, "1");
    } catch {
      /* noop */
    }
    setEnabled(true);
  };

  const now = weather ? describe(weather.code) : null;

  return (
    <div className="panel-glass hud-frame p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="label-hud">Atmospherics</h2>
        {weather?.place && <span className="font-mono text-[10px] text-iverson-cyan/70 truncate ml-2">{weather.place.toUpperCase()}</span>}
      </div>

      {!enabled || !("geolocation" in navigator) ? (
        <button
          onClick={enable}
          disabled={!("geolocation" in navigator)}
          className="w-full py-3 rounded border border-dashed border-iverson-cyan/40 text-iverson-cyan/80 font-mono text-[11px] tracking-widest hover:bg-iverson-cyan/10 transition disabled:opacity-40"
        >
          ENABLE LOCAL WEATHER
        </button>
      ) : error ? (
        <button onClick={load} className="w-full py-3 font-mono text-[11px] text-iverson-amber tracking-widest">
          {error.toUpperCase()} — RETRY
        </button>
      ) : !weather || !now ? (
        <div className="py-3 font-mono text-[11px] text-iverson-cyanDim tracking-widest animate-pulse">SCANNING…</div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <WeatherGlyph kind={now.kind} className="h-12 w-12 text-iverson-cyan glow-stroke" />
            <div>
              <div className="font-hud text-3xl font-bold text-glow leading-none">
                {weather.temp}
                <span className="text-base align-top">{weather.unit}</span>
              </div>
              <div className="text-sm text-iverson-accent font-semibold">{now.text}</div>
            </div>
            <div className="ml-auto text-right font-mono text-[10px] text-iverson-cyanDim leading-5">
              <div>HUM {weather.humidity}%</div>
              <div>
                WIND {weather.wind} {weather.unit === "°F" ? "MPH" : "KM/H"}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {weather.days.map((d) => (
              <div key={d.label} className="rounded border border-iverson-cyan/15 py-1.5 flex flex-col items-center">
                <span className="font-mono text-[9px] text-iverson-cyanDim">{d.label}</span>
                <WeatherGlyph kind={describe(d.code).kind} className="h-5 w-5 my-0.5 text-iverson-cyan" />
                <span className="font-mono text-[10px] text-iverson-cyan">
                  {d.max}° <span className="text-iverson-cyanDim">{d.min}°</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WeatherGlyph({ kind, className }: { kind: ReturnType<typeof describe>["kind"]; className?: string }) {
  const cloud = <path d="M7 18h10a4 4 0 00.5-8 5.5 5.5 0 00-10.7 1.3A3.4 3.4 0 007 18z" />;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      {kind === "sun" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
      {kind === "cloud" && cloud}
      {kind === "fog" && <path d="M4 9h16M2 13h20M5 17h14" />}
      {kind === "rain" && (
        <>
          <path d="M7 14h10a4 4 0 00.5-8 5.5 5.5 0 00-10.7 1.3A3.4 3.4 0 007 14z" />
          <path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" />
        </>
      )}
      {kind === "snow" && (
        <>
          <path d="M7 14h10a4 4 0 00.5-8 5.5 5.5 0 00-10.7 1.3A3.4 3.4 0 007 14z" />
          <path d="M8 18h.01M12 20h.01M16 18h.01" strokeWidth="2.5" />
        </>
      )}
      {kind === "storm" && (
        <>
          <path d="M7 14h10a4 4 0 00.5-8 5.5 5.5 0 00-10.7 1.3A3.4 3.4 0 007 14z" />
          <path d="M13 14l-2 4h3l-2 4" />
        </>
      )}
    </svg>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCloudSun, 
  faCloudRain, 
  faSun, 
  faSnowflake, 
  faSmog,
  faTemperatureHalf,
  faWind,
  faDroplet,
  faMotorcycle,
  faLocationDot,
  faCalendarDays,
  faClock,
  faUmbrella
} from "@fortawesome/free-solid-svg-icons";

// Types api Open-Meteo
type WeatherData = {
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Localisation en cours...");

  useEffect(() => {
    // Tenter de récupérer la position de l'utilisateur
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchLocationAndWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geoloc error, falling back to Paris", error);
          // Fallback sur Paris
          fetchLocationAndWeather(48.8566, 2.3522, "Paris, France");
        }
      );
    } else {
      fetchLocationAndWeather(48.8566, 2.3522, "Paris, France");
    }
  }, []);

  async function fetchLocationAndWeather(lat: number, lon: number, defaultName?: string) {
    try {
      // 1. Récupération du lieu précis via Nominatim (OpenStreetMap)
      if (!defaultName) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const geoData = await geoRes.json();
          const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.municipality || "Votre position";
          setLocationName(city);
        } catch (e) {
          setLocationName(`Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`);
        }
      } else {
        setLocationName(defaultName);
      }

      // 2. Récupération météo complète via Open-Meteo
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current_weather: "true",
        hourly: "temperature_2m,weathercode,precipitation_probability",
        daily: "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        timezone: "auto"
      });

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Interprétation du code météo fourni par Open-Meteo (WMO Weather interpretation codes)
  const getWeatherInfo = (code: number) => {
    if (code === 0) return { icon: faSun, text: "Ciel Dégagé", color: "text-amber-400", goodToRide: true };
    if (code >= 1 && code <= 3) return { icon: faCloudSun, text: "Nuageux", color: "text-sky-300", goodToRide: true };
    if (code >= 45 && code <= 48) return { icon: faSmog, text: "Brouillard", color: "text-gray-400", goodToRide: false };
    if (code >= 51 && code <= 67) return { icon: faCloudRain, text: "Pluie légère", color: "text-blue-400", goodToRide: false };
    if (code >= 71 && code <= 77) return { icon: faSnowflake, text: "Neige", color: "text-indigo-200", goodToRide: false };
    if (code >= 80 && code <= 99) return { icon: faCloudRain, text: "Averses / Orages", color: "text-blue-600", goodToRide: false };
    return { icon: faCloudSun, text: "Inconnu", color: "text-gray-300", goodToRide: true };
  };

  // Préparation des données horaires (24 prochaines heures)
  const getHourlyForecast = () => {
    if (!weather) return [];
    const now = new Date().getTime();
    const currentIndex = weather.hourly.time.findIndex(t => new Date(t).getTime() >= now);
    const startIdx = currentIndex > 0 ? currentIndex : 0;
    
    return weather.hourly.time.slice(startIdx, startIdx + 24).map((time, i) => ({
      time: new Date(time),
      temp: weather.hourly.temperature_2m[startIdx + i],
      code: weather.hourly.weathercode[startIdx + i],
      precip: weather.hourly.precipitation_probability[startIdx + i]
    }));
  };

  // Préparation des données journalières (7 prochains jours)
  const getDailyForecast = () => {
    if (!weather) return [];
    return weather.daily.time.map((time, i) => ({
      time: new Date(time),
      code: weather.daily.weathercode[i],
      min: weather.daily.temperature_2m_min[i],
      max: weather.daily.temperature_2m_max[i],
      precip: weather.daily.precipitation_probability_max[i]
    }));
  };

  return (
    <AppLayout title="Météo & Conditions">
       {loading ? (
          <div className="flex flex-col items-center justify-center p-24 opacity-50">
            <FontAwesomeIcon icon={faCloudSun} className="h-16 w-16 mb-4 animate-pulse text-sky-400" />
            <p>Analyse des nuages et de votre position...</p>
          </div>
       ) : weather ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Carte Principale Aktuelle */}
              {(() => {
                const info = getWeatherInfo(weather.current_weather.weathercode);
                return (
                  <div className={`p-8 md:p-12 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col justify-center ${info.goodToRide ? 'bg-gradient-to-br from-green-900/40 to-card' : 'bg-gradient-to-br from-blue-900/40 to-card'}`}>
                    <div className="absolute -right-10 -top-10 opacity-10">
                      <FontAwesomeIcon icon={info.icon} className="h-64 w-64" />
                    </div>

                    <div className="z-10 relative">
                       <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-bold uppercase tracking-wider bg-background/50 w-max px-3 py-1.5 rounded-lg border">
                         <FontAwesomeIcon icon={faLocationDot} className="text-primary" />
                         {locationName}
                       </div>

                       <div className="flex items-end gap-6 mb-4">
                         <span className="text-7xl md:text-8xl font-black tracking-tighter">
                            {Math.round(weather.current_weather.temperature)}°<span className="text-4xl text-muted-foreground">C</span>
                         </span>
                         <div className="pb-3 flex flex-col">
                            <FontAwesomeIcon icon={info.icon} className={`h-12 w-12 ${info.color} mb-2`} />
                            <span className="font-bold text-xl">{info.text}</span>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                         <div className="flex items-center gap-4">
                           <div className="bg-background/50 p-3 rounded-xl"><FontAwesomeIcon icon={faWind} className="text-muted-foreground" /></div>
                           <div>
                              <p className="text-sm text-muted-foreground">Vent</p>
                              <p className="font-bold">{weather.current_weather.windspeed} km/h</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="bg-background/50 p-3 rounded-xl"><FontAwesomeIcon icon={faTemperatureHalf} className="text-muted-foreground" /></div>
                           <div>
                              <p className="text-sm text-muted-foreground">Ressenti</p>
                              <p className="font-bold">~ {Math.round(weather.current_weather.temperature - (weather.current_weather.windspeed * 0.1))}°C</p>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                );
              })()}

              {/* Verdict pour le Motard */}
              {(() => {
                const info = getWeatherInfo(weather.current_weather.weathercode);
                return (
                  <div className="flex flex-col gap-6">
                    <div className={`p-8 rounded-3xl border shadow-sm flex flex-col justify-center flex-1 ${info.goodToRide ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-4 rounded-full ${info.goodToRide ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                           <FontAwesomeIcon icon={faMotorcycle} className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-black uppercase">Verdict Balade</h3>
                      </div>
                      
                      {info.goodToRide ? (
                        <div>
                          <p className="text-xl font-bold text-green-500 dark:text-green-400 mb-2">Idéal pour rouler !</p>
                          <p className="text-muted-foreground">Les conditions actuelles sont parfaites ou acceptables. Pensez à vérifier la pression des pneus.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xl font-bold text-red-500 dark:text-red-400 mb-2">Moto au garage recommandée</p>
                          <p className="text-muted-foreground">La chaussée sera glissante. Si vous devez rouler, équipez-vous d'une tenue de pluie et restez très souple sur la poignée de gaz.</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-card p-6 rounded-3xl border shadow-sm flex items-center justify-between">
                       <div>
                         <h4 className="font-bold">Besoin de nettoyer la moto ?</h4>
                         <p className="text-sm text-muted-foreground">Consultez les prévisions ci-dessous.</p>
                       </div>
                       <FontAwesomeIcon icon={faDroplet} className="h-10 w-10 text-blue-400/50" />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Prévisions Heure par Heure */}
            <div className="bg-card rounded-3xl border shadow-sm p-6 md:p-8">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                 <FontAwesomeIcon icon={faClock} className="text-primary" />
                 Prochaines heures
               </h3>
               <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {getHourlyForecast().map((hour, i) => {
                    const info = getWeatherInfo(hour.code);
                    return (
                      <div key={i} className="flex flex-col items-center min-w-[80px] p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/30 transition-all snap-start">
                        <span className="text-sm font-medium mb-3">
                          {hour.time.getHours()}h00
                        </span>
                        <FontAwesomeIcon icon={info.icon} className={`h-8 w-8 mb-3 ${info.color}`} />
                        <span className="text-lg font-bold">{Math.round(hour.temp)}°</span>
                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-400 font-semibold">
                          <FontAwesomeIcon icon={faUmbrella} />
                          {hour.precip}%
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Prévisions Semaine */}
            <div className="bg-card rounded-3xl border shadow-sm p-6 md:p-8">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                 <FontAwesomeIcon icon={faCalendarDays} className="text-primary" />
                 Les prochains jours
               </h3>
               <div className="space-y-3">
                 {getDailyForecast().map((day, i) => {
                   const info = getWeatherInfo(day.code);
                   const isToday = i === 0;
                   return (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        <div className="w-1/3 font-medium capitalize flex items-center gap-4">
                           {isToday ? "Aujourd'hui" : day.time.toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </div>
                        
                        <div className="w-1/3 flex items-center justify-center gap-3">
                          <FontAwesomeIcon icon={info.icon} className={`h-6 w-6 ${info.color}`} />
                          {day.precip > 20 && (
                            <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-md hidden sm:block">
                               {day.precip}%
                            </span>
                          )}
                        </div>

                        <div className="w-1/3 flex items-center justify-end gap-4 text-sm">
                           <span className="text-muted-foreground font-medium">{Math.round(day.min)}°</span>
                           <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-blue-500/50 to-orange-500/50"></div>
                           <span className="font-bold">{Math.round(day.max)}°</span>
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>

          </div>
       ) : null}
    </AppLayout>
  );
}
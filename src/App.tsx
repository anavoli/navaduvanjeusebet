import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Droplets, Clock, History, Settings, Cloud, Power, Wifi, Image as ImageIcon } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Initialize Supabase client with error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

function App() {
  const [isOn, setIsOn] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(65);
  const [waterUsage, setWaterUsage] = useState(0);
  const [schedule, setSchedule] = useState({ start: '06:00', duration: 30 });
  const [weatherData, setWeatherData] = useState({ temp: 22, humidity: 45 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const mockData = [
    { time: '06:00', moisture: 45 },
    { time: '08:00', moisture: 60 },
    { time: '10:00', moisture: 55 },
    { time: '12:00', moisture: 50 },
    { time: '14:00', moisture: 65 },
    { time: '16:00', moisture: 70 },
  ];

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Интернет конекција је успостављена');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Интернет конекција је прекинута');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSystem = () => {
    if (!isOnline) {
      toast.error('Потребна је интернет конекција за управљање системом');
      return;
    }
    setIsOn(!isOn);
    toast.success(
      !isOn ? 'Систем наводњавања је укључен' : 'Систем наводњавања је искључен'
    );
  };

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSoilMoisture(prev => Math.max(30, Math.min(90, prev + Math.random() * 10 - 5)));
      setWaterUsage(prev => prev + (isOn ? 0.1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, [isOn]);

  // Show warning if Supabase is not configured
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error('Молимо вас да конфигуришете Supabase повезивање');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-green-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Droplets className="h-8 w-8" />
              Навађување у Шебет
            </h1>
            <div className="flex items-center gap-2">
              <Wifi className={`h-6 w-6 ${isOnline ? 'text-white' : 'text-red-300'}`} />
              <span className="text-sm">{isOnline ? 'Повезано' : 'Није повезано'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Images Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Стара кућа у Шебету</h2>
              <ImageIcon className="h-6 w-6 text-gray-500" />
            </div>
            <img 
              src="https://schebet.netlify.app/assets/433725931_122133172790054120_8494266033700277322_n.jpg" 
              alt="Наш кладанац"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Грб Шебета</h2>
              <ImageIcon className="h-6 w-6 text-gray-500" />
            </div>
            <img 
              src="https://schebet.netlify.app/assets/šebet-moj.jpg"
              alt="Поглед на село са врха планине"
              className="w-full h-64 object-contain rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Статус система</h2>
              <Power className={`h-6 w-6 ${isOn ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <button
              onClick={toggleSystem}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                isOn
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isOnline}
            >
              {isOn ? 'Искључи систем' : 'Укључи систем'}
            </button>
            <div className="mt-4">
              <p className="text-gray-600">Влажност земљишта: {soilMoisture}%</p>
              <p className="text-gray-600">Потрошња воде: {waterUsage.toFixed(1)}L</p>
            </div>
          </div>

          {/* Timer Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Тајмер</h2>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Време почетка
                </label>
                <input
                  type="time"
                  value={schedule.start}
                  onChange={(e) => setSchedule({ ...schedule, start: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  disabled={!isOnline}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Трајање (минута)
                </label>
                <input
                  type="number"
                  value={schedule.duration}
                  onChange={(e) => setSchedule({ ...schedule, duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  disabled={!isOnline}
                />
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Временска прогноза</h2>
              <Cloud className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Температура: {weatherData.temp}°C</p>
              <p className="text-gray-600">Влажност ваздуха: {weatherData.humidity}%</p>
            </div>
          </div>

          {/* Graph Card */}
          <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-6">Историја влажности земљишта</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="moisture"
                    stroke="#059669"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
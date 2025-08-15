"use client";
import { FaUsers, FaBook, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Lun", inscriptions: 12 },
  { name: "Mar", inscriptions: 19 },
  { name: "Mer", inscriptions: 15 },
  { name: "Jeu", inscriptions: 8 },
  { name: "Ven", inscriptions: 11 },
  { name: "Sam", inscriptions: 5 },
  { name: "Dim", inscriptions: 2 },
];

const recentActivities = [
  { id: 1, title: "Nouveau cours ajouté", time: "10 min ago", icon: <FaBook className="text-[#00d084]" /> },
  { id: 2, title: "3 nouveaux étudiants", time: "1h ago", icon: <FaUsers className="text-[#0d68ae]" /> },
  { id: 3, title: "Emploi du temps mis à jour", time: "2h ago", icon: <FaCalendarAlt className="text-[#8A8A19]" /> },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <h1 className="text-2xl font-bold text-[#0d68ae] mb-6">Tableau de bord</h1>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Étudiants" 
          value="1,245" 
          change="+12%" 
          isIncrease={true} 
          icon={<FaUsers className="text-[#0d68ae]" size={24} />} 
          color="bg-[#e6f2ff]"
        />
        <StatCard 
          title="Cours" 
          value="48" 
          change="+5%" 
          isIncrease={true} 
          icon={<FaBook className="text-[#00d084]" size={24} />} 
          color="bg-[#e6f8f2]"
        />
        <StatCard 
          title="Taux de présence" 
          value="89%" 
          change="-2%" 
          isIncrease={false} 
          icon={<FaCalendarAlt className="text-[#8A8A19]" size={24} />} 
          color="bg-[#f8f8e6]"
        />
        <StatCard 
          title="Performance" 
          value="76%" 
          change="+7%" 
          isIncrease={true} 
          icon={<FaChartLine className="text-[#0274be]" size={24} />} 
          color="bg-[#e6f0fa]"
        />
      </div>

      {/* Graphique et activités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Graphique */}
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#0d68ae]">Inscriptions cette semaine</h2>
            <select className="bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-3 py-1 text-sm text-[#0d68ae]">
              <option>Cette semaine</option>
              <option>Ce mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="inscriptions" 
                  fill="#00d084" 
                  radius={[4, 4, 0, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-[#0d68ae] mb-4">Activités récentes</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="p-2 bg-[#f8fafc] rounded-lg mr-3">
                  {activity.icon}
                </div>
                <div>
                  <p className="font-medium text-[#0d68ae]">{activity.title}</p>
                  <p className="text-sm text-[#8A8A19]">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-[#0d68ae] hover:text-[#0274be] font-medium">
            Voir toutes les activités →
          </button>
        </div>
      </div>

      {/* Section supplémentaire */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-[#0d68ae] mb-4">Prochains événements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EventCard 
            title="Examen final" 
            date="15 Juin 2023" 
            time="09:00 - 11:00" 
            location="Salle A12" 
            color="bg-[#e6f8f2]"
            textColor="text-[#00d084]"
          />
          <EventCard 
            title="Réunion des professeurs" 
            date="18 Juin 2023" 
            time="14:00 - 15:30" 
            location="Salle de conférence" 
            color="bg-[#e6f2ff]"
            textColor="text-[#0d68ae]"
          />
          <EventCard 
            title="Atelier programmation" 
            date="20 Juin 2023" 
            time="10:00 - 12:00" 
            location="Labo informatique" 
            color="bg-[#f8f8e6]"
            textColor="text-[#8A8A19]"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isIncrease, icon, color }: { 
  title: string; 
  value: string; 
  change: string; 
  isIncrease: boolean; 
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`${color} p-6 rounded-xl shadow-sm`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-[#0d68ae] font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#0d68ae] mt-1">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${isIncrease ? 'text-[#00d084]' : 'text-[#e53e3e]'}`}>
            {isIncrease ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
            {change}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white bg-opacity-50">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EventCard({ title, date, time, location, color, textColor }: { 
  title: string; 
  date: string; 
  time: string; 
  location: string;
  color: string;
  textColor: string;
}) {
  return (
    <div className={`${color} p-4 rounded-lg border-l-4 ${textColor} border-current`}>
      <h3 className="font-semibold text-[#0d68ae]">{title}</h3>
      <p className="text-sm mt-1 text-[#8A8A19]">{date}</p>
      <p className="text-sm mt-1 text-[#8A8A19]">{time}</p>
      <div className="flex items-center mt-2">
        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-md text-[#0d68ae]">
          {location}
        </span>
      </div>
    </div>
  );
}
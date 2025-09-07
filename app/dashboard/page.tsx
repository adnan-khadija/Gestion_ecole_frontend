'use client';

import React, { useEffect, useState } from 'react';
import { getTotalEtudiants, getTotalProfesseurs, getTotalFormations, getTotalDiplomes, getEtudiantsParFormation } from '@/lib/dashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUsers, FaBook, FaChalkboardTeacher, FaGraduationCap, FaChartPie } from "react-icons/fa";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

const PRIMARY_BROWN = "#A52A2A";
const ACCENT_GOLD = "#D4A017";
const LIGHT_BEIGE = "#FFF7EE";
const CREAM = "#F5E9DA";
const SILVER = "#C0C0C0";

// Données factices pour les inscriptions hebdomadaires
const inscriptionData = [
  { name: "Lun", inscriptions: 12 },
  { name: "Mar", inscriptions: 19 },
  { name: "Mer", inscriptions: 15 },
  { name: "Jeu", inscriptions: 8 },
  { name: "Ven", inscriptions: 11 },
  { name: "Sam", inscriptions: 5 },
  { name: "Dim", inscriptions: 2 },
];

// Activités récentes factices
const recentActivities = [
  { id: 1, title: "Nouvelle formation ajoutée", time: "10 min ago", icon: <FaBook className="text-[#D4A017]" /> },
  { id: 2, title: "3 nouveaux étudiants inscrits", time: "1h ago", icon: <FaUsers className="text-[#A52A2A]" /> },
  { id: 3, title: "2 nouveaux professeurs", time: "2h ago", icon: <FaChalkboardTeacher className="text-[#8A8A19]" /> },
];

const Dashboard = () => {
  const [totalEtudiants, setTotalEtudiants] = useState(0);
  const [totalFormations, setTotalFormations] = useState(0);
  const [totalProfesseurs, setTotalProfesseurs] = useState(0);
  const [totalDiplomes, setTotalDiplomes] = useState(0);
  const [etudiantsParFormation, setEtudiantsParFormation] = useState<{ formation: string, count: number }[]>([]);

  useEffect(() => {
    getTotalEtudiants().then(setTotalEtudiants);
    getTotalFormations().then(setTotalFormations);
    getTotalProfesseurs().then(setTotalProfesseurs);
    getTotalDiplomes().then(setTotalDiplomes);
    getEtudiantsParFormation().then(setEtudiantsParFormation);
  }, []);

  // Palette de couleurs pour le graphique
  const CHART_COLORS = [PRIMARY_BROWN, ACCENT_GOLD, SILVER, "#8B4513", "#CD853F"];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'white'}}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: PRIMARY_BROWN }}>Tableau de Bord</h1>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Étudiants" 
          value={totalEtudiants.toString()} 
          change="+12%" 
          isIncrease={true} 
          icon={<FaUsers size={24} />} 
        />
        <StatCard 
          title="Formations" 
          value={totalFormations.toString()} 
          change="+5%" 
          isIncrease={true} 
          icon={<FaBook size={24} />} 
        />
        <StatCard 
          title="Professeurs" 
          value={totalProfesseurs.toString()} 
          change="+3%" 
          isIncrease={true} 
          icon={<FaChalkboardTeacher size={24} />} 
        />
        <StatCard 
          title="Diplômés" 
          value={totalDiplomes.toString()} 
          change="+7%" 
          isIncrease={true} 
          icon={<FaGraduationCap size={24} />} 
        />
      </div>

      {/* Graphique et activités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Graphique à barres */}
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: PRIMARY_BROWN }}>Inscriptions cette semaine</h2>
            <select className="bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-3 py-1 text-sm" style={{ color: PRIMARY_BROWN }}>
              <option>Cette semaine</option>
              <option>Ce mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inscriptionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: CREAM, 
                    borderColor: PRIMARY_BROWN, 
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="inscriptions" 
                  fill={ACCENT_GOLD} 
                  radius={[4, 4, 0, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique circulaire */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4" style={{ color: PRIMARY_BROWN }}>Étudiants par formation</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={etudiantsParFormation} 
                  dataKey="count" 
                  nameKey="formation" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {etudiantsParFormation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} étudiants`, name]}
                  contentStyle={{ 
                    backgroundColor: CREAM, 
                    border: `1px solid ${PRIMARY_BROWN}`,
                    borderRadius: '5px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activités récentes et autres sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4" style={{ color: PRIMARY_BROWN }}>Activités récentes</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: CREAM }}>
                  {activity.icon}
                </div>
                <div>
                  <p className="font-medium" style={{ color: PRIMARY_BROWN }}>{activity.title}</p>
                  <p className="text-sm" style={{ color: ACCENT_GOLD }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm font-medium" style={{ color: PRIMARY_BROWN }}>
            Voir toutes les activités →
          </button>
        </div>

        {/* Prochains événements */}
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4" style={{ color: PRIMARY_BROWN }}>Prochains événements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EventCard 
              title="Examen final" 
              date="15 Juin 2023" 
              time="09:00 - 11:00" 
              location="Salle A12" 
            />
            <EventCard 
              title="Réunion des professeurs" 
              date="18 Juin 2023" 
              time="14:00 - 15:30" 
              location="Salle de conférence" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de carte statistique
function StatCard({ title, value, change, isIncrease, icon }: { 
  title: string; 
  value: string; 
  change: string; 
  isIncrease: boolean; 
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: CREAM }}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: PRIMARY_BROWN }}>{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: ACCENT_GOLD }}>{value}</p>
          <div className={`flex items-center mt-2 text-sm ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
            {isIncrease ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
            {change}
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: LIGHT_BEIGE }}>
          {React.cloneElement(icon as React.ReactElement, { 
            style: { color: PRIMARY_BROWN } 
          })}
        </div>
      </div>
    </div>
  );
}

// Composant de carte d'événement
function EventCard({ title, date, time, location }: { 
  title: string; 
  date: string; 
  time: string; 
  location: string;
}) {
  return (
    <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: CREAM, borderColor: ACCENT_GOLD }}>
      <h3 className="font-semibold" style={{ color: PRIMARY_BROWN }}>{title}</h3>
      <p className="text-sm mt-1" style={{ color: ACCENT_GOLD }}>{date}</p>
      <p className="text-sm mt-1" style={{ color: ACCENT_GOLD }}>{time}</p>
      <div className="flex items-center mt-2">
        <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: LIGHT_BEIGE, color: PRIMARY_BROWN }}>
          {location}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
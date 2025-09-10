'use client';

import { useState, useMemo } from 'react';
import { FaUserCircle, FaSearch, FaAngleDown, FaClock, FaPlus, FaFilter, FaCalendarAlt } from 'react-icons/fa';

const AbsencePage = () => {
  const [absences, setAbsences] = useState([
    { id: 1, creneau: '09:30-10:30', nom: 'Brahdi Houssam', enseignantComment: '', parentComment: '', status: 'Present', details: 'Informatique - CS Ange Bleu CE6C5 - Primaire A' },
    { id: 2, creneau: '09:30-10:30', nom: 'Chekroune Yahya', enseignantComment: '', parentComment: '', status: 'Present', details: 'Informatique - CS Ange Bleu CE6C5 - Primaire A' },
    { id: 3, creneau: '09:30-10:30', nom: 'El Khaoua Kautar', enseignantComment: 'Absence justifiée', parentComment: 'Malade', status: 'Absent', details: 'Informatique - CS Ange Bleu CE6C5 - Primaire A' },
    { id: 4, creneau: '10:30-11:30', nom: 'Fatna Errourgui', enseignantComment: '', parentComment: '', status: 'Present', details: 'Informatique - CS Ange Bleu CE6C6 - Primaire A' },
    { id: 5, creneau: '10:30-11:30', nom: 'Hamdouni Anas', enseignantComment: '', parentComment: '', status: 'Present', details: 'Informatique - CS Ange Bleu CE6C6 - Primaire A' },
    { id: 6, creneau: '11:30-12:30', nom: 'Test Eleve', enseignantComment: '', parentComment: '', status: 'Present', details: 'Mathematique - CS Ange Bleu CE6C1 - Primaire A' },
  ]);

  const [selectedCreneau, setSelectedCreneau] = useState('09:30-10:30');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Couleurs de base améliorées
  const PRIMARY_BROWN = "#A52A2A";
  const ACCENT_GOLD = "#D4A017";
  const LIGHT_BEIGE = "#FFF7EE";
  const TEXT_DARK = "#2C2C2C";
  const SILVER = "#C0C0C0";
  const LIGHT_GRAY = "#F8F9FA";
  const BORDER_COLOR = "#E9ECEF";
  const TEXT_MEDIUM = "#6C757D";
  const SUCCESS_GREEN = "#28A745";
  const DANGER_RED = "#DC3545";

  const toggleAbsenceStatus = (studentId) => {
    setAbsences(currentAbsences =>
      currentAbsences.map(absence => {
        if (absence.id === studentId) {
          return { ...absence, status: absence.status === 'Absent' ? 'Present' : 'Absent' };
        }
        return absence;
      })
    );
  };

  const uniqueCreneaux = useMemo(() => {
    const creneaux = absences.map(a => ({ creneau: a.creneau, details: a.details }));
    return [...new Map(creneaux.map(item => [item['creneau'], item])).values()];
  }, [absences]);

  const filteredAbsences = useMemo(() => {
    return absences
      .filter(a => a.creneau === selectedCreneau)
      .filter(a => a.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [absences, selectedCreneau, searchTerm]);

  const getAvatarColor = (name) => {
    const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: LIGHT_GRAY, fontFamily: 'Roboto, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* En-tête amélioré */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: PRIMARY_BROWN }}>Gestion des Absences</h1>
            <p className="text-sm mt-1" style={{ color: TEXT_MEDIUM }}>Enregistrement et suivi des présences</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
            {/* Champ de recherche stylisé */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out w-full"
                style={{ borderColor: BORDER_COLOR, color: TEXT_DARK }}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: TEXT_MEDIUM }} />
            </div>
            
            {/* Bouton Filtres */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition duration-150 ease-in-out"
              style={{ borderColor: BORDER_COLOR, color: TEXT_DARK }}
            >
              <FaFilter className="text-sm" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: TEXT_DARK }}>Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-sm" style={{ color: TEXT_MEDIUM }} />
                  </div>
                  <input 
                    type="date" 
                    className="pl-10 pr-4 py-2 rounded-lg border w-full"
                    style={{ borderColor: BORDER_COLOR, color: TEXT_DARK }}
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: TEXT_DARK }}>Classe</label>
                <div className="relative">
                  <select className="appearance-none pr-8 pl-4 py-2 rounded-lg border w-full focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out" style={{ borderColor: BORDER_COLOR, color: TEXT_DARK }}>
                    <option>Toutes les classes</option>
                    <option>CE6C5 - Primaire A</option>
                    <option>CE6C6 - Primaire A</option>
                    <option>CE6C1 - Primaire A</option>
                  </select>
                  <FaAngleDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MEDIUM }} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: TEXT_DARK }}>Statut</label>
                <div className="relative">
                  <select className="appearance-none pr-8 pl-4 py-2 rounded-lg border w-full focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out" style={{ borderColor: BORDER_COLOR, color: TEXT_DARK }}>
                    <option>Tous les statuts</option>
                    <option>Présent</option>
                    <option>Absent</option>
                  </select>
                  <FaAngleDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MEDIUM }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Structure en 2 colonnes avec Flexbox */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne de Gauche: Liste des Créneaux améliorée */}
          <div className="w-full lg:w-1/4 flex flex-col gap-3">
            <h2 className="text-sm font-medium px-2 mb-1 flex items-center gap-2" style={{color: TEXT_DARK}}>
              <FaClock className="text-sm" />
              <span>Créneaux horaires</span>
            </h2>
            {uniqueCreneaux.map(({ creneau, details }) => {
              const isSelected = selectedCreneau === creneau;
              return (
                <div
                  key={creneau}
                  onClick={() => setSelectedCreneau(creneau)}
                  className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 ease-in-out border
                              ${isSelected ? 'shadow-md border-l-4' : 'shadow-sm hover:shadow-md'}`}
                  style={{
                    borderLeftColor: isSelected ? PRIMARY_BROWN : BORDER_COLOR,
                    borderColor: isSelected ? PRIMARY_BROWN : BORDER_COLOR,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold" style={{ color: TEXT_DARK }}>{creneau}</p>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ 
                      backgroundColor: isSelected ? ACCENT_GOLD + '20' : LIGHT_GRAY, 
                      color: isSelected ? ACCENT_GOLD : TEXT_MEDIUM 
                    }}>
                      {absences.filter(a => a.creneau === creneau).length} élèves
                    </span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: TEXT_DARK }}>{details.split(' - ')[0]}</p>
                  <p className="text-xs" style={{ color: TEXT_MEDIUM }}>{details.split(' - ').slice(1).join(' - ')}</p>
                </div>
              );
            })}
          </div>

          {/* Colonne de Droite: Tableau des Élèves amélioré */}
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-4 border-b" style={{ borderColor: BORDER_COLOR }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: TEXT_DARK }}>
                  Élèves - {selectedCreneau}
                  <span className="text-sm font-normal ml-2" style={{ color: TEXT_MEDIUM }}>
                    ({filteredAbsences.length} élèves)
                  </span>
                </h2>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition duration-150 ease-in-out" style={{ backgroundColor: PRIMARY_BROWN, color: 'white' }}>
                  <FaPlus className="text-xs" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    <th className="text-left text-xs font-medium uppercase tracking-wider p-4" style={{ color: TEXT_MEDIUM }}>Élève</th>
                    <th className="text-left text-xs font-medium uppercase tracking-wider p-4" style={{ color: TEXT_MEDIUM }}>Commentaire enseignant</th>
                    <th className="text-left text-xs font-medium uppercase tracking-wider p-4" style={{ color: TEXT_MEDIUM }}>Commentaire parent</th>
                    <th className="text-left text-xs font-medium uppercase tracking-wider p-4" style={{ color: TEXT_MEDIUM }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbsences.map((absence) => (
                    <tr key={absence.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                      <td className="p-4" style={{ color: TEXT_DARK }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                            style={{ backgroundColor: getAvatarColor(absence.nom) }}
                          >
                            {absence.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{absence.nom}</div>
                            <div className="text-xs" style={{ color: TEXT_MEDIUM }}>{absence.details.split(' - ')[2]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm" style={{ color: TEXT_MEDIUM }}>
                          {absence.enseignantComment || (
                            <button className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-dashed" style={{ color: TEXT_MEDIUM, borderColor: BORDER_COLOR }}>
                              <FaPlus className="text-xs" />
                              <span>Ajouter un commentaire</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm" style={{ color: TEXT_MEDIUM }}>
                          {absence.parentComment || (
                            <span className="text-xs italic" style={{ color: TEXT_MEDIUM }}>Aucun commentaire</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleAbsenceStatus(absence.id)}
                          className="py-2 px-4 rounded-full font-medium text-xs uppercase transition-colors duration-200 ease-in-out flex items-center gap-2"
                          style={{
                            backgroundColor: absence.status === 'Absent' ? DANGER_RED + '20' : SUCCESS_GREEN + '20',
                            color: absence.status === 'Absent' ? DANGER_RED : SUCCESS_GREEN,
                            border: 'none',
                            cursor: 'pointer',
                            minWidth: '110px',
                          }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: absence.status === 'Absent' ? DANGER_RED : SUCCESS_GREEN }}></div>
                          {absence.status === 'Absent' ? 'Absent' : 'Présent'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAbsences.length === 0 && (
              <div className="p-8 text-center" style={{ color: TEXT_MEDIUM }}>
                <FaUserCircle className="text-4xl mx-auto mb-2 opacity-50" />
                <p>Aucun élève trouvé pour ce créneau</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsencePage;
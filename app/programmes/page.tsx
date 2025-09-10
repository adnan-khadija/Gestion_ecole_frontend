'use client';

import { useState, useEffect } from 'react';
import { Programme, Formation, Diplome, Matiere } from '@/lib/types';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getProgrammes, getFormations, getDiplomes, getMatieres, addProgramme, updateProgramme, deleteProgramme } from '@/lib/services';
import ProgrammeForm from '@/components/forms/ProgrammeForm';

// Couleurs personnalisées
const PRIMARY_BROWN = "#A52A2A";
const ACCENT_GOLD = "#D4A017";
const TEXT_DARK = "#2C2C2C";
const SILVER = "#C0C0C0";
const RED = "#FF0000";
const LIGHT_GRAY = "#F5F5F5";

const ProgrammesPage = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [progs, forms, dips, mats] = await Promise.all([
        getProgrammes(),
        getFormations(),
        getDiplomes(),
        getMatieres()
      ]);
      
      // S'assurer que programmes est toujours un tableau
      setProgrammes(Array.isArray(progs) ? progs : []);
      setFormations(Array.isArray(forms) ? forms : []);
      setDiplomes(Array.isArray(dips) ? dips : []);
      setMatieres(Array.isArray(mats) ? mats : []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
      setProgrammes([]); // S'assurer que programmes est un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterProgramme = async (programme: Programme) => {
    try {
      if (editingProgramme) {
        const updated = await updateProgramme(programme);
        setProgrammes(prev => Array.isArray(prev) ? prev.map(p => p.id === updated.id ? updated : p) : []);
        setEditingProgramme(null);
      } else {
        const newProgramme = await addProgramme(programme);
        setProgrammes(prev => Array.isArray(prev) ? [...prev, newProgramme] : [newProgramme]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification du programme:', error);
      setError('Erreur lors de la sauvegarde du programme');
    }
  };

  const handleEditProgramme = (programme: Programme) => {
    setEditingProgramme(programme);
    setShowForm(true);
  };

  const handleDeleteProgramme = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
      try {
        await deleteProgramme(id);
        setProgrammes(prev => Array.isArray(prev) ? prev.filter(p => p.id !== id) : []);
        if (selectedProgramme?.id === id) {
          setSelectedProgramme(null);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du programme:', error);
        setError('Erreur lors de la suppression du programme');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProgramme(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: LIGHT_GRAY }}>
        <div className="text-xl" style={{ color: TEXT_DARK }}>Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: LIGHT_GRAY }}>
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={loadData}
            className="px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: PRIMARY_BROWN }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // S'assurer que programmes est toujours un tableau avant d'utiliser .map()
  const programmesList = Array.isArray(programmes) ? programmes : [];

  return (
   <div className="h-screen p-6 overflow-hidden" style={{ backgroundColor: LIGHT_GRAY }}>
  <div className="max-w-6xl mx-auto h-full">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Rectangle vertical with minimized height */}
      <div 
        className="lg:col-span-1 rounded-lg shadow-lg p-4 flex items-center justify-start"
        style={{ backgroundColor: SILVER, height: '100px' }} // Reduced height
      >
        {/* Button styled to match the image */}
        <button
          onClick={() => {
            setEditingProgramme(null);
            setShowForm(true);
          }}
          className="rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ 
            backgroundColor: ACCENT_GOLD, 
            color: TEXT_DARK,
            width: '60px',
            height: '60px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginRight: '10px'
          }}
          aria-label="Ajouter un programme"
        >
          <FaPlus size={24} />
        </button>
        <span style={{ color: TEXT_DARK }}>Ajouter</span>
      </div>
    </div>
  </div>
</div>
  );
};

export default ProgrammesPage;
'use client';

import { useState, useEffect } from 'react';
import { Programme, Formation, Diplome, Matiere } from '@/lib/types';

// Couleurs personnalisées
const PRIMARY_BROWN = "#A52A2A";
const ACCENT_GOLD = "#D4A017";
const TEXT_DARK = "#2C2C2C";
const SILVER = "#C0C0C0";
const RED = "#FF0000";
const LIGHT_GRAY = "#F5F5F5";

interface ProgrammeFormProps {
  programme?: Partial<Programme>;
  onSubmit: (programme: Programme) => void;
  onCancel: () => void;
  formations: Formation[];
  diplomes: Diplome[];
  matieres: Matiere[];
}

const ProgrammeForm = ({ 
  programme, 
  onSubmit, 
  onCancel, 
  formations, 
  diplomes, 
  matieres 
}: ProgrammeFormProps) => {
  const [formData, setFormData] = useState<Partial<Programme>>({
    nomProgramme: '',
    description: '',
    duree: '',
    dateDebut: '',
    dateFin: '',
    formation: undefined,
    diplome: undefined,
    matieres: [],
    ...programme
  });

  const [selectedMatieres, setSelectedMatieres] = useState<string[]>(
    programme?.matieres?.map(m => m.id.toString()) || []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'formation') {
      const selectedFormation = formations.find(f => f.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        formation: selectedFormation
      }));
    } else if (name === 'diplome') {
      const selectedDiplome = diplomes.find(d => d.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        diplome: selectedDiplome
      }));
    }
  };

  const handleMatiereChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setSelectedMatieres(prev => [...prev, value]);
    } else {
      setSelectedMatieres(prev => prev.filter(id => id !== value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedMatiereObjects = matieres.filter(m => 
      selectedMatieres.includes(m.id.toString())
    );
    
    const programmeToSubmit: Programme = {
      id: formData.id || Date.now(),
      nomProgramme: formData.nomProgramme || '',
      description: formData.description || '',
      duree: formData.duree || '',
      dateDebut: formData.dateDebut || '',
      dateFin: formData.dateFin || '',
      formation: formData.formation,
      diplome: formData.diplome,
      matieres: selectedMatiereObjects
    };
    
    onSubmit(programmeToSubmit);
  };

  const isFormValid = formData.nomProgramme && formData.duree && formData.dateDebut && formData.dateFin;

  return (
    <div 
      className="rounded-lg shadow-lg p-6"
      style={{ backgroundColor: 'white' }}
    >
      <h2 className="text-2xl font-bold mb-6" style={{ color: PRIMARY_BROWN }}>
        {programme?.id ? 'Modifier le Programme' : 'Nouveau Programme'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block mb-2 font-medium" style={{ color: TEXT_DARK }}>
              Nom du programme *
            </label>
            <input
              type="text"
              name="nomProgramme"
              value={formData.nomProgramme || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: SILVER }}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium" style={{ color: TEXT_DARK }}>
              Durée (jours) *
            </label>
            <input
              type="number"
              name="duree"
              value={formData.duree || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: SILVER }}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium" style={{ color: TEXT_DARK }}>
              Date de début *
            </label>
            <input
              type="date"
              name="dateDebut"
              value={formData.dateDebut || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: SILVER }}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium" style={{ color: TEXT_DARK }}>
              Date de fin *
            </label>
            <input
              type="date"
              name="dateFin"
              value={formData.dateFin || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: SILVER }}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium" style={{ color: TEXT_DARK }}>
              Formation
            </label>
            <select
              name="formation"
              value={formData.formation?.id || ''}
              onChange={handleSelectChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: SILVER }}
            >
              <option value="">Sélectionner une formation</option>
              {formations.map(formation => (
                <option key={formation.id} value={formation.id}>
                  {formation.nom}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium" style={{ color: TEXT_DARK }}>
              Diplôme
            </label>
            <select
              name="diplome"
              value={formData.diplome?.id || ''}
              onChange={handleSelectChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: SILVER }}
            >
              <option value="">Sélectionner un diplôme</option>
              {diplomes.map(diplome => (
                <option key={diplome.id} value={diplome.id}>
                  {diplome.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium" style={{ color: TEXT_DARK }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2"
            style={{ borderColor: SILVER }}
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium" style={{ color: TEXT_DARK }}>
            Matières
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {matieres.map(matiere => (
              <div key={matiere.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`matiere-${matiere.id}`}
                  value={matiere.id}
                  checked={selectedMatieres.includes(matiere.id.toString())}
                  onChange={handleMatiereChange}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: PRIMARY_BROWN }}
                />
                <label htmlFor={`matiere-${matiere.id}`} className="ml-2 text-sm">
                  {matiere.nom}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md font-medium transition-all"
            style={{ backgroundColor: SILVER, color: TEXT_DARK }}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md font-medium text-white transition-all"
            style={{ backgroundColor: isFormValid ? PRIMARY_BROWN : SILVER }}
            disabled={!isFormValid}
          >
            {programme?.id ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgrammeForm;
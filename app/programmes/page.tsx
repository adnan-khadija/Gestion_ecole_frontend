'use client';

import { useState, useEffect } from 'react';

// Couleurs personnalisées
const PRIMARY_BROWN = "#A52A2A";
const ACCENT_GOLD = "#D4A017";
const TEXT_DARK = "#2C2C2C";
const SILVER = "#C0C0C0";
const RED = "#FF0000";
const LIGHT_GRAY = "#F5F5F5";

interface ProgrammesFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const ProgrammesForm = ({ onSubmit, onCancel, initialData }: ProgrammesFormProps) => {
  const [formData, setFormData] = useState({
    programmeType: 'formation',
    duree: '',
    startDate: '',
    programmeName: '',
    description: '',
    endDate: '',
    emploiDuTemps: null as File | null,
    matieres: [] as string[],
    ...initialData
  });

  const [matiereInput, setMatiereInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      emploiDuTemps: file
    }));
  };

  const handleMatiereAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && matiereInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        matieres: [...prev.matieres, matiereInput.trim()]
      }));
      setMatiereInput('');
    }
  };

  const handleMatiereRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      matieres: prev.matieres.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form className='flex flex-col m-4 p-6 border-2 border-gray-300 rounded-lg gap-6 bg-white shadow-md' onSubmit={handleSubmit}>
      
      {/* En-tête */}
      <div className='bg-[#8a8a19] text-white py-3 px-4 rounded-md -mx-2 -mt-2'>
        <h1 className='text-lg font-bold'>Ajouter Un programme</h1>
      </div>

      {/* Première ligne : Formation, Diplôme, Durée, Date début */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end pl-4'>
        
        {/* Type de programme */}
        <div className='flex flex-col gap-1'>
          <label className='text-gray-700 font-medium'>Type de programme</label>
          <div className='flex gap-6'>
            <div className='flex items-center gap-1'>
              <input 
                type="radio" 
                id="formation" 
                name="programmeType" 
                value="formation" 
                checked={formData.programmeType === 'formation'}
                onChange={handleInputChange}
                className='h-4 w-4 text-[#8a8a19]' 
              />
              <label htmlFor="formation" className='text-gray-700 text-sm'>Formation</label>
            </div>
            <div className='flex items-center gap-1'>
              <input 
                type="radio" 
                id="diplome" 
                name="programmeType" 
                value="diplome" 
                checked={formData.programmeType === 'diplome'}
                onChange={handleInputChange}
                className='h-4 w-4 text-[#8a8a19]' 
              />
              <label htmlFor="diplome" className='text-gray-700 text-sm'>Diplôme</label>
            </div>
          </div>
        </div>

        {/* Durée */}
        <div className='flex flex-col gap-1'>
          <label className='text-gray-700 font-medium'>Durée</label>
          <input 
            type="text" 
            name="duree"
            value={formData.duree}
            onChange={handleInputChange}
            placeholder='3 ans, 6 mois' 
            className='border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#8a8a19]' 
          />
        </div>

        {/* Date de début */}
        <div className='flex flex-col gap-1'>
          <label htmlFor="startDate" className='text-gray-700 font-medium'>Date de début</label>
          <input 
            type="date" 
            id="startDate" 
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className='border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#8a8a19]' 
          />
        </div>

      </div>

      {/* Deuxième section : Layout en 2 colonnes */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 px-4'>
        
        {/* Colonne GAUCHE : Nom programme + Description */}
        <div className='space-y-4'>
          
          {/* Nom du programme */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="programmeName" className='text-gray-700 font-medium'>Nom du programme</label>
            <input 
              type="text" 
              id="programmeName" 
              name="programmeName"
              value={formData.programmeName}
              onChange={handleInputChange}
              placeholder='Licence Professionnelle...' 
              className='border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#8a8a19]' 
            />
          </div>

          {/* Description */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="description" className='text-gray-700 font-medium'>Description</label>
            <textarea 
              id="description" 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Description du programme...' 
              className='border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#8a8a19] min-h-[150px]' 
            />
          </div>

        </div>

        {/* Colonne DROITE : Date fin + Emploi temps + Matières */}
        <div className='space-y-4'>
          
          {/* Date de fin */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="endDate" className='text-gray-700 font-medium'>Date de fin</label>
            <input 
              type="date" 
              id="endDate" 
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className='border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#8a8a19]' 
            />
          </div>

          {/* Emploi du temps */}
          <div className='flex flex-col gap-1'>
            <label htmlFor='emploiDuTemps' className='text-gray-700 font-medium'>Emploi du temps</label>
            <input 
              type="file" 
              id='emploiDuTemps' 
              onChange={handleFileChange}
              className='border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#8a8a19]' 
            />
          </div>

          {/* Liste des matières */}
          <div className='flex flex-col gap-1'>
            <label htmlFor="matieres" className='text-gray-700 font-medium'>Matières associées</label>
            <div className='border-2 border-gray-300 rounded-md px-3 py-2 min-h-[100px] focus-within:border-[#8a8a19]'>
              <input 
                type="text" 
                id="matieres" 
                value={matiereInput}
                onChange={(e) => setMatiereInput(e.target.value)}
                onKeyDown={handleMatiereAdd}
                placeholder='Rechercher des matières...' 
                className='w-full border-none focus:outline-none' 
              />
              {/* Espace pour la liste des matières ajoutées */}
              <div className='mt-2 space-y-1'>
                {formData.matieres.map((matiere, index) => (
                  <div key={index} className='flex items-center justify-between bg-gray-100 px-2 py-1 rounded'>
                    <span className='text-sm'>{matiere}</span>
                    <button 
                      type="button"
                      onClick={() => handleMatiereRemove(index)}
                      className='text-red-500 hover:text-red-700 text-sm'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Boutons d'action */}
      <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
        <button 
          type='button' 
          onClick={handleCancel}
          className='bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition duration-200 font-medium'
        >
          Annuler
        </button>
        <button 
          type='submit' 
          className='bg-[#8a8a19] text-white px-6 py-2 rounded-md hover:bg-[#797915] transition duration-200 font-medium'
        >
          Enregistrer
        </button>
      </div>

    </form>
  );
};

export default ProgrammesForm;
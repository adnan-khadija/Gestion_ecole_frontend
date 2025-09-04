import React, { useState, useEffect } from 'react';
import { Formation, ModeFormation, Professeur } from '@/lib/types';
import { addFormation ,getProfesseurs} from '@/lib/services';
import toast from 'react-hot-toast';

interface FormationFormProps {
  onSave: (formation: Formation) => void;
  professeurs: Professeur[];
  formationInitial?: Omit<Formation, 'id'>;
}

const FormationForm = ({ onSave, professeurs, formationInitial }: FormationFormProps) => {
    
  const [formation, setFormation] = useState<Omit<Formation, 'id'>>({
    nom: '',
    description: '',
    duree: 0,
    cout: 0,
    professeurs: [],
    emploiDuTempsId: null,
    anneeFormation: new Date().getFullYear(),
    estActive: true,
    modeFormation: ModeFormation.Presentiel,
    niveauAcces: '',
    capaciteMax: 0,
  });

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (formationInitial) {
      setFormation({
        ...formationInitial,
        professeurs: formationInitial.professeurs || []
      });
    }
  }, [formationInitial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "professeurs") {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions);
      const selectedProfesseurs = selectedOptions.map(option => parseInt(option.value));
      
      // Validation: max 2 professeurs
      if (selectedProfesseurs.length > 2) {
        setError("Maximum 2 professeurs autorisés");
        return;
      } else {
        setError('');
      }

      setFormation(prev => ({
        ...prev,
        professeurs: selectedProfesseurs
      }));
    } else {
      setFormation(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseFloat(value) : 
                value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation finale
    if (formation.professeurs.length > 2) {
      setError("Maximum 2 professeurs autorisés");
      return;
    }

    if (formationInitial) {
      onSave({ ...formation, id: (formationInitial as any).id });
      toast.success("Formation modifiée avec succès !");
      return;
    }

    const now = new Date().toISOString();
    const formationComplet: Formation = {
      ...formation,
      id: Date.now(),
      dateCreation: now,
      dateModification: now,
    };

    try {
      await addFormation(formationComplet);
      onSave(formationComplet);
      toast.success("Formation ajoutée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la formation");
      console.error("Erreur lors de l'ajout de la formation:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Section Informations de base */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations de base
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Nom de la formation*</label>
            <input
              type="text"
              name="nom"
              value={formation.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Description</label>
            <textarea
              name="description"
              value={formation.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Durée (mois)*</label>
            <input
              type="number"
              name="duree"
              value={formation.duree}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Coût (FCFA)*</label>
            <input
              type="number"
              name="cout"
              value={formation.cout}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Configuration */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Mode de formation*</label>
            <select
              name="modeFormation"
              value={formation.modeFormation}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              {Object.values(ModeFormation).map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Niveau d'accès requis</label>
            <input
              type="text"
              name="niveauAcces"
              value={formation.niveauAcces}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Capacité maximale</label>
            <input
              type="number"
              name="capaciteMax"
              value={formation.capaciteMax}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Année de formation</label>
            <input
              type="number"
              name="anneeFormation"
              value={formation.anneeFormation}
              onChange={handleChange}
              min="2000"
              max="2100"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

     {/* Section Professeurs */}
<div className="bg-white rounded-xl p-4 border border-gray-200">
  <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
    Professeurs assignés
  </h3>
  <div className="space-y-1">
    <label className="block text-xs font-bold text-black">Sélectionnez les professeurs (max 2)</label>
    <select
      name="professeurs"
      multiple
      value={(formation.professeurs || []).map(p => ('id' in p ? p.id.toString() : p.toString()))}
      onChange={(e) => {
        const selectedIds = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value));

        if (selectedIds.length > 2) {
          setError("Maximum 2 professeurs autorisés");
          return;
        } else setError("");

        // Récupérer les objets Professeur correspondants
        const selectedProfesseurs = professeurs.filter(p => selectedIds.includes(p.id));
        setFormation(prev => ({ ...prev, professeurs: selectedProfesseurs }));
      }}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
      size={4}
    >
      {professeurs.map(prof => (
        <option key={prof.id} value={prof.id}>
          {prof.nom} {prof.prenom} - {prof.specialite}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-xs text-[#FF0000] mt-1 font-medium">{error}</p>
    )}
    <p className="text-xs text-gray-500 mt-1">
      Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs professeurs
    </p>
  </div>
</div>


      {/* Section Statut */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Statut
        </h3>
        <div className="flex items-center space-x-6">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                name="estActive"
                checked={formation.estActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A017]"></div>
            </div>
            <span className="text-xs font-bold text-black">Formation active</span>
          </label>
        </div>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          className="px-6 py-3 text-sm bg-[#C0C0C0] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-all transform hover:scale-105"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:ring-opacity-50 transition-all transform hover:scale-105"
        >
          {formationInitial ? 'Modifier' : 'Créer'} la formation
        </button>
      </div>
    </form>
  );
};

export default FormationForm;
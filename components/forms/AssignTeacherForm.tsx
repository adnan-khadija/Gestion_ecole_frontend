import React, { useState, useEffect } from 'react';
import { fetchEnseignants } from '@/lib/enseignant';
import toast from 'react-hot-toast';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { assignEnseignantToModule } from '@/lib/modules';
import { getUserById } from '@/lib/auth';
import { EnseignantResponse, UserResponse } from '@/lib/types';

interface AssignTeacherFormProps {
  moduleId: string;
  onSave: () => void;
  onCancel: () => void;
}

interface EnseignantWithDetails {
  enseignantId: string; // ID de l'entité Enseignant
  userId: string;
  prenom: string;
  nom: string;
  email: string;
  specialite: string;
}

export default function AssignTeacherForm({ moduleId, onSave, onCancel }: AssignTeacherFormProps) {
  const [enseignants, setEnseignants] = useState<EnseignantWithDetails[]>([]);
  const [selectedEnseignant, setSelectedEnseignant] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEnseignants, setLoadingEnseignants] = useState(true);

  useEffect(() => {
    const loadEnseignants = async () => {
      try {
        const data = await fetchEnseignants();
        
        // DEBUG: Vérifiez la structure des données enseignants
        console.log("Données enseignants brutes:", data);
        
        const detailsPromises = data.map(async (enseignant: EnseignantResponse) => {
          try {
            const userDetails = await getUserById(enseignant.userId);
            
            // DEBUG: Vérifiez les IDs
            console.log("Enseignant ID:", enseignant.enseignantId);
            console.log("User ID:", enseignant.userId);
            console.log("User details:", userDetails);
            
            return {
              enseignantId: enseignant.enseignantId, // Utilisez enseignantId, pas userId
              userId: enseignant.userId,
              prenom: userDetails.prenom,
              nom: userDetails.nom,
              email: userDetails.email,
              specialite: enseignant.specialite
            };
          } catch (error) {
            console.error(`Erreur chargement détails enseignant ${enseignant.userId}:`, error);
            return {
              enseignantId: enseignant.enseignantId,
              userId: enseignant.userId,
              prenom: 'Inconnu',
              nom: 'Inconnu',
              email: 'Non disponible',
              specialite: enseignant.specialite
            };
          }
        });

        const details = await Promise.all(detailsPromises);
        console.log("Enseignants avec détails:", details);
        setEnseignants(details);
      } catch (err) {
        console.error('Erreur chargement enseignants:', err);
        toast.error('Erreur lors du chargement des enseignants');
      } finally {
        setLoadingEnseignants(false);
      }
    };

    loadEnseignants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnseignant) {
      toast.error('Veuillez sélectionner un enseignant');
      return;
    }

    // DEBUG: Vérifiez ce qui est envoyé
    console.log("Enseignant ID envoyé:", selectedEnseignant);
    console.log("Type de l'ID:", typeof selectedEnseignant);
    console.log("Module ID:", moduleId);

    // Vérifiez que c'est bien un UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(selectedEnseignant)) {
      console.error("L'ID sélectionné n'est pas un UUID valide:", selectedEnseignant);
      toast.error("ID enseignant invalide");
      return;
    }

    setLoading(true);
    try {
      await assignEnseignantToModule(moduleId, selectedEnseignant);
      toast.success('Enseignant assigné avec succès');
      onSave();
    } catch (err) {
      console.error('Erreur assignation enseignant:', err);
      toast.error('Erreur lors de l\'assignation de l\'enseignant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaChalkboardTeacher className="text-[#A52A2A]" />
        Assigner un enseignant
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un enseignant
          </label>
          {loadingEnseignants ? (
            <div className="p-3 text-center text-gray-500">Chargement des enseignants...</div>
          ) : (
            <select
              value={selectedEnseignant}
              onChange={(e) => setSelectedEnseignant(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent"
              required
            >
              <option value="">Choisir un enseignant</option>
              {enseignants.map((enseignant) => (
                <option key={enseignant.enseignantId} value={enseignant.enseignantId}>
                  {enseignant.prenom} {enseignant.nom} - {enseignant.specialite} 
                </option>
              ))}
            </select>
          )}
        </div>

      

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || loadingEnseignants}
            className="px-4 py-2 bg-[#A52A2A] text-white rounded-lg hover:bg-[#8B1A1A] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Assignation...' : 'Assigner'}
          </button>
        </div>
      </form>
    </div>
  );
}
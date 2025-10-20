// hooks/useEmploiDuTemps.ts
"use client";

import { useState, useEffect } from 'react';
import { 
  fetchEmploiDuTempsById,
  fetchEmploiDuTempsByGroupe,
  fetchEmploiDuTempsByEnseignant,
  fetchEmploiDuTempsByModule,
  fetchAllEmploiDuTemps
} from '@/lib/emploiDuTemps';
import { EmploiDuTempsResponse } from'@/lib/types';

interface UseEmploiDuTempsProps {
  type: 'all' | 'groupe' | 'enseignant' | 'module' | 'id';
  groupe?: string;
  anneeAcademique?: string;
  enseignantId?: string;
  moduleId?: string;
  emploiId?: string;
}

export const useEmploiDuTemps = ({
  type,
  groupe,
  anneeAcademique,
  enseignantId,
  moduleId,
  emploiId
}: UseEmploiDuTempsProps) => {
  const [emplois, setEmplois] = useState<EmploiDuTempsResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmplois = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data: EmploiDuTempsResponse | EmploiDuTempsResponse[];
      
      switch (type) {
        case 'all':
          data = await fetchAllEmploiDuTemps();
          break;
        case 'groupe':
          if (!groupe || !anneeAcademique) throw new Error('Groupe et année académique requis');
          data = await fetchEmploiDuTempsByGroupe(groupe, anneeAcademique);
          break;
        case 'enseignant':
          if (!enseignantId) throw new Error('ID enseignant requis');
          data = await fetchEmploiDuTempsByEnseignant(enseignantId, anneeAcademique);
          break;
        case 'module':
          if (!moduleId) throw new Error('ID module requis');
          data = await fetchEmploiDuTempsByModule(moduleId);
          break;
        case 'id':
          if (!emploiId) throw new Error('ID emploi du temps requis');
          data = await fetchEmploiDuTempsById(emploiId);
          break;
        default:
          throw new Error('Type de recherche non supporté');
      }

      // Normaliser en tableau
      const emploisArray = Array.isArray(data) ? data : [data];
      setEmplois(emploisArray);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des emplois du temps');
      console.error('Erreur useEmploiDuTemps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmplois();
  }, [type, groupe, anneeAcademique, enseignantId, moduleId, emploiId]);

  return { emplois, loading, error, refetch: fetchEmplois };
};
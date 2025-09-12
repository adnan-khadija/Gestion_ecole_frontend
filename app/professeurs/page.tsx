'use client';
import React, { useState, useEffect } from "react";
import TableauDynamique, { Column, ImportConfig, ExportConfig, FilterConfig } from "@/components/TableauDynamique";
import { Professeur, StatutProfesseur } from "@/lib/types";
import { getProfesseurs, addProfesseur, updateProfesseur, deleteProfesseur, getFormations, getDiplomes } from "@/lib/services";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";
import ProfesseurProfile from "@/components/cards/ProfesseurProfile";
import ProfesseurForm from "@/components/forms/ProfesseurForm";

export default function ProfesseursPage() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [diplomes, setDiplomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProf, setSelectedProf] = useState<Professeur | null>(null);

  // Chargement initial
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profsResponse, formationsResponse, diplomesResponse] = await Promise.all([
          getProfesseurs(),
          getFormations(),
          getDiplomes()
        ]);
        
        setProfesseurs(profsResponse.data);
        setFormations(formationsResponse.data);
        setDiplomes(diplomesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Colonnes du tableau pour Professeur
  const colonnesProfesseurs: Column<Professeur>[] = [
    {
      key: "nom",
      title: "Nom",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProf(item);
            }}
            className="text-[#D4A017] hover:text-gray-700 transition-colors"
            title="Voir les détails"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <span className="whitespace-nowrap text-xs text-gray-500">{item.nom}</span>
        </div>
      ),
    },
    {
      key: "prenom",
      title: "Prénom",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.prenom}</span>
      ),
    },
    {
      key: "telephone",
      title: "Téléphone",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.telephone || "-"}</span>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.email}</span>
      ),
    },
    {
      key: "specialite",
      title: "Spécialité",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.specialite || "-"}</span>
      ),
    },
    {
      key: "statut",
      title: "Statut",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.statut || "-"}</span>
      ),
    },
    {
      key: "dateEmbauche",
      title: "Date d'embauche",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.dateEmbauche || "-"}</span>
      ),
    },
    {
      key: "heuresTravail",
      title: "Heures Travail",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.heuresTravail ?? "-"}</span>
      ),
    },
    {
      key: "formations",
      title: "Formations",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">
          {item.formations?.map(f => f.nom).join(", ") || "-"}
        </span>
      ),
    },
    {
      key: "diplomes",
      title: "Diplômes",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">
          {item.diplomes?.map(d => d.nomDiplome || d.nom).join(", ") || "-"}
        </span>
      )
    },
  ];

  // Configuration d'import
  const importConfig: ImportConfig<Professeur> = {
    headers: ['Nom', 'Prénom', 'Email', 'Téléphone', 'Spécialité', 'Statut', 'Date embauche', 'Heures travail'],
    mapper: (row: Record<string, any>) => ({
      id: 0, // Généré côté backend
      nom: row.Nom,
      prenom: row.Prénom,
      email: row.Email,
      telephone: row.Téléphone,
      specialite: row.Spécialité,
      statut: row.Statut as StatutProfesseur,
      dateEmbauche: row['Date embauche'],
      heuresTravail: parseInt(row['Heures travail']) || 0,
    } as Professeur),
    validator: (row: Record<string, any>, index: number) => {
      const errors: string[] = [];
      if (!row.Nom) errors.push(`Ligne ${index + 1}: Le nom est requis`);
      if (!row.Prénom) errors.push(`Ligne ${index + 1}: Le prénom est requis`);
      if (!row.Email) errors.push(`Ligne ${index + 1}: L'email est requis`);
      if (!Object.values(StatutProfesseur).includes(row.Statut)) {
        errors.push(`Ligne ${index + 1}: Statut invalide`);
      }
      return errors;
    }
  };

  // Configuration d'export
  const exportConfig: ExportConfig<Professeur> = {
    filename: 'professeurs',
    mapper: (item: Professeur) => ({
      Nom: item.nom,
      Prénom: item.prenom,
      Email: item.email,
      Téléphone: item.telephone,
      Spécialité: item.specialite,
      Statut: item.statut,
      'Date embauche': item.dateEmbauche,
      'Heures travail': item.heuresTravail,
      Formations: item.formations?.map(f => f.nom).join(", ") || "-",
      Diplômes: item.diplomes?.map(d => d.nomDiplome || d.nom).join(", ") || "-",
    })
  };

  // Configuration des filtres
  const professeurFilters: FilterConfig[] = [
    {
      key: 'statut',
      label: 'Statut',
      options: [
        { value: '', label: 'Tous' },
        ...Object.values(StatutProfesseur).map(statut => ({
          value: statut,
          label: statut
        }))
      ]
    },
    {
      key: 'specialite',
      label: 'Spécialité',
      options: [
        { value: '', label: 'Toutes' },
        ...Array.from(new Set(professeurs.map(p => p.specialite).filter(Boolean))).map(specialite => ({
          value: specialite as string,
          label: specialite as string
        }))
      ]
    }
  ];

  // Ajout
  const handleAdd = async (prof: Professeur) => {
    try {
      const res = await addProfesseur(prof);
      setProfesseurs(prev => [...prev, res.data || prof]);
      toast.success("Professeur ajouté");
    } catch (err) {
      console.error("Erreur ajout:", err);
      toast.error("Erreur lors de l'ajout");
      throw err;
    }
  };

  // Édition
  const handleEdit = async (prof: Professeur) => {
    try {
      const res = await updateProfesseur(prof.id, prof);
      setProfesseurs(prev => prev.map(p => (p.id === prof.id ? (res.data || prof) : p)));
      toast.success("Professeur mis à jour");
    } catch (err) {
      console.error("Erreur update:", err);
      toast.error("Erreur lors de la mise à jour");
      throw err;
    }
  };

  // Suppression
  const handleDelete = async (id: number | string) => {
    try {
      await deleteProfesseur(id);
      setProfesseurs(prev => prev.filter(p => p.id !== id));
      toast.success("Professeur supprimé");
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression");
      throw err;
    }
  };



  return (
    <div className="container mx-auto p-4 space-y-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Tableau des professeurs avec le composant TableauDynamique */}
          <TableauDynamique<Professeur>
            data={professeurs}
            columns={colonnesProfesseurs}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={(prof) => setSelectedProf(prof)}
            emptyMessage="Aucun professeur trouvé"
            
            // Configuration import/export
            importConfig={importConfig}
            exportConfig={exportConfig}
            
            // Configuration des filtres
            filters={professeurFilters}
            
            // Composant de formulaire personnalisé
            formComponent={({ itemInitial, onSave, onCancel }) => (
                    <ProfesseurForm
                        professeurInitial={itemInitial}
                        onSave={onSave}
                        onCancel={onCancel}
                    />
                )}
            
            // Options d'affichage
            showActions={true}
            showSearch={true}
            showImportExport={true}
            showFilters={true}
            showAddButton={true}
          />

          {/* Profil du professeur (modal) */}
          {selectedProf && (
            <ProfesseurProfile
              professeur={selectedProf}
              onClose={() => setSelectedProf(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
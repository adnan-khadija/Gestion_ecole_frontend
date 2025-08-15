"use client";
import TableauDynamique from "@/components/TableData";
import { useState } from "react";
import { Column } from "@/components/TableData";

interface Professeur {
  id: number;
  nom: string;
  matiere: string;
  anciennete: number;
}

export default function Teacher() {


  // Données des professeurs
  const [professeurs, setProfesseurs] = useState<Professeur[]>([
    { id: 1, nom: 'Durand', matiere: 'Mathématiques', anciennete: 5 },
    { id: 2, nom: 'Leroy', matiere: 'Français', anciennete: 2 },
  ]);

  // Colonnes pour les professeurs
  const colonnesProfesseurs: Column<Professeur>[] = [
    { key: 'id', title: 'ID' },
    { key: 'nom', title: 'Nom' },
    { key: 'matiere', title: 'Matière' },
    { 
      key: 'anciennete', 
      title: 'Ancienneté (ans)',
      render: (item) => <span className="font-semibold">{item.anciennete}</span>
    },
  ];

  const handleEdit = <T extends { id: number | string }>(item: T) => {
    console.log('Modifier:', item);
  };

  const handleDelete = (id: number | string) => {
    console.log('Supprimer ID:', id);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Tableau des étudiants */}
      

      {/* Tableau des professeurs */}
      <div>
        <h2 className="text-xl font-bold mb-4">Liste des professeurs</h2>
        <TableauDynamique<Professeur>
          data={professeurs}
          columns={colonnesProfesseurs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actionsColor="green"
          emptyMessage="Aucun professeur trouvé"
        />
      </div>
    </div>
  );
}
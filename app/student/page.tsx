"use client";
import TableauDynamique from "@/components/TableData";
import { useState ,useEffect} from "react";
import { Column } from "@/components/TableData";
import { Etudiant } from "@/lib/types";
import { getEtudiants } from "@/lib/etudiantService";
import { Switch } from "@headlessui/react";




export default function Student() {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
    getEtudiants()
      .then(response => {
        setEtudiants(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des étudiants:", error);
        setLoading(false);
      });
  }, []);

  const filterConfig = {
  visibleFilters: ['nom', 'email'], 
  searchPlaceholder: "Recherche globale...",
  showGlobalSearch: true, 
};
  // Colonnes pour les étudiants
  const colonnesEtudiants: Column<Etudiant>[] = [
    { key: 'id', title: 'ID' },
    { key: 'nom', title: 'Nom' },
    { key: 'prenom', title: 'Prénom' },
    { key: 'sexe', title: 'Sexe' },
    {key:'telephone', title: 'Téléphone', render: (item) => <a href={`tel:${item.telephone}`} className="text-[#0d68ae] hover:underline">{item.telephone}</a> },
    
  { 
      key: 'email', 
      title: 'Email',
      render: (item) => <a href={`mailto:${item.email}`} className="text-[#0d68ae] hover:underline">{item.email}</a>
    },
    { key: 'adresse', title: 'Adresse' },
    { key: 'dateNaissance', title: 'Date de Naissance' },
    { key: 'lieuNaissance', title: 'Lieu de Naissance' },
    { key: 'matricule', title: 'Matricule' },
    { key: 'nationalite', title: 'Nationalité' },
    { key: 'ville', title: 'Ville' },
    { key:'photo', title: 'Photo', render: (item) => <img src={item.photo || "/images/logo.png"} alt="Photo" className="w-10 h-10 rounded-full" /> },
      { 
    key: 'boursier', 
    title: 'Boursier', 
    render: (item: Etudiant) => (
      <Switch
        checked={item.boursier}
        onChange={() => {}}
        className={`${item.boursier ? 'bg-[#00d084]' : 'bg-gray-300'}
          relative inline-flex h-5 w-10 items-center rounded-full transition-colors`}
      >
        <span
          className={`${item.boursier ? 'translate-x-5' : 'translate-x-0'}
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    )
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
      <div>
        <TableauDynamique<Etudiant>
          data={etudiants}
          columns={colonnesEtudiants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actionsColor="blue"
          filterConfig={filterConfig}
          emptyMessage="Aucun étudiant trouvé"
          
        />
      </div>

    
    </div>
  );
}
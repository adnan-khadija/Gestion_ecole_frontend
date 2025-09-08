import React, { useState, useEffect } from 'react';
import { Sexe, SituationFamiliale, StatutEtudiant, Etudiant, Formation } from '@/lib/types';
import { addEtudiant } from '@/lib/services';
import toast from 'react-hot-toast';

interface EtudiantFormProps {
  onSave: (etudiant: Etudiant) => void;
  formations: Formation[];
  etudiantInitial?: Omit<Etudiant, 'id'>;
}

const EtudiantForm = ({ onSave, formations, etudiantInitial }: EtudiantFormProps) => {
  const [customFields, setCustomFields] = useState<{ name: string; value: string }[]>([]);
  const [etudiant, setEtudiant] = useState<Omit<Etudiant, 'id'>>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    dateNaissance: '',
    lieuNaissance: '',
    matricule: '',
    sexe: Sexe.Masculin,
    nationalite: '',
    ville: '',
    situationFamiliale: SituationFamiliale.Celibataire,
    formationActuelle: formations.length > 0 ? formations[0] : { id: '', nom: '', description: '', dateDebut: '', dateFin: '', niveau: '', statut: '', dateCreation: new Date().toISOString() },
    niveauScolaire: '',
    groupeScolaire: '',
    anneeAcademique: '',
    nomTuteur: '',
    contactTuteur: '',
    boursier: false,
    handicap: false,
    photo: '',
    dateInscription: new Date().toISOString().split('T')[0],
    statut: StatutEtudiant.Actif,
  });

  useEffect(() => {
    if (etudiantInitial) {
      setEtudiant(etudiantInitial);
      if ((etudiantInitial as any).customFields) {
        setCustomFields(
          Object.entries((etudiantInitial as any).customFields).map(([name, value]) => ({ name, value }))
        );
      }
    }
  }, [etudiantInitial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "formationActuelle") {
      const selectedFormation = formations.find(f => String(f.id) === value);
      setEtudiant(prev => ({
        ...prev,
        formationActuelle: selectedFormation || prev.formationActuelle
      }));
    } else {
      setEtudiant(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si on est en édition, on passe juste l'étudiant modifié
    if (etudiantInitial) {
      onSave({ ...etudiant, id: (etudiantInitial as any).id });
      toast.success("Étudiant modifié avec succès !");
      return;
    }

    // Sinon, on ajoute un nouvel étudiant
    const now = new Date().toISOString();
    const etudiantComplet: Etudiant & { customFields?: Record<string, string> } = {
      ...etudiant,
      id: Date.now().toString(),
      dateCreation: now,
      dateModification: now,
      formations: [],
      customFields: customFields.reduce((acc, cur) => {
        if (cur.name) acc[cur.name] = cur.value;
        return acc;
      }, {} as Record<string, string>)
    };
    try {
      await addEtudiant(etudiantComplet);
      onSave(etudiantComplet);
      toast.success("Étudiant ajouté avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'étudiant");
      console.error("Erreur lors de l'ajout de l'étudiant:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Section Informations personnelles */}
     <div className="bg-white rounded-xl p-4 border border-gray-200">
       <h3 className="text-sm font-semibold text-[#D4A017] mb-4 pb-2 border-b border-gray-100">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Nom*</label>
            <input
              type="text"
              name="nom"
              value={etudiant.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Prénom*</label>
            <input
              type="text"
              name="prenom"
              value={etudiant.prenom}
              onChange={handleChange}
              required
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Sexe*</label>
            <select
              name="sexe"
              value={etudiant.sexe}
              onChange={handleChange}
              required
              className="w-full px-4 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9Ii82Qzc4ODkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
            >
              {Object.values(Sexe).map(sexe => (
                <option key={sexe} value={sexe}>{sexe}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Date de naissance*</label>
            <input
              type="date"
              name="dateNaissance"
              value={etudiant.dateNaissance}
              onChange={handleChange}
              required
              className="w-full px-4 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Lieu de naissance</label>
            <input
              type="text"
              name="lieuNaissance"
              value={etudiant.lieuNaissance}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Nationalité</label>
            <input
              type="text"
              name="nationalite"
              value={etudiant.nationalite}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Coordonnées */}
      <div className="bg-white rounded-xl p-2">
        <h3 className="text-sm font-semibold text-[#D4A017] mb-2 pb-2 border-b border-gray-100 flex items-center">
          Coordonnées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Email*</label>
            <input
              type="email"
              name="email"
              value={etudiant.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Téléphone*</label>
            <input
              type="tel"
              name="telephone"
              value={etudiant.telephone}
              onChange={handleChange}
              required
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Adresse</label>
            <input
              type="text"
              name="adresse"
              value={etudiant.adresse}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Ville</label>
            <input
              type="text"
              name="ville"
              value={etudiant.ville}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Scolarité */}
      <div className="bg-white rounded-xl p-2">
        <h3 className="text-sm font-semibold text-[#D4A017] mb-4 pb-2 border-b border-gray-100 flex items-center">
          Scolarité
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Matricule*</label>
            <input
              type="text"
              name="matricule"
              value={etudiant.matricule}
              onChange={handleChange}
              required
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Formation actuelle*</label>
            <select
              name="formationActuelle"
              value={etudiant.formationActuelle?.id || ""}
              onChange={handleChange}
              required
              className="w-full px-4 text-sm py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9Ii82Qzc4ODkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
            >
              <option value="">Sélectionnez une formation</option>
              {formations.map(formation => (
                <option key={formation.id} value={formation.id}>{formation.nom}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Niveau scolaire</label>
            <input
              type="text"
              name="niveauScolaire"
              value={etudiant.niveauScolaire}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Groupe scolaire</label>
            <input
              type="text"
              name="groupeScolaire"
              value={etudiant.groupeScolaire}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Année scolaire</label>
            <input
              type="text"
              name="anneeAcademique"
              value={etudiant.anneeAcademique}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Tuteur et Situation */}
      <div className="bg-white rounded-xl p-2">
        <h3 className="text-sm font-semibold text-[#D4A017] mb-2 pb-2 border-b border-gray-100 flex items-center">
          Tuteur et situation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Nom du tuteur</label>
            <input
              type="text"
              name="nomTuteur"
              value={etudiant.nomTuteur}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Contact du tuteur</label>
            <input
              type="tel"
              name="contactTuteur"
              value={etudiant.contactTuteur}
              onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Situation familiale</label>
            <select
              name="situationFamiliale"
              value={etudiant.situationFamiliale || ""}
              onChange={handleChange}
              className="w-full px-4 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0BveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9Ii82Qzc4ODkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
            >
              <option value="">Sélectionnez une situation</option>
              {Object.values(SituationFamiliale).map((situation) => (
                <option key={situation} value={situation}>
                  {situation}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#A52A2A]">Statut</label>
            <select
              name="statut"
              value={etudiant.statut || ""}
              onChange={handleChange}
              className="w-full px-4 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0BveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9Ii82Qzc4ODkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1C2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
            >
              <option value="">Sélectionnez un statut</option>
              {Object.values(StatutEtudiant).map((statut) => (
                <option key={statut} value={statut}>
                  {statut.charAt(0).toUpperCase() + statut.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="boursier"
                  checked={etudiant.boursier}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d084]"></div>
              </div>
              <span className="text-xs font-bold text-[#A52A2A]">Boursier</span>
            </label>
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="handicap"
                  checked={etudiant.handicap}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d084]"></div>
              </div>
              <span className="text-xs font-bold text-[#A52A2A]">Handicap</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section Photo */}
      <div className="bg-white rounded-xl p-2">
        <h3 className="text-sm font-semibold text-[#D4A017] mb-2 pb-2 border-b border-gray-100 flex items-center">
          Photo
        </h3>
        <div className="flex items-center">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-xs text-gray-500">
                <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setEtudiant(prev => ({
                      ...prev,
                      photo: reader.result as string
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
        {etudiant.photo && (
          <div className="mt-4 flex items-center">
            <span className="text-xs text-gray-500 mr-2">Image sélectionnée:</span>
            <span className="text-xs font-medium text-[#D4A017]">✓</span>
          </div>
        )}
      </div>

      {/* Champs personnalisés */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[#D4A017] mb-2 pb-2 border-b border-gray-100 flex items-center">
          Champs personnalisés
        </h3>
        {customFields.map((field, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Nom du champ"
              value={field.name}
              onChange={e => {
                const updated = [...customFields];
                updated[idx].name = e.target.value;
                setCustomFields(updated);
              }}
              className="w-full px-4 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
            <input
              type="text"
              placeholder="Valeur"
              value={field.value}
              onChange={e => {
                const updated = [...customFields];
                updated[idx].value = e.target.value;
                setCustomFields(updated);
              }}
              className="w-full px-4 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setCustomFields(fields => fields.filter((_, i) => i !== idx))}
              className="text-red-600 hover:text-red-800 px-2"
              title="Supprimer"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setCustomFields(fields => [...fields, { name: '', value: '' }])}
          className="mt-2 px-4 py-1 bg-[#D4A017] text-white rounded hover:bg-[#0274be] text-sm"
        >
          + Ajouter un champ
        </button>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="submit"
          className="px-6 py-3  text-sm bg-[#D4A017] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:ring-opacity-50 transition-all transform hover:scale-105"
        >
          Enregistrer 
        </button>
      </div>
    </form>
  );
};

export default EtudiantForm;
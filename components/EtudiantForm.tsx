import React, { useState } from 'react';
import { Sexe, situationFamiliale, StatutEtudiant } from '@/lib/types';
import { Etudiant, Formation } from '@/lib/types';
import { addEtudiant } from '@/lib/etudiantService';
import toast from 'react-hot-toast';
interface EtudiantFormProps {
  onSave: (etudiant: Etudiant) => void;
  formations: Formation[];
  etudiantInitial?: Omit<Etudiant, 'id' | 'dateCreation' | 'dateModification'>;
}
const EtudiantForm = ({ onSave, formations,etudiantInitial }: EtudiantFormProps) => {
  const [customFields, setCustomFields] = useState<{ name: string; value: string }[]>([]);
  const [etudiant, setEtudiant] = useState<Omit<Etudiant, 'id' | 'dateCreation' | 'dateModification'>>({
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
    situationFamiliale: '',
    formationActuelle: '',
    niveauScolaire: '',
    groupeScolaire: '',
    anneeScolaire: '',
    nomTuteur: '',
    contactTuteur: '',
    boursier: false,
    handicap: false,
    photo: '',
    dateInscription: new Date().toISOString().split('T')[0],
    statut: 'actif',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setEtudiant(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section Informations personnelles */}
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-semibold text-[#0d68ae] mb-6 pb-2 border-b border-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#00d084]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nom*</label>
            <input
              type="text"
              name="nom"
              value={etudiant.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Prénom*</label>
            <input
              type="text"
              name="prenom"
              value={etudiant.prenom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Sexe*</label>
            <select
              name="sexe"
              value={etudiant.sexe}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9Ii82Qzc4ODkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
            >
              {Object.values(Sexe).map(sexe => (
                <option key={sexe} value={sexe}>{sexe}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Date de naissance*</label>
            <input
              type="date"
              name="dateNaissance"
              value={etudiant.dateNaissance}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Lieu de naissance</label>
            <input
              type="text"
              name="lieuNaissance"
              value={etudiant.lieuNaissance}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nationalité</label>
            <input
              type="text"
              name="nationalite"
              value={etudiant.nationalite}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Contact */}
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-semibold text-[#0d68ae] mb-6 pb-2 border-b border-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#00d084]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Coordonnées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input
              type="email"
              name="email"
              value={etudiant.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Téléphone*</label>
            <input
              type="tel"
              name="telephone"
              value={etudiant.telephone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <input
              type="text"
              name="adresse"
              value={etudiant.adresse}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Ville</label>
            <input
              type="text"
              name="ville"
              value={etudiant.ville}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Scolarité */}
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-semibold text-[#0d68ae] mb-6 pb-2 border-b border-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#00d084]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Scolarité
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Matricule*</label>
            <input
              type="text"
              name="matricule"
              value={etudiant.matricule}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Formation actuelle*</label>
            <select
              name="formationActuelle"
              value={etudiant.formationActuelle}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9Ii82Qzc4ODkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
            >
              <option value="">Sélectionnez une formation</option>
              {formations.map(formation => (
                <option key={formation.id} value={formation.id}>{formation.nom}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Niveau scolaire</label>
            <input
              type="text"
              name="niveauScolaire"
              value={etudiant.niveauScolaire}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Groupe scolaire</label>
            <input
              type="text"
              name="groupeScolaire"
              value={etudiant.groupeScolaire}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Année scolaire</label>
            <input
              type="text"
              name="anneeScolaire"
              value={etudiant.anneeAcademique}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Tuteur et Situation */}
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-semibold text-[#0d68ae] mb-6 pb-2 border-b border-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#00d084]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Tuteur et situation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nom du tuteur</label>
            <input
              type="text"
              name="nomTuteur"
              value={etudiant.nomTuteur}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Contact du tuteur</label>
            <input
              type="tel"
              name="contactTuteur"
              value={etudiant.contactTuteur}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Situation familiale
  </label>
  <select
    name="situationFamiliale"
    value={etudiant.situationFamiliale || ""}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
  >
    <option value="">Sélectionnez une situation</option>
    {Object.values(situationFamiliale).map((situation) => (
      <option key={situation} value={situation}>
        {situation}
      </option>
    ))}
  </select>
</div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="statut"
              value={etudiant.statut || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:border-transparent transition-all"
            >
              <option value="" >Sélectionnez uen status</option>
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
              <span className="text-sm font-medium text-gray-700">Boursier</span>
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
              <span className="text-sm font-medium text-gray-700">Handicap</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section Photo */}
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-semibold text-[#0d68ae] mb-6 pb-2 border-b border-gray-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#00d084]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Photo
        </h3>
        <div className="flex items-center">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
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
            <span className="text-sm text-gray-500 mr-2">Image sélectionnée:</span>
            <span className="text-sm font-medium text-[#0d68ae]">✓</span>
          </div>
        )}
      </div>

      {/* Champs personnalisés */}
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-semibold text-[#0d68ae] mb-4">Champs personnalisés</h3>
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
              className="px-3 py-2 border rounded w-1/3"
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
              className="px-3 py-2 border rounded w-1/3"
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
          className="mt-2 px-4 py-2 bg-[#0d68ae] text-white rounded hover:bg-[#0274be] text-sm"
        >
          + Ajouter un champ
        </button>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-[#0d68ae] to-[#00d084] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] focus:ring-opacity-50 transition-all transform hover:scale-105"
        >
          Enregistrer l'étudiant
        </button>
      </div>
    </form>
  );
};

export default EtudiantForm;
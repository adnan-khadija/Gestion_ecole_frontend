"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";

const matieresInitiales = [
  { id: 1, nom: "Notions Mathématiques", coeff: 3 },
  { id: 2, nom: "Algorithmique et logique de programmation", coeff: 4 },
  { id: 3, nom: "Programmation Informatique", coeff: 3 },
  { id: 4, nom: "Architecture et fonctionnement des ordinateurs", coeff: 3 },
  { id: 5, nom: "Système d’exploitation", coeff: 3 },
  { id: 6, nom: "Bureautique", coeff: 2 },
  { id: 7, nom: "Gestion Commerciale", coeff: 2 },
  { id: 8, nom: "Organisation de l’entreprise", coeff: 2 },
  { id: 9, nom: "Statistiques appliquées", coeff: 3 },
  { id: 10, nom: "Comptabilité générale", coeff: 3 },
  { id: 11, nom: "Communication en Français", coeff: 2 },
  { id: 12, nom: "Communication en Anglais", coeff: 2 },
  { id: 13, nom: "Stage dans l’entreprise", coeff: 3 },
];

const students = [
  { id: 1, nom: "Mohite", prenom: "Houda", matricule: "ET1234", filiere: "Technicien en Gestion Informatisée" },
  { id: 2, nom: "Salma", prenom: "Karim", matricule: "ET5678", filiere: "Comptabilité" },
  { id: 3, nom: "Sara", prenom: "Hassan", matricule: "ET9101", filiere: "Mathématiques" },
];

interface Note {
  matiereId: number;
  c1?: number;
  c2?: number;
  examenTh?: number;
  examenPr?: number;
  observation?: string;
}

// Styles pour les boutons
const variantClasses = {
  primary: `bg-[#0d68ae] text-white hover:bg-[#0274be] shadow-sm`,
  secondary: `bg-[#0274be] text-white hover:bg-[#0d68ae] shadow-sm`,
  outline: `border border-[#0d68ae] text-[#0d68ae] hover:bg-[#0d68ae]/10`,
};

export default function BulletinForm() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedControl, setSelectedControl] = useState<string[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [overview, setOverview] = useState<Note[]>([]);
  const [showOverview, setShowOverview] = useState<boolean>(false);

  // Gestion de la saisie
  const handleChange = (matiereId: number, field: keyof Note, value: string) => {
    if (field === "observation") value = value.replace(/[0-9]/g, ""); // observation texte uniquement
    setNotes((prev) => {
      const existing = prev.find((n) => n.matiereId === matiereId);
      if (existing) {
        return prev.map((n) =>
          n.matiereId === matiereId
            ? { ...n, [field]: value === "" ? undefined : field === "observation" ? value : Number(value) }
            : n
        );
      } else {
        return [{ matiereId, [field]: field === "observation" ? value : Number(value) }, ...prev];
      }
    });
  };

  const getCoeff = (matiereId: number) => matieresInitiales.find((m) => m.id === matiereId)?.coeff || 1;

  const calcMoy = (field: keyof Note) => {
    if (!selectedControl.includes(field)) return 0;
    let somme = 0;
    let sommeCoeff = 0;
    notes.forEach((n) => {
      const coeff = getCoeff(n.matiereId);
      const note = n[field];
      if (note !== undefined) {
        somme += note * coeff;
        sommeCoeff += coeff;
      }
    });
    return sommeCoeff > 0 ? Number((somme / sommeCoeff).toFixed(2)) : 0;
  };

  const Moy_C1 = calcMoy("c1");
  const Moy_C2 = calcMoy("c2");
  const Moy_Examen_Th = calcMoy("examenTh");
  const Moy_Examen_Pr = calcMoy("examenPr");

  const Finale =
    (Moy_C1 + Moy_C2) * (selectedControl.includes("c1") || selectedControl.includes("c2") ? 3 : 0) +
    Moy_Examen_Th * (selectedControl.includes("examenTh") ? 2 : 0) +
    Moy_Examen_Pr * (selectedControl.includes("examenPr") ? 3 : 0);
  const totalCoeff =
    (selectedControl.includes("c1") || selectedControl.includes("c2") ? 6 : 0) +
    (selectedControl.includes("examenTh") ? 2 : 0) +
    (selectedControl.includes("examenPr") ? 3 : 0);
  const MoyFinale = totalCoeff > 0 ? (Finale / totalCoeff).toFixed(2) : "-";

  const getObservation = (n: Note) => {
    let somme = 0;
    let sommeCoeff = 0;
    selectedControl.forEach((c) => {
      const coeff = c === "c1" || c === "c2" ? 3 : c === "examenTh" ? 2 : 3;
      const val = n[c as keyof Note];
      if (val !== undefined) {
        somme += Number(val) * coeff;
        sommeCoeff += coeff;
      }
    });
    if (sommeCoeff === 0) return "-";
    const avg = somme / sommeCoeff;
    if (avg >= 16) return "Très Bien";
    if (avg >= 14) return "Bien";
    if (avg >= 12) return "Assez Bien";
    if (avg >= 10) return "Passable";
    return "Insuffisant";
  };

  const getMention = (moy: number | string) => {
    const n = Number(moy);
    if (isNaN(n)) return "-";
    if (n >= 16) return "Très Bien";
    if (n >= 14) return "Bien";
    if (n >= 12) return "Assez Bien";
    if (n >= 10) return "Passable";
    return "Insuffisant";
  };

  const handleSave = () => {
    const enteredMatieres = matieresInitiales
      .filter((m) => notes.find((n) => n.matiereId === m.id))
      .map((m) => {
        const n = notes.find((note) => note.matiereId === m.id)!;
        return { ...m, ...n };
      });
    setOverview(enteredMatieres);
    setShowOverview(false); // reset overview display
  };

  const handleReset = () => {
    setSelectedStudent(null);
    setSelectedYear("");
    setSelectedControl([]);
    setNotes([]);
    setOverview([]);
    setShowOverview(false);
  };

  const generatePDF = () => {
    if (!selectedStudent || overview.length === 0) return alert("Veuillez sélectionner un étudiant et entrer des notes.");
    const student = students.find((s) => s.id === selectedStudent)!;
    const doc = new jsPDF("p", "mm", "a4");

    // PDF Header (logo et titre retirés si déjà dans le projet)
    doc.setFontSize(14);
    doc.text(`BULLETIN DE NOTES - ${selectedYear}`, 105, 20, { align: "center" });

    // Student Info
    const infoStartY = 30;
    doc.setFontSize(11);
    doc.text(`Nom: ${student.nom}`, 20, infoStartY);
    doc.text(`Prénom: ${student.prenom}`, 100, infoStartY);
    doc.text(`Matricule: ${student.matricule}`, 20, infoStartY + 7);
    doc.text(`Filière: ${student.filiere}`, 100, infoStartY + 7);

    // Table
    const startY = infoStartY + 15;
    const colWidths = [70, 15, ...selectedControl.map(() => 20), 50];
    let currentY = startY;

    doc.setFillColor(13, 104, 174);
    doc.setTextColor(255, 255, 255);
    doc.setFontStyle("bold");
    let currentX = 10;
    ["UF / Matière", "Coef", ...selectedControl.map((c) => c.toUpperCase()), "Observation"].forEach((h, i) => {
      doc.rect(currentX, currentY, colWidths[i], 8, "FD");
      doc.text(h, currentX + colWidths[i] / 2, currentY + 6, { align: "center" });
      currentX += colWidths[i];
    });

    doc.setTextColor(0, 0, 0);
    doc.setFontStyle("normal");
    currentY += 8;
    overview.forEach((m) => {
      currentX = 10;
      const rowValues = [m.nom, String(m.coeff), ...selectedControl.map((c) => String(m[c as keyof Note] || "")), m.observation || ""];
      rowValues.forEach((val, i) => {
        doc.rect(currentX, currentY, colWidths[i], 8);
        doc.text(val, currentX + colWidths[i] / 2, currentY + 6, { align: "center" });
        currentX += colWidths[i];
      });
      currentY += 8;
    });

    // Bottom
    currentY += 10;
    doc.text(`Moyenne Générale: ${MoyFinale}`, 20, currentY);
    doc.text(`Mention: ${getMention(MoyFinale)}`, 100, currentY);
    doc.text("Signature de la direction", 150, currentY + 20);
    doc.rect(20, currentY + 10, 40, 25);
    doc.text("Tampon", 25, currentY + 25);

    doc.save(`Bulletin_${student.nom}_${student.prenom}.pdf`);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-4xl border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Sélection de l'étudiant, année et contrôles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Select étudiant */}
          <select
            className={`${variantClasses.primary} px-3 py-1.5 text-sm rounded`}
            value={selectedStudent || ""}
            onChange={(e) => setSelectedStudent(Number(e.target.value))}
          >
            <option value="">-- Sélectionner un étudiant --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom} {s.prenom} ({s.matricule})
              </option>
            ))}
          </select>

          {/* Select année */}
          <select
            className={`${variantClasses.primary} px-3 py-1.5 text-sm rounded`}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">-- Sélectionner l'année --</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2025/2026">2025/2026</option>
          </select>

          {/* Contrôles */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Contrôles à entrer :</label>
            <div className="flex flex-wrap gap-2">
              {["c1", "c2", "examenTh", "examenPr"].map((c) => (
                <label key={c} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    value={c}
                    checked={selectedControl.includes(c)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedControl((prev) =>
                        checked ? [...prev, c] : prev.filter((x) => x !== c)
                      );
                    }}
                  />
                  {c.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={handleReset}
            className={`${variantClasses.secondary} px-3 py-1.5 text-sm rounded`}
          >
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            className={`${variantClasses.primary} px-3 py-1.5 text-sm rounded`}
          >
            Enregistrer
          </button>
          {overview.length > 0 && (
            <button
              onClick={() => setShowOverview(true)}
              className={`${variantClasses.primary} px-3 py-1.5 text-sm rounded`}
            >
              Aperçu
            </button>
          )}
        </div>

        {/* Table saisie */}
        {selectedStudent && selectedYear && selectedControl.length > 0 && !showOverview && (
          <table className="w-full text-sm border border-gray-300 mb-4">
            <thead className="bg-[#0d68ae] text-white">
              <tr>
                <th className="p-2 border">Matière</th>
                {selectedControl.map((c) => (
                  <th key={c} className="p-2 border">{c.toUpperCase()}</th>
                ))}
                <th className="p-2 border">Observation</th>
              </tr>
            </thead>
            <tbody>
              {matieresInitiales.map((m) => (
                <tr key={m.id} className="text-center hover:bg-gray-50">
                  <td className="border p-2 text-left">{m.nom}</td>
                  {selectedControl.map((c) => (
                    <td key={c} className="border p-2">
                      <input
                        type={c === "observation" ? "text" : "number"}
                        value={notes.find((n) => n.matiereId === m.id)?.[c as keyof Note] ?? ""}
                        onChange={(e) => handleChange(m.id, c as keyof Note, e.target.value)}
                        className="w-full text-center border rounded px-1"
                      />
                    </td>
                  ))}
                  <td className="border p-2 text-center">{getObservation(notes.find(n => n.matiereId === m.id) ?? {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Aperçu du bulletin */}
        {showOverview && selectedStudent && (
          <div className="mt-6 p-4 border rounded shadow bg-white">
            <h3 className="text-center font-semibold text-lg mb-4">Bulletin - Aperçu</h3>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              {students.filter((s) => s.id === selectedStudent).map((s) => (
                <React.Fragment key={s.id}>
                  <p><strong>Nom:</strong> {s.nom}</p>
                  <p><strong>Prénom:</strong> {s.prenom}</p>
                  <p><strong>Matricule:</strong> {s.matricule}</p>
                  <p><strong>Filière:</strong> {s.filiere}</p>
                </React.Fragment>
              ))}
            </div>

            <table className="w-full text-sm border border-gray-300 mb-4">
              <thead className="bg-[#0d68ae] text-white">
                <tr>
                  <th className="p-2 border">Matière</th>
                  {selectedControl.map((c) => (
                    <th key={c} className="p-2 border">{c.toUpperCase()}</th>
                  ))}
                  <th className="p-2 border">Observation</th>
                </tr>
              </thead>
              <tbody>
                {overview.map((m) => (
                  <tr key={m.id} className="text-center hover:bg-gray-50">
                    <td className="border p-2 text-left">{m.nom}</td>
                    {selectedControl.map((c) => (
                      <td key={c} className="border p-2">{m[c as keyof Note]}</td>
                    ))}
                    <td className="border p-2 text-center">{getObservation(m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-6 text-sm">
              <div>
                <p><strong>Moyenne Générale:</strong> {MoyFinale}</p>
                <p><strong>Mention:</strong> {getMention(MoyFinale)}</p>
              </div>
              <div className="border border-gray-400 w-32 h-20 flex items-center justify-center text-gray-500 italic">
                Tampon
              </div>
              <div className="text-center">
                <p><strong>Signature de la direction</strong></p>
                <div className="border-t border-gray-400 mt-4 w-32 mx-auto"></div>
              </div>
            </div>

            <button
              onClick={generatePDF}
              className={`${variantClasses.primary} px-3 py-1.5 text-sm rounded mt-4`}
            >
              Télécharger PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

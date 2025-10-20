// app/admin/expenses/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TableauDynamique, { Column } from '@/components/TableauDynamique';
import DepenseCard from '@/components/cards/DepenseCard';
import DepenseForm from '@/components/forms/DepenseForm';
import { 
  Box, 
  Typography, 
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  AttachMoney,
  CalendarToday,
  Receipt,
  CheckCircle,
  Pending,
  Cancel
} from '@mui/icons-material';

// Import des services et types
import { 
  fetchAllDepenses,
  createDepense,
  updateDepense,
  deleteDepense,
} from '@/lib/depense';
import { 
  DepenseRequest, 
  DepenseResponse, 
  StatutDepense, 
  CategorieDepense 
} from '@/lib/types';
import { FaEye } from 'react-icons/fa';

// Types locaux étendus
export interface Expense extends DepenseResponse {
  title: string;
}

// Couleurs personnalisées
const PRIMARY_COLOR = '#1976d2';

const getCategoryColor = (category: CategorieDepense) => {
  switch (category) {
    case CategorieDepense.SALAIRE_ENSEIGNANT:
      return '#e3f2fd';
    case CategorieDepense.SALAIRE_PERSONNEL:
      return '#e8f5e8';
    case CategorieDepense.FACTURE_ELECTRICITE:
      return '#fff3e0';
    case CategorieDepense.FACTURE_EAU:
      return '#e0f7fa';
    case CategorieDepense.FACTURE_INTERNET:
      return '#f3e5f5';
    case CategorieDepense.MATERIEL_PEDAGOGIQUE:
      return '#e8f5e8';
    case CategorieDepense.MATERIEL_INFORMATIQUE:
      return '#fce4ec';
    case CategorieDepense.MATERIEL_BUREAU:
      return '#fff3e0';
    case CategorieDepense.MAINTENANCE:
      return '#e8f5e8';
    case CategorieDepense.EVENEMENT:
      return '#f3e5f5';
    case CategorieDepense.FORMATION:
      return '#e0f2f1';
    case CategorieDepense.AUTRE:
      return '#f5f5f5';
    default:
      return '#f5f5f5';
  }
};

const getCategoryText = (category: CategorieDepense) => {
  switch (category) {
    case CategorieDepense.SALAIRE_ENSEIGNANT:
      return 'Salaire Enseignant';
    case CategorieDepense.SALAIRE_PERSONNEL:
      return 'Salaire Personnel';
    case CategorieDepense.FACTURE_ELECTRICITE:
      return 'Facture Électricité';
    case CategorieDepense.FACTURE_EAU:
      return 'Facture Eau';
    case CategorieDepense.FACTURE_INTERNET:
      return 'Facture Internet';
    case CategorieDepense.MATERIEL_PEDAGOGIQUE:
      return 'Matériel Pédagogique';
    case CategorieDepense.MATERIEL_INFORMATIQUE:
      return 'Matériel Informatique';
    case CategorieDepense.MATERIEL_BUREAU:
      return 'Matériel Bureau';
    case CategorieDepense.MAINTENANCE:
      return 'Maintenance';
    case CategorieDepense.EVENEMENT:
      return 'Événement';
    case CategorieDepense.FORMATION:
      return 'Formation';
    case CategorieDepense.AUTRE:
      return 'Autre';
    default:
      return category;
  }
};

const getStatusColor = (status: StatutDepense) => {
  switch (status) {
    case StatutDepense.EN_ATTENTE:
      return 'warning';
    case StatutDepense.APPROUVEE:
      return 'info';
    case StatutDepense.REJETEE:
      return 'error';
    case StatutDepense.PAYEE:
      return 'success';
    default:
      return 'default';
  }
};

const getStatusText = (status: StatutDepense) => {
  switch (status) {
    case StatutDepense.EN_ATTENTE:
      return 'En attente';
    case StatutDepense.APPROUVEE:
      return 'Approuvée';
    case StatutDepense.REJETEE:
      return 'Rejetée';
    case StatutDepense.PAYEE:
      return 'Payée';
    default:
      return status;
  }
};

const getStatusIcon = (status: StatutDepense) => {
  switch (status) {
    case StatutDepense.EN_ATTENTE:
      return <Pending />;
    case StatutDepense.APPROUVEE:
      return <CheckCircle />;
    case StatutDepense.REJETEE:
      return <Cancel />;
    case StatutDepense.PAYEE:
      return <CheckCircle />;
    default:
      return <Pending />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (amount: number, currency: 'XOF' | 'MAD' = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Taux de conversion XOF vers MAD (approximatif)
const XOF_TO_MAD_RATE = 0.0061;

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<DepenseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const depensesData = await fetchAllDepenses();
      
      // CORRECTION : Vérifier que depensesData est défini et est un tableau
      const transformedExpenses: Expense[] = (depensesData || []).map(depense => ({
        ...depense,
        title: depense.libelle?.substring(0, 50) + (depense.libelle?.length > 50 ? '...' : '') || 'Sans libellé',
      }));
      
      setExpenses(transformedExpenses);
    } catch (err: any) {
      console.error('Erreur chargement dépenses:', err);
      setError(err.message || 'Erreur lors du chargement des dépenses');
      // CORRECTION : Initialiser avec un tableau vide en cas d'erreur
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshExpenses = async () => {
    await loadExpenses();
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  // Gestion des actions CRUD
  const handleAdd = async (depenseData: DepenseRequest) => {
    try {
      await createDepense(depenseData);
      setSuccessMessage('Dépense créée avec succès');
      await refreshExpenses();
      return Promise.resolve();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la dépense');
      return Promise.reject(err);
    }
  };

  const handleEdit = async (depense: Expense) => {
    try {
      const updateData: DepenseRequest = {
        categorieDepense: depense.categorieDepense,
        montant: depense.montant,
        dateDepense: depense.dateDepense,
        libelle: depense.libelle,
        description: depense.description,
        enseignantId: depense.enseignantId,
        beneficiaire: depense.beneficiaire,
        numeroPiece: depense.numeroPiece || '',
        statutDepense: depense.statutDepense,
        anneeAcademique: depense.anneeAcademique,
        remarques: depense.remarques || ''
      };

      await updateDepense(depense.idDepense, updateData);
      setSuccessMessage('Dépense modifiée avec succès');
      await refreshExpenses();
      return Promise.resolve();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification de la dépense');
      return Promise.reject(err);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteDepense(id.toString());
      setSuccessMessage('Dépense supprimée avec succès');
      await refreshExpenses();
      return Promise.resolve();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la dépense');
      return Promise.reject(err);
    }
  };

  // Colonnes pour le tableau dynamique
  const columns: Column<Expense>[] = [
    {
      key: 'numeroDepense',
      title: 'N° Dépense',
      render: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedExpense(item); }}
            className="text-[#D4A017] hover:text-gray-700 transition-colors"
            title="Voir les détails"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <Typography variant="body2" fontWeight="bold" color={PRIMARY_COLOR}>
            {item.numeroDepense}
          </Typography>
        </Box>
      )
    },
    {
      key: 'libelle',
      title: 'Libellé',
      render: (item) => (
        <Typography variant="body2" color="text.primary" fontWeight="medium">
          {item.libelle}
        </Typography>
      )
    },
   
    {
      key: 'beneficiaire',
      title: 'Bénéficiaire',
      render: (item) => (
        <Typography variant="body2" color="text.secondary">
          {item.beneficiaire}
        </Typography>
      )
    },
    {
        key:'anneeAcademique',
        title:'Année Académique',
        render: (item) => (
            <Typography variant="body2" color="text.secondary">
                {item.anneeAcademique}
            </Typography>
        )
    },
    {
      key: 'montant',
      title: 'Montant',
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            {item.montant}
          </Typography>
        
        </Box>
      )
    },
    {
      key: 'categorieDepense',
      title: 'Catégorie',
      render: (item) => (
        <Chip 
          label={getCategoryText(item.categorieDepense)} 
          size="small"
          sx={{ 
            backgroundColor: getCategoryColor(item.categorieDepense),
            color: 'black',
            fontWeight: 'medium'
          }}
        />
      )
    },
    {
      key: 'dateDepense',
      title: 'Date',
      render: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 16, color: PRIMARY_COLOR }} />
          <Typography variant="body2">
            {formatDate(item.dateDepense)}
          </Typography>
        </Box>
      )
    },
    {
      key: 'statutDepense',
      title: 'Statut',
      render: (item) => (
        <Chip 
          icon={getStatusIcon(item.statutDepense)}
          label={getStatusText(item.statutDepense)} 
          color={getStatusColor(item.statutDepense)}
          size="small"
          variant="filled"
        />
      )
    },
  ];

const filters = [
  {
    key: 'categorieDepense',
    label: 'Catégorie',
    type: 'select', // Ajout du type
    options: [
      { value: 'all', label: 'Toutes les catégories' },
      ...Object.values(CategorieDepense).map(category => ({
        value: category,
        label: getCategoryText(category)
      }))
    ]
  },
  {
    key: 'statutDepense',
    label: 'Statut',
    type: 'select', // Ajout du type
    options: [
      { value: 'all', label: 'Tous les statuts' },
      ...Object.values(StatutDepense).map(status => ({
        value: status,
        label: getStatusText(status)
      }))
    ]
  },
  {
    key: 'dateDepense',
    label: 'Date',
    type: 'date' as const
  },
  {
    key: 'anneeAcademique',
    label: 'Année Académique',
    type: 'text' as const, 
    options: [ 
      { value: 'all', label: 'Toutes les années' },
     
    ]
  }
];
  // Configuration d'import
  const importConfig = {
    headers: ['libelle', 'description', 'montant', 'dateDepense', 'categorieDepense', 'statutDepense', 'enseignantId', 'beneficiaire', 'numeroPiece', 'anneeAcademique', 'remarques'],
    apiUrl: '/api/expenses/import'
  };

  // Configuration d'export
  const exportConfig = {
    filename: 'depenses',
    apiUrl: '/api/expenses/export'
  };

  // Fonction pour obtenir l'ID d'une ligne
  const getRowId = (expense: Expense) => {
    return expense.idDepense;
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      
   

      {/* Tableau dynamique */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableauDynamique<Expense>
          data={expenses || []} // CORRECTION : Assurer que data est toujours un tableau
          columns={columns}
          getRowId={getRowId}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Aucune dépense trouvée"
          onRowClick={handleViewDetails}
          
          // Configuration import/export
          importConfig={importConfig}
          exportConfig={exportConfig}
          
          // Configuration des filtres
          filters={filters}
          
          // Composant de formulaire personnalisé
          formComponent={({ itemInitial, onSave, onCancel }) => (
            <DepenseForm
              depenseInitial={itemInitial}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
          
          // Options d'affichage
          showActions={true}
          showSearch={true}
          showImportExport={false}
          showFilters={true}
          showAddButton={true}
        />
      )}

      {/* Carte de détail de la dépense */}
      {selectedExpense && (
        <DepenseCard
          depense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
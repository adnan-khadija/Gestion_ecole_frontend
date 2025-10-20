// app/admin/payments/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TableauDynamique, { Column } from '@/components/TableauDynamique';
import PaiementCard from '@/components/cards/PaiementCard';
import PaiementForm from '@/components/forms/PaiementForm';
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
  Payment,
  CalendarToday,
  Receipt,
  CheckCircle,
  Pending,
  Cancel
} from '@mui/icons-material';

// Import des services et types
import { 
  getAllPaiements,
  createPaiement,
  updatePaiement,
  annulerPaiement
} from '@/lib/paiement';
import { 
  PaiementRequest, 
  PaiementResponse, 
  PaiementUpdateRequest,
  StatutPaiement, 
  TypePaiement,
  ModePaiement
} from '@/lib/types';
import { FaEye } from 'react-icons/fa';

// Types locaux étendus
export interface Payment extends PaiementResponse {
  title: string;
}

// Couleurs personnalisées
const PRIMARY_COLOR = '#2e7d32';

const getTypeColor = (type: TypePaiement) => {
  switch (type) {
    case TypePaiement.FRAIS_SCOLARITE:
      return '#e8f5e8';
    case TypePaiement.FRAIS_INSCRIPTION:
      return '#e3f2fd';
    case TypePaiement.FRAIS_EXAMEN:
      return '#fff3e0';
    case TypePaiement.FRAIS_BIBLIOTHEQUE:
      return '#f3e5f5';
    case TypePaiement.FRAIS_TRANSPORT:
      return '#e0f7fa';
    case TypePaiement.FRAIS_HEBERGEMENT:
      return '#fce4ec';
    case TypePaiement.FRAIS_MATERIEL:
      return '#fff3e0';
    case TypePaiement.AUTRE:
      return '#f5f5f5';
    default:
      return '#f5f5f5';
  }
};

const getTypeText = (type: TypePaiement) => {
  switch (type) {
    case TypePaiement.FRAIS_SCOLARITE:
      return 'Frais de scolarité';
    case TypePaiement.FRAIS_INSCRIPTION:
      return 'Frais d\'inscription';
    case TypePaiement.FRAIS_EXAMEN:
      return 'Frais d\'examen';
    case TypePaiement.FRAIS_BIBLIOTHEQUE:
      return 'Frais de bibliothèque';
    case TypePaiement.FRAIS_TRANSPORT:
      return 'Frais de transport';
    case TypePaiement.FRAIS_HEBERGEMENT:
      return 'Frais d\'hébergement';
    case TypePaiement.FRAIS_MATERIEL:
      return 'Frais de matériel';
    case TypePaiement.AUTRE:
      return 'Autre';
    default:
      return type;
  }
};

const getStatusColor = (status: StatutPaiement) => {
  switch (status) {
    case StatutPaiement.EN_ATTENTE:
      return 'warning';
    case StatutPaiement.VALIDE:
      return 'success';
    case StatutPaiement.ANNULE:
      return 'error';
    case StatutPaiement.REMBOURSE:
      return 'info';
    default:
      return 'default';
  }
};

const getStatusText = (status: StatutPaiement) => {
  switch (status) {
    case StatutPaiement.EN_ATTENTE:
      return 'En attente';
    case StatutPaiement.VALIDE:
      return 'Validé';
    case StatutPaiement.ANNULE:
      return 'Annulé';
    case StatutPaiement.REMBOURSE:
      return 'Remboursé';
    default:
      return status;
  }
};

const getStatusIcon = (status: StatutPaiement) => {
  switch (status) {
    case StatutPaiement.EN_ATTENTE:
      return <Pending />;
    case StatutPaiement.VALIDE:
      return <CheckCircle />;
    case StatutPaiement.ANNULE:
      return <Cancel />;
    case StatutPaiement.REMBOURSE:
      return <CheckCircle />;
    default:
      return <Pending />;
  }
};

const getModeText = (mode: ModePaiement) => {
  switch (mode) {
    case ModePaiement.ESPECES:
      return 'Espèces';
    case ModePaiement.CHEQUE:
      return 'Chèque';
    case ModePaiement.VIREMENT_BANCAIRE:
      return 'Virement bancaire';
    case ModePaiement.CARTE_BANCAIRE:
      return 'Carte bancaire';
    case ModePaiement.MENSUEL:
      return 'Mensuel';
    case ModePaiement.TRIMESTRIEL:
      return 'Trimestriel';
    case ModePaiement.ANNUEL:
      return 'Annuel';
    default:
      return mode;
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

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaiementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const paiementsData = await getAllPaiements();
      
      const transformedPayments: Payment[] = (paiementsData || []).map(paiement => ({
        ...paiement,
        title: `Paiement ${paiement.numeroPaiement} - ${paiement.studentName}`,
      }));
      
      setPayments(transformedPayments);
    } catch (err: any) {
      console.error('Erreur chargement paiements:', err);
      setError(err.message || 'Erreur lors du chargement des paiements');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshPayments = async () => {
    await loadPayments();
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  // Gestion des actions CRUD
  const handleAdd = async (paiementData: PaiementRequest) => {
    try {
      await createPaiement(paiementData);
      setSuccessMessage('Paiement créé avec succès');
      await refreshPayments();
      return Promise.resolve();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du paiement');
      return Promise.reject(err);
    }
  };

  const handleEdit = async (paiement: Payment) => {
    try {
      const updateData: PaiementUpdateRequest = {
        typePaiement: paiement.typePaiement,
        montant: paiement.montant,
        datePaiement: paiement.datePaiement,
        modePaiement: paiement.modePaiement,
        statutPaiement: paiement.statutPaiement,
        referenceTransaction: paiement.referenceTransaction || '',
        description: paiement.description || '',
        remarques: paiement.remarques || ''
      };

      await updatePaiement(paiement.idPaiement, updateData);
      setSuccessMessage('Paiement modifié avec succès');
      await refreshPayments();
      return Promise.resolve();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du paiement');
      return Promise.reject(err);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await annulerPaiement(id.toString(), "Annulé par l'administrateur");
      setSuccessMessage('Paiement annulé avec succès');
      await refreshPayments();
      return Promise.resolve();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'annulation du paiement');
      return Promise.reject(err);
    }
  };

  // Colonnes pour le tableau dynamique
  const columns: Column<Payment>[] = [
    {
      key: 'numeroPaiement',
      title: 'N° Paiement',
      render: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPayment(item); }}
            className="text-[#D4A017] hover:text-gray-700 transition-colors"
            title="Voir les détails"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <Typography variant="body2" fontWeight="bold" color={PRIMARY_COLOR}>
            {item.numeroPaiement}
          </Typography>
        </Box>
      )
    },
    {
      key: 'studentName',
      title: 'Étudiant',
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" color="text.primary">
            {item.studentName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.studentMatricule}
          </Typography>
        </Box>
      )
    },
    {
      key: 'montant',
      title: 'Montant',
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            {formatCurrency(item.montant, 'XOF')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatCurrency(item.montant * XOF_TO_MAD_RATE, 'MAD')}
          </Typography>
        </Box>
      )
    },
    {
      key: 'typePaiement',
      title: 'Type',
      render: (item) => (
        <Chip 
          label={getTypeText(item.typePaiement)} 
          size="small"
          sx={{ 
            backgroundColor: getTypeColor(item.typePaiement),
            color: 'black',
            fontWeight: 'medium'
          }}
        />
      )
    },
    {
      key: 'datePaiement',
      title: 'Date',
      render: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 16, color: PRIMARY_COLOR }} />
          <Typography variant="body2">
            {formatDate(item.datePaiement)}
          </Typography>
        </Box>
      )
    },
    {
      key: 'modePaiement',
      title: 'Mode',
      render: (item) => (
        <Typography variant="body2" color="text.secondary">
          {getModeText(item.modePaiement)}
        </Typography>
      )
    },
    {
      key: 'statutPaiement',
      title: 'Statut',
      render: (item) => (
        <Chip 
          icon={getStatusIcon(item.statutPaiement)}
          label={getStatusText(item.statutPaiement)} 
          color={getStatusColor(item.statutPaiement)}
          size="small"
          variant="filled"
        />
      )
    },
  ];

  // Filtres pour le tableau dynamique
  const filters = [
    {
      key: 'typePaiement',
      label: 'Type',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Tous les types' },
        ...Object.values(TypePaiement).map(type => ({
          value: type,
          label: getTypeText(type)
        }))
      ]
    },
    {
      key: 'statutPaiement',
      label: 'Statut',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Tous les statuts' },
        ...Object.values(StatutPaiement).map(status => ({
          value: status,
          label: getStatusText(status)
        }))
      ]
    },
    {
      key: 'modePaiement',
      label: 'Mode',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Tous les modes' },
        ...Object.values(ModePaiement).map(mode => ({
          value: mode,
          label: getModeText(mode)
        }))
      ]
    },
    {
      key: 'datePaiement',
      label: 'Date',
      type: 'date' as const,
      options: [
        { value: 'all', label: 'Toutes les dates' }
      ]
    },
    {
      key: 'anneeAcademique',
      label: 'Année Académique',
      type: 'text' as const,
      options: [
        { value: 'all', label: 'Toutes les années' }
      ]
    }
  ];

  // Configuration d'import
  const importConfig = {
    headers: ['studentId', 'typePaiement', 'montant', 'datePaiement', 'modePaiement', 'statutPaiement', 'anneeAcademique', 'referenceTransaction', 'description', 'remarques'],
    apiUrl: '/api/payments/import'
  };

  // Configuration d'export
  const exportConfig = {
    filename: 'paiements',
    apiUrl: '/api/payments/export'
  };

  // Fonction pour obtenir l'ID d'une ligne
  const getRowId = (payment: Payment) => {
    return payment.idPaiement;
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      


      {/* Tableau dynamique */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableauDynamique<Payment>
          data={payments || []}
          columns={columns}
          getRowId={getRowId}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Aucun paiement trouvé"
          onRowClick={handleViewDetails}
          
          // Configuration import/export
          importConfig={importConfig}
          exportConfig={exportConfig}
          
          // Configuration des filtres
          filters={filters}
          
          // Composant de formulaire personnalisé
          formComponent={({ itemInitial, onSave, onCancel }) => (
            <PaiementForm
              paiementInitial={itemInitial}
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

      {/* Carte de détail du paiement */}
      {selectedPayment && (
        <PaiementCard
          paiement={selectedPayment}
          onClose={() => setSelectedPayment(null)}
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
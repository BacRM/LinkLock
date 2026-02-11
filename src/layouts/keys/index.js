/**
 * Keys Management Page
 * Lazy-loaded page for key management with error handling and mock data
 */

import React, { useState, useEffect, useCallback } from "react";
import { 
  Card, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Chip,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";

// API
import KeysApi from "api/keys";
import CompaniesApi from "api/companies";
import PersonnelApi from "api/personnel";

// Floating buttons
import FloatingButtons from "components/FloatingButtons";

// Mock data for fallback
const MOCK_KEYS = [
  { id: 1, company_id: 1, address: "123 Rue Demo, Paris", owner_name: "M. Martin", house_manager_name: "Mme Dubois", status: "available", company_name: "Demo Conciergerie" },
  { id: 2, company_id: 1, address: "456 Avenue Demo, Lyon", owner_name: "Mme Durand", house_manager_name: "M. Bernard", status: "borrowed", company_name: "Demo Conciergerie" },
  { id: 3, company_id: 2, address: "789 Boulevard Demo, Marseille", owner_name: "M. Petit", house_manager_name: "Mme Robert", status: "returned", company_name: "Demo Agence" },
];

const MOCK_COMPANIES = [
  { id: 1, name: "Demo Conciergerie" },
  { id: 2, name: "Demo Agence" },
];

const MOCK_MANAGERS = [
  { id: 1, first_name: "Jean", last_name: "Dupont" },
  { id: 2, first_name: "Marie", last_name: "Martin" },
];

function Keys() {
  const [keys, setKeys] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("keys_view_mode") || "list");
  const [openModal, setOpenModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, available: 0, borrowed: 0, returned: 0, lost: 0 });
  const [formData, setFormData] = useState({
    company_id: "",
    manager_id: "",
    address: "",
    owner_name: "",
    owner_contact: "",
    house_manager_name: "",
    house_manager_contact: "",
    key_location: "",
    status: "available",
    notes: ""
  });

  // Load view preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("keys_view_mode");
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Fetch data with try/catch and mock fallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [keysRes, companiesRes] = await Promise.all([
        KeysApi.getAll(),
        CompaniesApi.getAll()
      ]);
      
      setKeys(keysRes.data);
      setCompanies(companiesRes.data);
      setUseMockData(false);

      // Fetch managers for first company
      if (companiesRes.data.length > 0) {
        try {
          const managersRes = await PersonnelApi.getAll({ company_id: companiesRes.data[0].id });
          setManagers(managersRes.data);
        } catch {
          setManagers(MOCK_MANAGERS);
        }
      }

      // Fetch stats
      try {
        const statsRes = await KeysApi.getStats();
        setStats(statsRes.data);
      } catch {
        // Calculate mock stats
        const mockStats = { total: 0, available: 0, borrowed: 0, returned: 0, lost: 0 };
        keysRes.data.forEach(key => {
          mockStats.total++;
          mockStats[key.status]++;
        });
        setStats(mockStats);
      }
    } catch (err) {
      console.warn("API unavailable, using mock data:", err.message);
      setKeys(MOCK_KEYS);
      setCompanies(MOCK_COMPANIES);
      setManagers(MOCK_MANAGERS);
      setUseMockData(true);
      setError("Mode démo - API non disponible");
      
      // Calculate mock stats
      const mockStats = { total: 0, available: 0, borrowed: 0, returned: 0, lost: 0 };
      MOCK_KEYS.forEach(key => {
        mockStats.total++;
        mockStats[key.status]++;
      });
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch managers when company changes
  const handleCompanyChange = async (companyId) => {
    try {
      const managersRes = await PersonnelApi.getAll({ company_id: companyId });
      setManagers(managersRes.data);
      setFormData(prev => ({ ...prev, company_id: companyId, manager_id: "" }));
    } catch (err) {
      setManagers(MOCK_MANAGERS);
      setFormData(prev => ({ ...prev, company_id: companyId, manager_id: "" }));
    }
  };

  // Handle view mode toggle
  const toggleViewMode = () => {
    const newMode = viewMode === "list" ? "card" : "list";
    setViewMode(newMode);
    localStorage.setItem("keys_view_mode", newMode);
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open modal for new key
  const handleOpenCreate = () => {
    setEditingKey(null);
    setFormData({
      company_id: companies.length > 0 ? companies[0].id : "",
      manager_id: "",
      address: "",
      owner_name: "",
      owner_contact: "",
      house_manager_name: "",
      house_manager_contact: "",
      key_location: "",
      status: "available",
      notes: ""
    });
    setOpenModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (key) => {
    setEditingKey(key);
    setFormData({
      company_id: key.company_id,
      manager_id: key.manager_id || "",
      address: key.address,
      owner_name: key.owner_name,
      owner_contact: key.owner_contact || "",
      house_manager_name: key.house_manager_name || "",
      house_manager_contact: key.house_manager_contact || "",
      key_location: key.key_location || "",
      status: key.status,
      notes: key.notes || ""
    });
    setOpenModal(true);
  };

  // Handle save with try/catch
  const handleSave = async () => {
    try {
      if (editingKey) {
        await KeysApi.update(editingKey.id, formData);
      } else {
        await KeysApi.create(formData);
      }
      fetchData();
      setOpenModal(false);
    } catch (err) {
      console.error("Error saving key:", err);
      alert("Erreur lors de la sauvegarde");
    }
  };

  // Handle delete with try/catch
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette clé?")) {
      try {
        await KeysApi.delete(id);
        fetchData();
      } catch (err) {
        console.error("Error deleting key:", err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  // Handle status change with try/catch
  const handleStatusChange = async (id, newStatus) => {
    try {
      await KeysApi.updateStatus(id, newStatus);
      fetchData();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Erreur lors du changement de statut");
    }
  };

  // Get company name by ID
  const getCompanyName = (id) => {
    const company = companies.find(c => c.id === id);
    return company ? company.name : "-";
  };

  // Get manager name by ID
  const getManagerName = (id) => {
    if (!id) return "-";
    const manager = managers.find(m => m.id === id);
    return manager ? `${manager.first_name} ${manager.last_name}` : "-";
  };

  // Filter keys based on search
  const filteredKeys = keys.filter(key => 
    key.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.house_manager_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "success";
      case "borrowed": return "warning";
      case "returned": return "info";
      case "lost": return "error";
      default: return "default";
    }
  };

  // Table columns
  const columns = [
    { name: "address", align: "left", width: "250px" },
    { name: "owner", align: "center", width: "150px" },
    { name: "house_manager", align: "center", width: "150px" },
    { name: "company", align: "center", width: "150px" },
    { name: "status", align: "center", width: "100px" },
    { name: "actions", align: "center", width: "150px" }
  ];

  // Table rows
  const rows = filteredKeys.map(key => ({
    address: (
      <SoftBox display="flex" alignItems="center" gap={1}>
        <SoftTypography variant="body2">{key.address}</SoftTypography>
      </SoftBox>
    ),
    owner: (
      <SoftBox>
        <SoftTypography variant="body2">{key.owner_name}</SoftTypography>
      </SoftBox>
    ),
    house_manager: key.house_manager_name || "-",
    company: getCompanyName(key.company_id),
    status: (
      <Chip 
        label={key.status} 
        color={getStatusColor(key.status)}
        size="small"
      />
    ),
    actions: (
      <SoftBox display="flex" gap={1} justifyContent="center">
        <IconButton size="small" onClick={() => handleOpenEdit(key)}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => handleDelete(key.id)}>
          <DeleteIcon />
        </IconButton>
      </SoftBox>
    )
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        {/* Error alert */}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error} - Données de démonstration affichées
          </Alert>
        )}

        <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <SoftTypography variant="h4">Gestion des Clés</SoftTypography>
          <SoftBox display="flex" gap={2}>
            <TextField
              size="small"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton onClick={toggleViewMode}>
              {viewMode === "list" ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
            <SoftButton 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Nouvelle Clé
            </SoftButton>
          </SoftBox>
        </SoftBox>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={6} sm={2}>
            <MiniStatisticsCard
              title={{ text: "Total", fontWeight: "regular" }}
              count={stats.total}
              color="dark"
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <MiniStatisticsCard
              title={{ text: "Disponibles", fontWeight: "regular" }}
              count={stats.available}
              color="success"
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <MiniStatisticsCard
              title={{ text: "Empruntées", fontWeight: "regular" }}
              count={stats.borrowed}
              color="warning"
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <MiniStatisticsCard
              title={{ text: "Retournées", fontWeight: "regular" }}
              count={stats.returned}
              color="info"
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <MiniStatisticsCard
              title={{ text: "Perdues", fontWeight: "regular" }}
              count={stats.lost}
              color="error"
            />
          </Grid>
        </Grid>

        <Card>
          {loading ? (
            <SoftBox display="flex" justifyContent="center" alignItems="center" p={5}>
              <CircularProgress />
            </SoftBox>
          ) : (
            <SoftBox p={3}>
              <Table columns={columns} rows={rows} />
            </SoftBox>
          )}
        </Card>
      </SoftBox>

      {/* Create/Edit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingKey ? "Modifier la Clé" : "Nouvelle Clé"}
        </DialogTitle>
        <DialogContent>
          <SoftBox component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Entreprise</InputLabel>
                  <Select
                    name="company_id"
                    value={formData.company_id}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    label="Entreprise"
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Adresse complète"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nom du propriétaire"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact du propriétaire"
                  name="owner_contact"
                  value={formData.owner_contact}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom du gestionnaire"
                  name="house_manager_name"
                  value={formData.house_manager_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact du gestionnaire"
                  name="house_manager_contact"
                  value={formData.house_manager_contact}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gestionnaire de clés</InputLabel>
                  <Select
                    name="manager_id"
                    value={formData.manager_id}
                    onChange={handleInputChange}
                    label="Gestionnaire de clés"
                  >
                    <MenuItem value="">Non assigné</MenuItem>
                    {managers.map((manager) => (
                      <MenuItem key={manager.id} value={manager.id}>
                        {manager.first_name} {manager.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emplacement de la clé"
                  name="key_location"
                  value={formData.key_location}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <MenuItem value="available">Disponible</MenuItem>
                  <MenuItem value="borrowed">Empruntée</MenuItem>
                  <MenuItem value="returned">Retournée</MenuItem>
                  <MenuItem value="lost">Perdue</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </SoftBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingKey ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
      <FloatingButtons />
    </DashboardLayout>
  );
}

export default Keys;

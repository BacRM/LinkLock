/**
 * Cles Management Page
 * List view with full-page edit/create forms and QR code visualization
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftAvatar from "components/SoftAvatar";
import SoftBadge from "components/SoftBadge";
import SoftButton from "components/SoftButton";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// API
import KeysApi from "api/keys";
import CompaniesApi from "api/companies";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QrCodeIcon from "@mui/icons-material/QrCode";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ShareIcon from "@mui/icons-material/Share";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

// QR Code
import QRCode from "react-qr-code";

// Mock data for fallback
const MOCK_KEYS = [
  { id: 1, company_id: 1, address: "123 Rue de la Paix, Paris 75001", owner_name: "M. Martin", owner_contact: "01 23 45 67 89", house_manager_name: "Mme Dubois", house_manager_contact: "06 12 34 56 78", status: "available", company_name: "Conciergerie Paris", visibility: "owned" },
  { id: 2, company_id: 1, address: "456 Avenue Foch, Paris 75016", owner_name: "Mme Durand", owner_contact: "01 23 45 67 90", house_manager_name: "M. Bernard", house_manager_contact: "06 23 45 67 89", status: "borrowed", company_name: "Conciergerie Paris", visibility: "shared" },
  { id: 3, company_id: 2, address: "789 Rue de la Republique, Lyon 69002", owner_name: "M. Petit", owner_contact: "04 56 78 90 12", house_manager_name: "Mme Robert", house_manager_contact: "06 34 56 78 90", status: "returned", company_name: "Agence Lyon", visibility: "owned" },
  { id: 4, company_id: 2, address: "321 Boulevard Saint-Germain, Paris 75007", owner_name: "Mme Simon", owner_contact: "01 45 67 89 01", house_manager_name: "M. Laurent", house_manager_contact: "06 56 78 90 12", status: "lost", company_name: "Agence Paris", visibility: "hierarchy" },
];

// Author component for table
function KeyInfo({ address, company, owner }) {
  return (
    <SoftBox display="flex" alignItems="center" px={1} py={0.5}>
      <SoftBox mr={2}>
        <SoftAvatar 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(owner || "X")}&background=random`} 
          alt={address} 
          size="sm" 
          variant="rounded" 
        />
      </SoftBox>
      <SoftBox display="flex" flexDirection="column">
        <SoftTypography variant="button" fontWeight="medium">
          {address}
        </SoftTypography>
        <SoftTypography variant="caption" color="secondary">
          {company} • {owner}
        </SoftTypography>
      </SoftBox>
    </SoftBox>
  );
}

// Status badge component
function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "available": return { color: "success", badge: "Disponible" };
      case "borrowed": return { color: "warning", badge: "Emprunté" };
      case "returned": return { color: "info", badge: "Retourné" };
      case "lost": return { color: "error", badge: "Perdu" };
      default: return { color: "secondary", badge: status };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <SoftBadge variant="gradient" badgeContent={config.badge} color={config.color} size="xs" container />
  );
}

// Visibility badge component
function VisibilityBadge({ visibility }) {
  const getVisibilityConfig = (v) => {
    switch (v) {
      case "owned": return { color: "success", badge: "Propriétaire" };
      case "shared": return { color: "info", badge: "Partagé" };
      case "hierarchy": return { color: "primary", badge: "Hiérarchie" };
      default: return { color: "secondary", badge: v };
    }
  };

  const config = getVisibilityConfig(visibility);
  
  return (
    <Chip label={config.badge} size="small" color={config.color} variant="outlined" />
  );
}

// Manager info component
function ManagerInfo({ name }) {
  return (
    <SoftBox display="flex" flexDirection="column">
      <SoftTypography variant="caption" fontWeight="medium" color="text">
        {name || "Non assigné"}
      </SoftTypography>
    </SoftBox>
  );
}

// Action component
function Actions({ onView, onEdit, onDelete, onShare }) {
  return (
    <SoftBox display="flex" gap={0.5}>
      <Tooltip title="Voir">
        <IconButton size="small" onClick={onView}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Partager">
        <IconButton size="small" color="primary" onClick={onShare}>
          <ShareIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Modifier">
        <IconButton size="small" onClick={onEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Supprimer">
        <IconButton size="small" color="error" onClick={onDelete}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </SoftBox>
  );
}

function Cles() {
  const navigate = useNavigate();
  const [keys, setKeys] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  
  // View mode: 'list' or 'form' for create/edit
  const [viewMode, setViewMode] = useState('list');
  const [editingKey, setEditingKey] = useState(null);
  const [formData, setFormData] = useState({
    company_id: "",
    address: "",
    owner_name: "",
    owner_contact: "",
    house_manager_name: "",
    house_manager_contact: "",
    status: "available",
  });

  // Share Dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingKey, setSharingKey] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [sharePermissions, setSharePermissions] = useState({});
  const [currentShares, setCurrentShares] = useState([]);

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
    } catch (err) {
      console.warn("API unavailable, using mock data:", err.message);
      setKeys(MOCK_KEYS);
      setCompanies([
        { id: 1, name: "Conciergerie Paris Centre", type: "conciergerie" },
        { id: 2, name: "Agence Lyon Bellecour", type: "agence_imobiliere" },
        { id: 3, name: "Conciergerie Lyon Part-Dieu", type: "conciergerie", parent_id: 2 },
        { id: 4, name: "Agence Paris Opéra", type: "agence_imobiliere" },
      ]);
      setUseMockData(true);
      setError("Mode démo - API non disponible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get company name by ID
  const getCompanyName = (id) => {
    const company = companies.find(c => c.id === id);
    return company ? company.name : "-";
  };

  // Handle view (navigate to visualization page)
  const handleView = (key) => {
    navigate(`/cles/${key.id}/visualiser`);
  };

  // Handle test (navigate to visualization page)
  const handleTest = (key) => {
    navigate(`/cles/${key.id}/visualiser`);
  };

  // Handle edit
  const handleEdit = (key) => {
    setEditingKey(key);
    setFormData({
      company_id: key.company_id || "",
      address: key.address || "",
      owner_name: key.owner_name || "",
      owner_contact: key.owner_contact || "",
      house_manager_name: key.house_manager_name || "",
      house_manager_contact: key.house_manager_contact || "",
      status: key.status || "available",
    });
    setViewMode('form');
  };

  // Handle create new
  const handleCreate = () => {
    setEditingKey(null);
    setFormData({
      company_id: "",
      address: "",
      owner_name: "",
      owner_contact: "",
      house_manager_name: "",
      house_manager_contact: "",
      status: "available",
    });
    setViewMode('form');
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

  // Handle form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle save with mock fallback
  const handleSave = async () => {
    try {
      if (useMockData) {
        // Mock create/update
        if (editingKey) {
          setKeys(prev => prev.map(k => 
            k.id === editingKey.id ? { ...k, ...formData, company_name: companies.find(c => c.id === parseInt(formData.company_id))?.name || k.company_name } : k
          ));
        } else {
          const newKey = {
            id: Date.now(),
            ...formData,
            company_name: companies.find(c => c.id === parseInt(formData.company_id))?.name || "Nouvelle",
            visibility: "owned",
            status: formData.status || "available"
          };
          setKeys(prev => [...prev, newKey]);
        }
        setViewMode('list');
        return;
      }
      
      if (editingKey) {
        await KeysApi.update(editingKey.id, formData);
      } else {
        await KeysApi.create(formData);
      }
      fetchData();
      setViewMode('list');
    } catch (err) {
      console.error("Error saving key:", err);
      if (useMockData) {
        alert("Mode démo : L'action a été simulée avec succès");
        if (editingKey) {
          setKeys(prev => prev.map(k => 
            k.id === editingKey.id ? { ...k, ...formData, company_name: companies.find(c => c.id === parseInt(formData.company_id))?.name || k.company_name } : k
          ));
        } else {
          const newKey = {
            id: Date.now(),
            ...formData,
            company_name: companies.find(c => c.id === parseInt(formData.company_id))?.name || "Nouvelle",
            visibility: "owned"
          };
          setKeys(prev => [...prev, newKey]);
        }
        setViewMode('list');
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    }
  };

  // Handle cancel form
  const handleCancel = () => {
    setViewMode('list');
    setEditingKey(null);
  };

  // Handle share dialog
  const handleShare = async (key) => {
    setSharingKey(key);
    setShareDialogOpen(true);
    
    try {
      const sharesRes = await KeysApi.getShares(key.id);
      setCurrentShares(sharesRes.data || []);
      
      const selected = (sharesRes.data || []).map(s => s.company_id);
      setSelectedCompanies(selected);
      
      const perms = {};
      (sharesRes.data || []).forEach(s => {
        perms[s.company_id] = s.permissions;
      });
      setSharePermissions(perms);
    } catch (err) {
      console.warn("Could not fetch shares, using mock:", err.message);
      setCurrentShares([
        { company_id: 3, company_name: "Conciergerie Lyon", permissions: "view" },
      ]);
      setSelectedCompanies([3]);
      setSharePermissions({ 3: "view" });
    }
  };

  // Handle share checkbox change
  const handleShareCheckboxChange = (companyId) => {
    setSelectedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      }
      return [...prev, companyId];
    });
  };

  // Handle permission change
  const handlePermissionChange = (companyId, permission) => {
    setSharePermissions(prev => ({
      ...prev,
      [companyId]: permission,
    }));
  };

  // Handle save shares
  const handleSaveShares = async () => {
    if (!sharingKey) return;
    
    try {
      const companiesToShare = companies.filter(c => 
        c.id !== sharingKey.company_id && selectedCompanies.includes(c.id)
      );
      
      for (const company of companiesToShare) {
        const permissions = sharePermissions[company.id] || "view";
        await KeysApi.share(sharingKey.id, company.id, permissions);
      }
      
      const currentShareIds = currentShares.map(s => s.company_id);
      for (const companyId of currentShareIds) {
        if (!selectedCompanies.includes(companyId)) {
          await KeysApi.unshare(sharingKey.id, companyId);
        }
      }
      
      setShareDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving shares:", err);
      alert("Erreur lors de l'enregistrement des partages");
    }
  };

  // Generate QR code data
  const getQrCodeData = (key) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/cles/${key.id}/visualiser`;
  };

  // Get companies that can receive this key
  const getShareableCompanies = () => {
    if (!sharingKey) return [];
    return companies.filter(c => c.id !== sharingKey.company_id);
  };

  // Table columns
  const columns = [
    { name: "key", align: "left" },
    { name: "visibility", align: "center" },
    { name: "manager", align: "left" },
    { name: "status", align: "center" },
    { name: "actions", align: "center" },
  ];

  // Table rows
  const rows = keys.map(key => ({
    key: <KeyInfo 
      address={key.address} 
      company={key.company_name || getCompanyName(key.company_id)}
      owner={key.owner_name}
    />,
    visibility: <VisibilityBadge visibility={key.visibility || "owned"} />,
    manager: <ManagerInfo name={key.house_manager_name} />,
    status: <StatusBadge status={key.status} />,
    actions: (
      <SoftBox display="flex" gap={0.5} alignItems="center">
        <Actions 
          onView={() => handleView(key)} 
          onEdit={() => handleEdit(key)} 
          onDelete={() => handleDelete(key.id)}
          onShare={() => handleShare(key)}
        />
        <Tooltip title="Tester la page détail">
          <IconButton size="small" color="info" onClick={() => handleTest(key)}>
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </SoftBox>
    ),
  }));

  // Form Page Component
  if (viewMode === 'form') {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox mb={3}>
          <Breadcrumbs separator={<ArrowBackIcon fontSize="small" />}>
            <Link 
              component="button" 
              onClick={handleCancel}
              sx={{ cursor: 'pointer' }}
            >
              Clés
            </Link>
            <SoftTypography variant="body2">
              {editingKey ? "Modifier" : "Nouvelle"}
            </SoftTypography>
          </Breadcrumbs>
        </SoftBox>
        
        <Card>
          <SoftBox p={3}>
            <SoftTypography variant="h5" mb={3}>
              {editingKey ? "Modifier la Clé" : "Nouvelle Clé"}
            </SoftTypography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Entreprise"
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
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
                  label="Nom du propriétaire"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact propriétaire"
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
                  label="Contact gestionnaire"
                  name="house_manager_contact"
                  value={formData.house_manager_contact}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <MenuItem value="available">Disponible</MenuItem>
                  <MenuItem value="borrowed">Emprunté</MenuItem>
                  <MenuItem value="returned">Retourné</MenuItem>
                  <MenuItem value="lost">Perdu</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            
            <Divider my={3} />
            
            <SoftBox display="flex" gap={2} justifyContent="flex-end">
              <SoftButton 
                variant="outlined" 
                color="secondary" 
                onClick={handleCancel}
              >
                Annuler
              </SoftButton>
              <SoftButton 
                variant="contained" 
                color="primary" 
                onClick={handleSave}
              >
                {editingKey ? "Modifier" : "Créer"}
              </SoftButton>
            </SoftBox>
          </SoftBox>
        </Card>
        
        <Footer />
      </DashboardLayout>
    );
  }

  // List Page Component
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Gestion des Clés</SoftTypography>
              <SoftButton 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={handleCreate}
                startIcon={<AddIcon />}
              >
                Ajouter
              </SoftButton>
            </SoftBox>
            {error && (
              <SoftBox px={3}>
                <SoftTypography variant="caption" color="warning">
                  {error}
                </SoftTypography>
              </SoftBox>
            )}
            <SoftBox
              sx={{
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                      `${borderWidth[1]} solid ${borderColor}`,
                  },
                },
              }}
            >
              {loading ? (
                <SoftBox display="flex" justifyContent="center" alignItems="center" p={5}>
                  <SoftTypography variant="caption" color="secondary">Chargement...</SoftTypography>
                </SoftBox>
              ) : (
                <Table columns={columns} rows={rows} />
              )}
            </SoftBox>
          </Card>
        </SoftBox>
      </SoftBox>

      <Footer />

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <SoftBox display="flex" alignItems="center" gap={1}>
            <ShareIcon color="primary" />
            Partager la clé
          </SoftBox>
        </DialogTitle>
        <DialogContent>
          {sharingKey && (
            <SoftBox>
              <SoftTypography variant="body2" color="secondary" mb={2}>
                Sélectionnez les entreprises avec lesquelles partager cette clé :
              </SoftTypography>
              <SoftTypography variant="subtitle2" fontWeight="medium" mb={1}>
                {sharingKey.address}
              </SoftTypography>
              
              <List dense>
                {getShareableCompanies().map((company) => (
                  <ListItem key={company.id} dense>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCompanies.includes(company.id)}
                          onChange={() => handleShareCheckboxChange(company.id)}
                          color="primary"
                        />
                      }
                      label={
                        <SoftBox display="flex" alignItems="center" gap={1}>
                          <BusinessIcon fontSize="small" color="action" />
                          {company.name}
                          {company.type === "agence_imobiliere" && (
                            <Chip label="Agence" size="small" variant="outlined" />
                          )}
                        </SoftBox>
                      }
                    />
                    {selectedCompanies.includes(company.id) && (
                      <TextField
                        select
                        size="small"
                        value={sharePermissions[company.id] || "view"}
                        onChange={(e) => handlePermissionChange(company.id, e.target.value)}
                        sx={{ ml: 2, minWidth: 100 }}
                      >
                        <MenuItem value="view">Lecture</MenuItem>
                        <MenuItem value="edit">Édition</MenuItem>
                        <MenuItem value="full">Contrôle total</MenuItem>
                      </TextField>
                    )}
                  </ListItem>
                ))}
              </List>
              
              {selectedCompanies.length === 0 && (
                <SoftTypography variant="body2" color="text" sx={{ fontStyle: "italic" }}>
                  Aucune entreprise sélectionnée
                </SoftTypography>
              )}
            </SoftBox>
          )}
        </DialogContent>
        <DialogActions>
          <SoftButton 
            variant="outlined" 
            color="secondary" 
            onClick={() => setShareDialogOpen(false)}
          >
            Annuler
          </SoftButton>
          <SoftButton 
            variant="contained" 
            color="primary" 
            onClick={handleSaveShares}
          >
            Enregistrer
          </SoftButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Cles;

/**
 * Personnel Management Page
 * Cards view with avatar images for each personnel member
 */

import React, { useState, useEffect, useCallback } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";

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

// API
import PersonnelApi from "api/personnel";
import CompaniesApi from "api/companies";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// Mock data for fallback
const MOCK_PERSONNEL = [
  { id: 1, company_id: 1, first_name: "Jean", last_name: "Dupont", email: "jean@demo.fr", phone: "01 23 45 67 89", role: "manager", status: "active", company_name: "Conciergerie Paris Centre", avatar_url: "" },
  { id: 2, company_id: 1, first_name: "Marie", last_name: "Martin", email: "marie@demo.fr", phone: "01 23 45 67 90", role: "employee", status: "active", company_name: "Conciergerie Paris Centre", avatar_url: "" },
  { id: 3, company_id: 2, first_name: "Pierre", last_name: "Durand", email: "pierre@demo.fr", phone: "04 56 78 90 12", role: "admin", status: "active", company_name: "Agence Lyon Bellecour", avatar_url: "" },
  { id: 4, company_id: 3, first_name: "Sophie", last_name: "Bernard", email: "sophie@demo.fr", phone: "01 45 67 89 01", role: "manager", status: "active", company_name: "Agence Paris Opéra", avatar_url: "" },
  { id: 5, company_id: 2, first_name: "Lucas", last_name: "Moreau", email: "lucas@demo.fr", phone: "04 78 90 12 34", role: "employee", status: "inactive", company_name: "Agence Lyon Bellecour", avatar_url: "" },
];

const MOCK_COMPANIES = [
  { id: 1, name: "Conciergerie Paris Centre", type: "conciergerie" },
  { id: 2, name: "Agence Lyon Bellecour", type: "agence_imobiliere" },
  { id: 3, name: "Agence Paris Opéra", type: "agence_imobiliere" },
];

// Get role color
function getRoleColor(role) {
  switch (role) {
    case "admin": return "error";
    case "manager": return "primary";
    case "employee": return "info";
    default: return "secondary";
  }
}

// Get role badge
function getRoleBadge(role) {
  switch (role) {
    case "admin": return "Admin";
    case "manager": return "Manager";
    case "employee": return "Employé";
    default: return role;
  }
}

// Status badge component
function StatusBadge({ status }) {
  const config = status === "active" 
    ? { color: "success", badge: "Actif" }
    : { color: "secondary", badge: "Inactif" };
  
  return (
    <SoftBadge variant="gradient" badgeContent={config.badge} color={config.color} size="xs" container />
  );
}

function Personnel() {
  const [personnel, setPersonnel] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  // View mode: 'list' or 'form' for create/edit
  const [viewMode, setViewMode] = useState('list');
  const [editingPerson, setEditingPerson] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_id: "",
    role: "employee",
    status: "active",
    password: "",
    avatar_url: "",
  });

  // Fetch data with try/catch and mock fallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [personnelRes, companiesRes] = await Promise.all([
        PersonnelApi.getAll(),
        CompaniesApi.getAll()
      ]);
      setPersonnel(personnelRes.data);
      setCompanies(companiesRes.data);
      setUseMockData(false);
    } catch (err) {
      console.warn("API unavailable, using mock data:", err.message);
      setPersonnel(MOCK_PERSONNEL);
      setCompanies(MOCK_COMPANIES);
      setUseMockData(true);
      setError("Mode démo - API non disponible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle delete with try/catch
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce membre du personnel?")) {
      try {
        if (useMockData) {
          setPersonnel(prev => prev.filter(p => p.id !== id));
          return;
        }
        await PersonnelApi.delete(id);
        fetchData();
      } catch (err) {
        console.error("Error deleting personnel:", err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  // Handle edit
  const handleEdit = (person) => {
    setEditingPerson(person);
    setFormData({
      first_name: person.first_name || "",
      last_name: person.last_name || "",
      email: person.email || "",
      phone: person.phone || "",
      company_id: person.company_id || "",
      role: person.role || "employee",
      status: person.status || "active",
      password: "",
      avatar_url: person.avatar_url || "",
    });
    setViewMode('form');
  };

  // Handle create new
  const handleCreate = () => {
    setEditingPerson(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company_id: "",
      role: "employee",
      status: "active",
      password: "",
      avatar_url: "",
    });
    setViewMode('form');
  };

  // Handle form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle avatar URL change
  const handleAvatarUrlChange = (e) => {
    setFormData(prev => ({ ...prev, avatar_url: e.target.value }));
  };

  // Handle clear avatar
  const handleClearAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: "" }));
  };

  // Handle save with mock fallback
  const handleSave = async () => {
    try {
      if (editingPerson) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        if (useMockData) {
          setPersonnel(prev => prev.map(p => 
            p.id === editingPerson.id ? { ...p, ...updateData, company_name: companies.find(c => c.id === parseInt(updateData.company_id))?.name || p.company_name } : p
          ));
          setViewMode('list');
          return;
        }
        
        await PersonnelApi.update(editingPerson.id, updateData);
      } else {
        if (!formData.password && !useMockData) {
          alert("Le mot de passe est requis pour créer un nouvel utilisateur");
          return;
        }
        
        if (useMockData) {
          const newPerson = {
            id: Date.now(),
            ...formData,
            company_name: companies.find(c => c.id === parseInt(formData.company_id))?.name || "Nouvelle"
          };
          setPersonnel(prev => [...prev, newPerson]);
          setViewMode('list');
          return;
        }
        
        await PersonnelApi.create(formData);
      }
      fetchData();
      setViewMode('list');
    } catch (err) {
      console.error("Error saving personnel:", err);
      if (useMockData) {
        alert("Mode démo : L'action a été simulée avec succès");
        if (editingPerson) {
          setPersonnel(prev => prev.map(p => 
            p.id === editingPerson.id ? { ...p, ...formData } : p
          ));
        } else {
          const newPerson = {
            id: Date.now(),
            ...formData,
            company_name: companies.find(c => c.id === parseInt(formData.company_id))?.name || "Nouvelle"
          };
          setPersonnel(prev => [...prev, newPerson]);
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
    setEditingPerson(null);
  };

  // Get avatar URL (custom or generated)
  const getAvatarUrl = (person) => {
    if (person.avatar_url) {
      return person.avatar_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(person.first_name + ' ' + person.last_name)}&background=random&size=128`;
  };

  // Form Page Component
  if (viewMode === 'form') {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox mb={3}>
          <Breadcrumbs separator={<ArrowBackIcon fontSize="small" />}>
            <Link component="button" onClick={handleCancel} sx={{ cursor: 'pointer' }}>
              Personnel
            </Link>
            <SoftTypography variant="body2">
              {editingPerson ? "Modifier" : "Nouveau"}
            </SoftTypography>
          </Breadcrumbs>
        </SoftBox>
        
        <Card>
          <SoftBox p={3}>
            <SoftTypography variant="h5" mb={3}>
              {editingPerson ? "Modifier le Personnel" : "Nouveau Membre"}
            </SoftTypography>
            
            {/* Avatar URL input */}
            <Box mb={3} display="flex" flexDirection="column" alignItems="center">
              <SoftAvatar
                src={formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((formData.first_name || 'X') + ' ' + (formData.last_name || ''))}&background=random&size=128`}
                alt={formData.first_name + ' ' + formData.last_name}
                size="xl"
                sx={{ width: 100, height: 100, mb: 2, border: '3px solid white', boxShadow: 3 }}
              />
              <TextField
                fullWidth
                label="URL de la photo de profil"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleAvatarUrlChange}
                placeholder="https://exemple.com/photo.jpg"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CloudUploadIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 400 }}
              />
              {formData.avatar_url && (
                <SoftButton 
                  variant="text" 
                  color="error" 
                  size="small" 
                  onClick={handleClearAvatar}
                  startIcon={<DeleteOutlineIcon />}
                  sx={{ mt: 1 }}
                >
                  Supprimer la photo
                </SoftButton>
              )}
            </Box>
            
            <Divider mb={3} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Prénom" name="first_name" value={formData.first_name} onChange={handleInputChange} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nom" name="last_name" value={formData.last_name} onChange={handleInputChange} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Téléphone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth select label="Entreprise" name="company_id" value={formData.company_id} onChange={handleInputChange}>
                  <MenuItem value="">Sélectionner...</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth select label="Rôle" name="role" value={formData.role} onChange={handleInputChange}>
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="manager">Gestionnaire</MenuItem>
                  <MenuItem value="employee">Employé</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Statut" name="status" value={formData.status} onChange={handleInputChange}>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
                <TextField
                  fullWidth
                  label={editingPerson ? "Nouveau mot de passe (laisser vide pour conserver)" : "Mot de passe"}
                  name="password" type="password" value={formData.password} onChange={handleInputChange} sx={{ mt: 2 }} />
              </Grid>
            </Grid>
            
            <Divider my={3} />
            
            <SoftBox display="flex" gap={2} justifyContent="flex-end">
              <SoftButton variant="outlined" color="secondary" onClick={handleCancel}>Annuler</SoftButton>
              <SoftButton variant="contained" color="primary" onClick={handleSave}>
                {editingPerson ? "Modifier" : "Créer"}
              </SoftButton>
            </SoftBox>
          </SoftBox>
        </Card>
        
        <Footer />
      </DashboardLayout>
    );
  }

  // List Page Component with Cards and Avatars
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Gestion du Personnel</SoftTypography>
              <SoftButton variant="contained" color="primary" size="small" onClick={handleCreate} startIcon={<AddIcon />}>
                Ajouter
              </SoftButton>
            </SoftBox>
            {error && (
              <SoftBox px={3}>
                <SoftTypography variant="caption" color="warning">{error}</SoftTypography>
              </SoftBox>
            )}
          </Card>
        </SoftBox>

        {loading ? (
          <SoftBox display="flex" justifyContent="center" alignItems="center" p={5}>
            <SoftTypography variant="caption" color="secondary">Chargement...</SoftTypography>
          </SoftBox>
        ) : (
          <Grid container spacing={2}>
            {personnel.map((person) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} xl={2.4} key={person.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* Avatar et nom */}
                  <Box display="flex" flexDirection="column" alignItems="center" pt={3} pb={2}>
                    <SoftBadge
                      badgeContent={getRoleBadge(person.role)}
                      color={getRoleColor(person.role)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}
                    >
                      <SoftAvatar
                        src={getAvatarUrl(person)}
                        alt={`${person.first_name} ${person.last_name}`}
                        size="xl"
                        sx={{ width: 80, height: 80, border: '3px solid white', boxShadow: 3 }}
                      />
                    </SoftBadge>
                    <SoftTypography variant="h6" mt={1} textAlign="center">
                      {person.first_name} {person.last_name}
                    </SoftTypography>
                    <Box mt={0.5}>
                      <StatusBadge status={person.status} />
                    </Box>
                  </Box>
                  
                  {/* Bloc d'information */}
                  <Box 
                    sx={{ 
                      bgcolor: 'white', 
                      borderRadius: 1, 
                      p: 1.5, 
                      mx: 1.5, 
                      mb: 1.5,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <BusinessIcon fontSize="small" color="action" />
                      <SoftTypography variant="caption" noWrap>
                        {person.company_name || "Non assigné"}
                      </SoftTypography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <EmailIcon fontSize="small" color="action" />
                      <SoftTypography variant="caption" noWrap>
                        {person.email}
                      </SoftTypography>
                    </Box>
                    {person.phone && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        <SoftTypography variant="caption">
                          {person.phone}
                        </SoftTypography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Actions */}
                  <Divider />
                  <Box display="flex" justifyContent="center" p={1}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" color="info" onClick={() => handleEdit(person)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => handleDelete(person.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Personnel;

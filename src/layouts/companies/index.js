/**
 * Companies Management Page
 * Combined page for Conciergerie and Agence Immobilière with type filter
 */

import React, { useState, useEffect, useCallback } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftAvatar from "components/SoftAvatar";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// API
import CompaniesApi from "api/companies";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

// Mock data for fallback
const MOCK_COMPANIES = [
  { id: 1, name: "Conciergerie Paris Centre", type: "conciergerie", siret: "123 456 789 00001", address: "123 Rue de la Paix, Paris", phone: "01 23 45 67 89", email: "contact@paris.fr", status: "active", parent_id: 3 },
  { id: 2, name: "Conciergerie Lyon Part-Dieu", type: "conciergerie", siret: "123 456 789 00002", address: "456 Avenue Thiers, Lyon", phone: "04 78 90 12 34", email: "contact@lyon.fr", status: "active", parent_id: 4 },
  { id: 3, name: "Agence Paris Opéra", type: "agence_imobiliere", siret: "987 654 321 00001", address: "12 Place de l'Opéra, Paris", phone: "01 45 67 89 01", email: "agence@paris.fr", status: "active", parent_id: null },
  { id: 4, name: "Agence Lyon Bellecour", type: "agence_imobiliere", siret: "987 654 321 00002", address: "34 Rue de la République, Lyon", phone: "04 56 78 90 12", email: "agence@lyon.fr", status: "active", parent_id: null },
  { id: 5, name: "Conciergerie Bordeaux", type: "conciergerie", siret: "456 789 123 00001", address: "78 Rue Sainte-Catherine, Bordeaux", phone: "05 67 89 01 23", email: "contact@bordeaux.fr", status: "active", parent_id: null },
  { id: 6, name: "Agence Marseille", type: "agence_imobiliere", siret: "789 123 456 00001", address: "90 La Canebière, Marseille", phone: "04 91 23 45 67", email: "agence@marseille.fr", status: "active", parent_id: null },
];

// Placeholder images
const CONCIERGERIE_IMAGE = "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400&h=300&fit=crop";
const AGENCE_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // View mode: 'list' or 'form' for create/edit
  const [viewMode, setViewMode] = useState('list');
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "conciergerie",
    siret: "",
    address: "",
    phone: "",
    email: "",
    status: "active",
    parent_id: "",
  });

  // Fetch companies with try/catch
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CompaniesApi.getAll();
      setCompanies(response.data);
      const agencyList = response.data.filter(c => c.type === "agence_imobiliere");
      setAgencies(agencyList);
    } catch (err) {
      console.warn("API unavailable, using mock data:", err.message);
      setCompanies(MOCK_COMPANIES);
      setAgencies(MOCK_COMPANIES.filter(c => c.type === "agence_imobiliere"));
      setError("Mode démo - API non disponible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Get filtered companies
  const getFilteredCompanies = () => {
    switch (activeTab) {
      case 1: return companies.filter(c => c.type === "conciergerie");
      case 2: return companies.filter(c => c.type === "agence_imobiliere");
      default: return companies;
    }
  };

  // Get parent company name
  const getParentName = (parentId) => {
    if (!parentId) return null;
    const parent = companies.find(c => c.id === parentId);
    return parent ? parent.name : "Inconnue";
  };

  // Handle edit
  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || "",
      type: company.type || "conciergerie",
      siret: company.siret || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      status: company.status || "active",
      parent_id: company.parent_id || "",
    });
    setViewMode('form');
  };

  // Handle create new
  const handleCreate = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      type: activeTab === 2 ? "agence_imobiliere" : "conciergerie",
      siret: "",
      address: "",
      phone: "",
      email: "",
      status: "active",
      parent_id: "",
    });
    setViewMode('form');
  };

  // Handle delete with try/catch
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise?")) {
      try {
        await CompaniesApi.delete(id);
        fetchCompanies();
      } catch (err) {
        console.error("Error deleting company:", err);
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
      const dataToSend = { ...formData };
      if (formData.type !== "conciergerie" || !formData.parent_id) {
        delete dataToSend.parent_id;
      }
      
      if (useMockData) {
        // Mock create/update
        if (editingCompany) {
          setCompanies(prev => prev.map(c => 
            c.id === editingCompany.id ? { ...c, ...dataToSend } : c
          ));
        } else {
          const newCompany = {
            id: Date.now(),
            ...dataToSend,
            parent_name: agencies.find(a => a.id === parseInt(dataToSend.parent_id))?.name || null
          };
          setCompanies(prev => [...prev, newCompany]);
        }
        setViewMode('list');
        return;
      }
      
      if (editingCompany) {
        await CompaniesApi.update(editingCompany.id, dataToSend);
      } else {
        await CompaniesApi.create(dataToSend);
      }
      fetchCompanies();
      setViewMode('list');
    } catch (err) {
      console.error("Error saving company:", err);
      // If API fails and we're in mock mode, show a friendly message
      if (useMockData) {
        alert("Mode démo : L'action a été simulée avec succès");
        // Manually update local state for mock mode
        if (editingCompany) {
          setCompanies(prev => prev.map(c => 
            c.id === editingCompany.id ? { ...c, ...formData } : c
          ));
        } else {
          const newCompany = {
            id: Date.now(),
            ...formData,
            parent_name: agencies.find(a => a.id === parseInt(formData.parent_id))?.name || null
          };
          setCompanies(prev => [...prev, newCompany]);
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
    setEditingCompany(null);
  };

  // Get image based on type
  const getImage = (type) => {
    return type === "agence_imobiliere" ? AGENCE_IMAGE : CONCIERGERIE_IMAGE;
  };

  // Get label based on type
  const getTypeLabel = (type) => {
    return type === "agence_imobiliere" ? "agence" : "conciergerie";
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === "active" ? "success" : "secondary";
  };

  const filteredCompanies = getFilteredCompanies();

  // Form Page Component
  if (viewMode === 'form') {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox mb={3}>
          <Breadcrumbs separator={<ArrowBackIcon fontSize="small" />}>
            <Link component="button" onClick={handleCancel} sx={{ cursor: 'pointer' }}>
              Entreprises
            </Link>
            <SoftTypography variant="body2">
              {editingCompany ? "Modifier" : "Nouvelle"}
            </SoftTypography>
          </Breadcrumbs>
        </SoftBox>
        
        <Card>
          <SoftBox p={3}>
            <SoftTypography variant="h5" mb={3}>
              {editingCompany ? "Modifier l'Entreprise" : "Nouvelle Entreprise"}
            </SoftTypography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Type d'entreprise"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <MenuItem value="conciergerie">Conciergerie</MenuItem>
                  <MenuItem value="agence_imobiliere">Agence Immobilière</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField fullWidth label="Nom de l'entreprise" name="name" value={formData.name} onChange={handleInputChange} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="SIRET" name="siret" value={formData.siret} onChange={handleInputChange} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleInputChange} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField fullWidth label="Adresse" name="address" value={formData.address} onChange={handleInputChange} multiline rows={2} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Téléphone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Statut" name="status" value={formData.status} onChange={handleInputChange}>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </TextField>
              </Grid>
              
              {formData.type === "conciergerie" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Agence de rattachement (optionnel)"
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                    helperText="Sélectionnez l'agence immobilière qui gère cette conciergerie"
                  >
                    <MenuItem value="">Aucune (indépendante)</MenuItem>
                    {agencies.map((agency) => (
                      <MenuItem key={agency.id} value={agency.id}>{agency.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
            
            <Divider my={3} />
            
            <SoftBox display="flex" gap={2} justifyContent="flex-end">
              <SoftButton variant="outlined" color="secondary" onClick={handleCancel}>Annuler</SoftButton>
              <SoftButton variant="contained" color="primary" onClick={handleSave}>
                {editingCompany ? "Modifier" : "Créer"}
              </SoftButton>
            </SoftBox>
          </SoftBox>
        </Card>
        
        <Footer />
      </DashboardLayout>
    );
  }

  // List Page Component with Cards
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox mt={5} mb={3}>
        <Card>
          <SoftBox pt={2} px={2}>
            <SoftBox mb={0.5}>
              <SoftTypography variant="h6" fontWeight="medium">Entreprises</SoftTypography>
            </SoftBox>
            <SoftBox mb={1}>
              <SoftTypography variant="button" fontWeight="regular" color="text">
                Gérez vos conciergeries et agences immobilières
              </SoftTypography>
            </SoftBox>
            
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
              <Tab label="Toutes" />
              <Tab label="Conciergeries" icon={<HomeIcon />} iconPosition="start" />
              <Tab label="Agences" icon={<BusinessIcon />} iconPosition="start" />
            </Tabs>
          </SoftBox>
          
          <SoftBox p={2}>
            <SoftBox display="flex" justifyContent="flex-end" mb={2}>
              <SoftButton variant="contained" color="primary" onClick={handleCreate}>
                Nouvelle {activeTab === 2 ? "Agence" : activeTab === 1 ? "Conciergerie" : "Entreprise"}
              </SoftButton>
            </SoftBox>

            {loading ? (
              <SoftBox display="flex" justifyContent="center" alignItems="center" p={5}>
                <SoftTypography variant="caption" color="secondary">Chargement...</SoftTypography>
              </SoftBox>
            ) : (
              <Grid container spacing={2}>
                {filteredCompanies.map((company) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} xl={2.4} key={company.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      {/* Image */}
                      <Box
                        sx={{
                          height: 120,
                          backgroundImage: `url(${getImage(company.type)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative'
                        }}
                      >
                        {/* Status chip */}
                        <Chip 
                          label={company.status === "active" ? "Actif" : "Inactif"}
                          size="small"
                          color={getStatusColor(company.status)}
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            fontSize: '0.7rem'
                          }}
                        />
                        {/* Type badge */}
                        <Chip 
                          label={getTypeLabel(company.type)}
                          size="small"
                          icon={company.type === "agence_imobiliere" ? <BusinessIcon /> : <HomeIcon />}
                          sx={{ 
                            position: 'absolute', 
                            bottom: -12, 
                            left: 12,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                      
                      {/* Content */}
                      <SoftBox p={2} pt={3} sx={{ flexGrow: 1 }}>
                        <SoftTypography variant="subtitle1" fontWeight="medium" noWrap>
                          {company.name}
                        </SoftTypography>
                        
                        {/* Info block */}
                        <Box 
                          sx={{ 
                            bgcolor: 'white',
                            borderRadius: 1,
                            p: 1.5,
                            mt: 1,
                            border: '1px solid',
                            borderColor: 'grey.200'
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <LocationOnIcon fontSize="small" color="action" />
                            <SoftTypography variant="caption" noWrap>
                              {company.address || "Adresse non renseignée"}
                            </SoftTypography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <BadgeIcon fontSize="small" color="action" />
                            <SoftTypography variant="caption">
                              {company.siret || "N/A"}
                            </SoftTypography>
                          </Box>
                          {company.phone && (
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <PhoneIcon fontSize="small" color="action" />
                              <SoftTypography variant="caption">
                                {company.phone}
                              </SoftTypography>
                            </Box>
                          )}
                          {company.email && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <EmailIcon fontSize="small" color="action" />
                              <SoftTypography variant="caption" noWrap>
                                {company.email}
                              </SoftTypography>
                            </Box>
                          )}
                        </Box>
                        
                        {/* Hierarchy indicators */}
                        {company.type === "conciergerie" && company.parent_id && (
                          <Tooltip title={`Rattachée à: ${getParentName(company.parent_id)}`}>
                            <Chip 
                              icon={<ArrowUpwardIcon fontSize="small" />}
                              label="Rattachée"
                              size="small"
                              color="info"
                              sx={{ mt: 1, fontSize: '0.7rem' }}
                            />
                          </Tooltip>
                        )}
                        {company.type === "agence_imobiliere" && (
                          <Chip 
                            icon={<ArrowDownwardIcon fontSize="small" />}
                            label={`${companies.filter(c => c.parent_id === company.id).length} conciergerie(s)`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 1, fontSize: '0.7rem' }}
                          />
                        )}
                      </SoftBox>
                      
                      {/* Action buttons */}
                      <Divider />
                      <SoftBox display="flex" justifyContent="center" p={1}>
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="info" onClick={() => handleEdit(company)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={() => handleDelete(company.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </SoftBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </SoftBox>
        </Card>
      </SoftBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Companies;

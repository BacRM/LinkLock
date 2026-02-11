/**
 * Key Visualization Page
 * Display key details with QR code for scanning
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";

// QR Code
import QRCode from "react-qr-code";

// API
import KeysApi from "api/keys";
import CompaniesApi from "api/companies";

// Mock data for fallback
const MOCK_KEY = {
  id: 1,
  company_id: 1,
  address: "123 Rue de la Paix, Paris 75001",
  owner_name: "M. Martin",
  owner_contact: "01 23 45 67 89",
  house_manager_name: "Mme Dubois",
  house_manager_contact: "06 12 34 56 78",
  status: "available",
  company_name: "Conciergerie Paris"
};

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
    <SoftTypography
      variant="button"
      color="white"
      fontWeight="medium"
      sx={{
        bgcolor: `${config.color}.main`,
        px: 2,
        py: 0.5,
        borderRadius: 2,
      }}
    >
      {config.badge}
    </SoftTypography>
  );
}

function KeyVisualization() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [key, setKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch key data
  const fetchKey = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get from API first
      const response = await KeysApi.getById(id);
      setKey(response.data);
      
      // Get company name
      if (response.data.company_id) {
        const companiesRes = await CompaniesApi.getAll();
        const company = companiesRes.data.find(c => c.id === response.data.company_id);
        if (company) {
          setKey(prev => ({ ...prev, company_name: company.name }));
        }
      }
    } catch (err) {
      console.warn("API unavailable, using mock data:", err.message);
      // Use mock data
      setKey({ ...MOCK_KEY, id: parseInt(id) });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKey();
  }, [fetchKey]);

  // Generate QR code data
  const getQrCodeData = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/cles/${id}/visualiser`;
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Clé: ${key?.address}`,
          text: `Détails de la clé: ${key?.address}`,
          url: getQrCodeData(),
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(getQrCodeData());
      alert("Lien copié dans le presse-papier!");
    }
  };

  // Handle back
  const handleBack = () => {
    navigate("/cles");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3}>
          <Card>
            <SoftBox p={5} display="flex" justifyContent="center" alignItems="center">
              <SoftTypography variant="caption" color="secondary">Chargement...</SoftTypography>
            </SoftBox>
          </Card>
        </SoftBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!key) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3}>
          <Card>
            <SoftBox p={5} display="flex" justifyContent="center" alignItems="center">
              <SoftTypography variant="body1" color="error">
                Clé non trouvée
              </SoftTypography>
            </SoftBox>
          </Card>
        </SoftBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <Grid container spacing={3}>
          {/* Back Button */}
          <Grid item xs={12}>
            <SoftButton 
              variant="text" 
              color="secondary" 
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Retour à la liste
            </SoftButton>
          </Grid>

          {/* QR Code Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <SoftBox p={3} display="flex" flexDirection="column" alignItems="center">
                <QrCodeIcon sx={{ fontSize: 40, mb: 2, color: "primary.main" }} />
                <SoftTypography variant="h6" mb={2}>
                  Code QR
                </SoftTypography>
                <div style={{ background: "white", padding: 16, borderRadius: 8, marginBottom: 16 }}>
                  <QRCode 
                    value={getQrCodeData()} 
                    size={180}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <SoftTypography variant="caption" color="secondary" textAlign="center" mb={2}>
                  Scannez ce code pour accéder aux détails de cette clé
                </SoftTypography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <SoftButton 
                      variant="outlined" 
                      color="secondary" 
                      size="small" 
                      fullWidth
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                    >
                      Imprimer
                    </SoftButton>
                  </Grid>
                  <Grid item xs={6}>
                    <SoftButton 
                      variant="outlined" 
                      color="secondary" 
                      size="small" 
                      fullWidth
                      startIcon={<ShareIcon />}
                      onClick={handleShare}
                    >
                      Partager
                    </SoftButton>
                  </Grid>
                </Grid>
              </SoftBox>
            </Card>
          </Grid>

          {/* Key Details Card */}
          <Grid item xs={12} md={8}>
            <Card>
              <SoftBox p={3}>
                <SoftTypography variant="h5" mb={3}>
                  {key.address}
                </SoftTypography>
                
                <Grid container spacing={3}>
                  {/* Status */}
                  <Grid item xs={12}>
                    <SoftBox display="flex" alignItems="center" gap={2}>
                      <SoftTypography variant="overline" color="secondary">
                        Statut:
                      </SoftTypography>
                      <StatusBadge status={key.status} />
                    </SoftBox>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* Company */}
                  <Grid item xs={12} sm={6}>
                    <SoftTypography variant="overline" color="secondary">
                      Entreprise
                    </SoftTypography>
                    <SoftTypography variant="body1" fontWeight="medium">
                      {key.company_name || "Non assignée"}
                    </SoftTypography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Divider sx={{ display: { sm: "none" } }} />
                    <SoftTypography variant="overline" color="secondary">
                      ID de la clé
                    </SoftTypography>
                    <SoftTypography variant="body1" fontWeight="medium">
                      #{key.id}
                    </SoftTypography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* Owner */}
                  <Grid item xs={12} sm={6}>
                    <SoftTypography variant="overline" color="secondary">
                      Propriétaire
                    </SoftTypography>
                    <SoftTypography variant="body1" fontWeight="medium">
                      {key.owner_name || "Non renseigné"}
                    </SoftTypography>
                    {key.owner_contact && (
                      <SoftTypography variant="body2" color="secondary">
                        {key.owner_contact}
                      </SoftTypography>
                    )}
                  </Grid>

                  {/* House Manager */}
                  <Grid item xs={12} sm={6}>
                    <Divider sx={{ display: { sm: "none" } }} />
                    <SoftTypography variant="overline" color="secondary">
                      Gestionnaire
                    </SoftTypography>
                    <SoftTypography variant="body1" fontWeight="medium">
                      {key.house_manager_name || "Non assigné"}
                    </SoftTypography>
                    {key.house_manager_contact && (
                      <SoftTypography variant="body2" color="secondary">
                        {key.house_manager_contact}
                      </SoftTypography>
                    )}
                  </Grid>
                </Grid>
              </SoftBox>
            </Card>
          </Grid>

          {/* Actions Card */}
          <Grid item xs={12}>
            <Card>
              <SoftBox p={3}>
                <SoftTypography variant="h6" mb={2}>
                  Actions
                </SoftTypography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <SoftButton 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      onClick={() => navigate(`/cles?edit=${id}`)}
                    >
                      Modifier cette clé
                    </SoftButton>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SoftButton 
                      variant="outlined" 
                      color="secondary" 
                      fullWidth
                      onClick={() => navigate("/cles")}
                    >
                      Retour à la liste
                    </SoftButton>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SoftButton 
                      variant="outlined" 
                      color="error" 
                      fullWidth
                      onClick={() => {
                        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette clé?")) {
                          KeysApi.delete(key.id).then(() => navigate("/cles"));
                        }
                      }}
                    >
                      Supprimer
                    </SoftButton>
                  </Grid>
                </Grid>
              </SoftBox>
            </Card>
          </Grid>
        </Grid>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default KeyVisualization;

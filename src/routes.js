/**
 * =========================================================
 * LinkLock - Routes Configuration
 * =========================================================
 * 
 * Architecture des routes avec React.lazy() et Suspense
 */

import React, { lazy } from "react";

// Soft UI Dashboard React layouts
import Dashboard from "layouts/dashboard";
import Billing from "layouts/billing";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import SignOut from "layouts/authentication/sign-out";

// Lazy-loaded pages for Company Management Module
const Companies = lazy(() => import("layouts/companies"));
const Personnel = lazy(() => import("layouts/personnel"));
const Cles = lazy(() => import("layouts/cles"));
const KeyVisualisation = lazy(() => import("layouts/key-visualisation"));

// Soft UI Dashboard React icons
import Shop from "examples/Icons/Shop";
import Document from "examples/Icons/Document";
import CustomerSupport from "examples/Icons/CustomerSupport";
import { Icon } from "@mui/material";
import Business from "examples/Icons/Business";
import People from "examples/Icons/People";
import VpnKey from "examples/Icons/VpnKey";

const routes = [
  // Dashboard
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    icon: <Shop size="12px" />,
    component: <Dashboard />,
    noCollapse: true,
    protected: false,
  },
  {
    type: "title",
    title: "Gestion Entreprise",
    key: "company-management"
  },
  // Entreprises (Combined Conciergerie + Agences)
  {
    type: "collapse",
    name: "Entreprises",
    key: "companies",
    route: "/companies",
    icon: <Business size="12px" />,
    component: <Companies />,
    noCollapse: true,
  },
  // Personnel
  {
    type: "collapse",
    name: "Personnel",
    key: "personnel",
    route: "/personnel",
    icon: <People size="12px" />,
    component: <Personnel />,
    noCollapse: true,
  },
  // Clés
  {
    type: "collapse",
    name: "Clés",
    key: "cles",
    route: "/cles",
    icon: <VpnKey size="12px" />,
    component: <Cles />,
    noCollapse: true,
  },
  // Key Visualisation (for QR code scanning)
  {
    type: "route",
    name: "KeyVisualisation",
    key: "key-visualisation",
    route: "/cles/:id/visualiser",
    component: <KeyVisualisation />,
  },
  {
    type: "title",
    title: "Account Pages",
    key: "account-pages"
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    route: "/profile",
    icon: <CustomerSupport size="12px" />,
    component: <Profile />,
    noCollapse: true,
    protected: false,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    icon: <Document size="12px" />,
    component: <SignIn />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    icon: <Icon>add_circle</Icon>,
    component: <SignUp />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Logout",
    key: "sign-out",
    route: "/authentication/sign-out",
    icon: <Icon>logout</Icon>,
    component: <SignOut />,
    noCollapse: true,
  },
];

export default routes;

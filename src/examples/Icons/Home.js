/**
 * =========================================================
 * Soft UI Dashboard React - v4.0.0
 * =========================================================
 * 
 * Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
 * Copyright 2022 Creative Tim (https://www.creative-tim.com)
 * 
 * Coded by www.creative-tim.com
 * 
 * =========================================================
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

import { forwardRef } from "react";

import { SvgIcon } from "@mui/material";

const Home = forwardRef((props, ref) => {
  return (
    <SvgIcon
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1.2em"
      height="1.2em"
      fill="currentColor"
      {...props}
    >
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </SvgIcon>
  );
});

export default Home;

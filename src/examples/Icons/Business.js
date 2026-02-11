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

const Business = forwardRef((props, ref) => {
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
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </SvgIcon>
  );
});

export default Business;

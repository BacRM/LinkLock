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

const VpnKey = forwardRef((props, ref) => {
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
      <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </SvgIcon>
  );
});

export default VpnKey;

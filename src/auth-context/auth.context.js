import React from "react";
import PropTypes from "prop-types";

const AuthContext = React.createContext(null);

export const AuthProvider = ({ userData, children }) => {
  const user = null; // Disable authentication by setting user to null

  return <AuthContext.Provider value={{ user, setUser: () => {} }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  userData: PropTypes.any,
  children: PropTypes.any,
};

export const useAuth = () => React.useContext(AuthContext);

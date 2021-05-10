import React from 'react';
const AuthContext = React.createContext({});

export type AuthContextState = {
  login?: () => void;
  logout?: () => void;
};

export default AuthContext;

import React, { createContext, useContext, useState } from 'react';

const MetaMindContext = createContext(null);

export const MetaMindProvider = ({ children }) => {
  const [metaMind, setMetaMind] = useState({});

  return (
    <MetaMindContext.Provider value={{ metaMind, setMetaMind }}>
      {children}
    </MetaMindContext.Provider>
  );
};

export const useMetaMind = () => {
  const context = useContext(MetaMindContext);
  if (!context) {
    throw new Error('useMetaMind must be used within a MetaMindProvider');
  }
  return context;
};

import React from 'react';

// Mock Icon component
const Icon = ({ name, size, color }) => (
  <div data-testid="icon" style={{ fontSize: size, color }}>
    {name}
  </div>
);

// Mock FindClosestIcon function
const FindClosestIcon = (name) => name;

// Mock HexToRGBA function with error handling
const HexToRGBA = (hex, alpha = 1) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (error) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
};

// Create the context
const AppContext = React.createContext();

// Create the provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = React.useState({
    id: 'test-id',
    email: 'test@example.com',
    username: 'testuser',
    clrAccent: '#000000',
    clrNavbar: '#ffffff',
    clrNavbarGradient: '#f0f0f0',
    clrChat: '#eeeeee',
    sizeInnerSidebar: '250px'
  });

  const value = {
    user,
    setUser,
    HexToRGBA,
    Icon,
    FindClosestIcon,
    // Add any other context values that might be needed
    theme: 'light',
    toggleTheme: jest.fn(),
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn()
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, Icon, FindClosestIcon, HexToRGBA };
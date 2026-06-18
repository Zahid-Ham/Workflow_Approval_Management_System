import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom test renderer that wraps tested components inside routing and authentication providers.
 */
export const renderWithProviders = (
  ui,
  {
    authValue = {
      user: null,
      loading: false,
      isAuthenticated: false,
      isRequester: false,
      isReviewer: false,
      loginWithGoogle: () => {},
      login: async () => {},
      logout: () => {},
      setUser: () => {},
    },
    route = '/',
    ...renderOptions
  } = {}
) => {
  // Push simulated route location state to window history if needed
  window.history.pushState({}, 'Test Page', route);

  const Wrapper = ({ children }) => {
    return (
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Re-export standard react-testing-library items
export * from '@testing-library/react';
// export { default as userEvent } from '@testing-library/user-event';

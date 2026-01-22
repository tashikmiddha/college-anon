import React from 'react';
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './app/store';
import { getMe } from './features/auth/authSlice';
import './index.css';

// Component to initialize auth state - using named export for HMR compatibility
export function AuthInitializer() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only fetch once on mount when user is already logged in
    // This prevents repeated calls during React strict mode
    if (user && token && !hasInitialized.current) {
      hasInitialized.current = true;
      dispatch(getMe());
    }
  }, [user, token, dispatch]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthInitializer />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);


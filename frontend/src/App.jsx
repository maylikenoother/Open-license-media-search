import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookmarksPage from "./pages/BookmarksPage";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import TokenHandler from './components/TokenHandler'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("auth_token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#ff4081" },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/auth/token" element={<TokenHandler />} />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

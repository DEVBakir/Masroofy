import { ThemeProvider } from "./components/provider/theme-provider";
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './Navbar/Navbar';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import SignIn from './auth/SignIn';

function App() {
  return (
    <AuthProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          
          <Route path="/login" element={<SignIn />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transaction" element={<>Transaction Page</>} />
            <Route path="manage" element={<>Manage Page</>} />
            <Route path="welcome" element={<Welcome />} />
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
  );
}

export default App;

function Layout() {
  return (
    <div className='relative flex h-screen w-full flex-col'>
      <Navbar />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}

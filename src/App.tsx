import { ThemeProvider } from "./components/provider/theme-provider";
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './Navbar/Navbar';
import Dashboard from './pages/Dashboard';
import Manage from './pages/Manage';
import Transaction from './pages/Transaction/Transaction';
import Welcome from './pages/Welcome';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import SignIn from './auth/SignIn';
import { Toaster } from "./components/ui/sonner";

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
            <Route path="transaction" element={<Transaction/>} />
            <Route path="manage" element={<Manage />} />
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
      <div className='relative flex  w-full flex-col mb-[100px]'>
        <Navbar />
        <div>
          <Outlet />
        </div>
        <Toaster richColors position="bottom-right"/>
      </div>
  );
}






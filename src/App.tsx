import { ThemeProvider } from "./components/provider/theme-provider"
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Navbar from './Navbar/Navbar'
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <BrowserRouter>
       <Routes>
          <Route path='' element={<Layout />}>
            <Route index element={<Dashboard />}/>
            <Route path='/transaction' element={<>Trans</>}/>
            <Route path='/manage' element={<>Manage</>}/>      
            <Route path='/welcome' element={<Welcome />}/>      
          </Route>
       </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

function Layout() {
  return (
    <div className='relative flex h-screen w-full flex-col'>
    <Navbar />
    <Outlet />
  </div>
  )
}

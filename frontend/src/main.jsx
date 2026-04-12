import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'
import { AuthProvider } from './authContext.jsx';
import ProjectRoutes from "./Routes.jsx";

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Router>
      <ProjectRoutes />
      <ToastContainer position="top-right" autoClose={2200} theme="dark" />
    </Router>
  </AuthProvider>,
)

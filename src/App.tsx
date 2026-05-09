import { AuthProvider } from './context/AuthContext';
import { Router, Route } from './components/Router';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProjectsPage from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import NewProject from './pages/NewProject';
import TalentPage from './pages/Talent';
import ProfilePage from './pages/ProfilePage';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import { LoginPage, SignupPage } from './pages/Auth';

function AppRoutes() {
  return (
    <Layout>
      <Route path="/"><Home /></Route>
      <Route path="/projects"><ProjectsPage /></Route>
      <Route path="/projects/new"><NewProject /></Route>
      <Route path="/projects/:id"><ProjectDetail /></Route>
      <Route path="/talent"><TalentPage /></Route>
      <Route path="/profile/:id"><ProfilePage /></Route>
      <Route path="/settings"><Settings /></Route>
      <Route path="/dashboard"><Dashboard /></Route>
      <Route path="/login"><LoginPage /></Route>
      <Route path="/signup"><SignupPage /></Route>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

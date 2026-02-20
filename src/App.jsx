import { useState, useEffect, useCallback } from 'react'
import Layout from './components/Layout'
import ProjectList from './components/ProjectList'
import AuthPage from './pages/AuthPage'
import SettingsPage from './pages/SettingsPage'
import TimerView from './pages/TimerView'
import NotesView from './pages/NotesView'
import CommunityView from './pages/CommunityView'

import { useUser } from './context/UserContext'

function App() {
  const [currentView, setView] = useState('personal'); // 'personal', 'community', 'settings', or 'timer'
  const [communityRefreshKey, setCommunityRefreshKey] = useState(0);
  const { user, login, loading } = useUser();

  const handleCommunityJoined = useCallback(() => {
    setView('community');
    setCommunityRefreshKey(k => k + 1);
  }, []);

  if (loading && !user && localStorage.getItem('token')) {
    return <div className="h-screen flex items-center justify-center font-bold">LOADING SESSION...</div>;
  }

  if (!user && !localStorage.getItem('token')) {
    return <AuthPage onLogin={(token) => login(token)} />;
  }

  return (
    <Layout currentView={currentView} setView={setView} onCommunityJoined={handleCommunityJoined}>
      {/* Content Area */}
      <div className="h-full">
        {currentView === 'settings' ? (
          <SettingsPage />
        ) : currentView === 'timer' ? (
          <TimerView />
        ) : currentView === 'notes' ? (
          <NotesView />
        ) : currentView === 'community' ? (
          <CommunityView key={communityRefreshKey} />
        ) : (
          <ProjectList view={currentView} />
        )}
      </div>
    </Layout>
  )
}

export default App

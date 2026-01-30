import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import ProjectList from './components/ProjectList'
import AuthPage from './pages/AuthPage'

function App() {
  const [currentView, setView] = useState('personal'); // 'personal' or 'community'
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return <AuthPage onLogin={() => setToken(localStorage.getItem('token'))} />;
  }

  return (
    <Layout currentView={currentView} setView={setView}>
      {/* Content Area */}
      <div className="h-full">
        <ProjectList view={currentView} />
      </div>
    </Layout>
  )
}

export default App

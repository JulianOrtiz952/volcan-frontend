import { useState } from 'react'
import Layout from './components/Layout'
import ProjectList from './components/ProjectList'

function App() {
  const [currentView, setView] = useState('personal'); // 'personal' or 'community'

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

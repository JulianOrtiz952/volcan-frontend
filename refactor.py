import re

path = '/home/volcan/Documentos/dev/volcan/frontend/src/pages/CommunityView.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# I need to hoist `selectedProject` and `setSelectedProject` from CommunityPanel up to CommunityView.
# Find `const [selectedProject, setSelectedProject] = useState(null);` in CommunityPanel.
code = code.replace(
    'const CommunityPanel = ({ community, currentUserId, theme, onUpdate, onCreateProject, onClose }) => {',
    'const CommunityPanel = ({ community, currentUserId, theme, onUpdate, onCreateProject, onClose, selectedProject, setSelectedProject }) => {'
)
code = code.replace('const [selectedProject, setSelectedProject] = useState(null);', '')

# Now in CommunityView:
code = code.replace(
    'const [modalProject, setModalProject] = useState(null);',
    'const [modalProject, setModalProject] = useState(null);\n    const [selectedProject, setSelectedProject] = useState(null);\n'
)

# And pass it to CommunityPanel:
code = code.replace(
    '<CommunityPanel key={selected.id} community={selected} currentUserId={user?.id} theme={theme}\n                        onUpdate={() => fetchAll(true)} onCreateProject={(id) => setModalProject(id)} onClose={() => setSelected(null)} />',
    '<CommunityPanel key={selected.id} community={selected} currentUserId={user?.id} theme={theme}\n                        onUpdate={() => fetchAll(true)} onCreateProject={(id) => setModalProject(id)} onClose={() => setSelected(null)} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />'
)

# Also clear selectedProject when changing community:
code = code.replace(
    'onClick={() => setSelected(c)}',
    'onClick={() => { setSelected(c); setSelectedProject(null); }}'
)

# Now that CommunityView has selectedProject, we can render the projects and pages in the sidebar!!!!
# We need to target the mapped community buttons:
sidebar_community_item = """
                                    <button key={c.id} onClick={() => { setSelected(c); setSelectedProject(null); }}
                                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${s.sidebarItem(isActive)}`}>
                                        <Avatar name={c.name} size={20} theme={theme} />
                                        <span className="truncate font-medium text-sm">{c.name}</span>
                                        {c.owner === user?.id && <Crown size={10} className={`flex-shrink-0 ${s.crownCls}`} />}
                                    </button>
"""
target_original = """
                                    <button key={c.id} onClick={() => { setSelected(c); setSelectedProject(null); }}
                                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${s.sidebarItem(isActive)}`}>
                                        <Avatar name={c.name} size={20} theme={theme} />
                                        <span className="truncate font-medium text-sm">{c.name}</span>
                                        {c.owner === user?.id && <Crown size={10} className={`flex-shrink-0 ${s.crownCls}`} />}
                                    </button>
"""
# Oops, original one only had onClick={() => setSelected(c)}. Wait, the replace above handled it.
# Let's do it correctly:
code = code.replace(
    '<button key={c.id} onClick={() => { setSelected(c); setSelectedProject(null); }}\n                                        className={`w-full text-left',
    """
                                    <div key={c.id}>
                                       <button onClick={() => { setSelected(c); setSelectedProject(null); }}
                                           className={`w-full text-left"""
)

# Now we need to close the div around the button and inject the projects:
# Wait, look at the end of the button:
# {c.owner === user?.id && <Crown size={10} className={`flex-shrink-0 ${s.crownCls}`} />}
# </button>

new_projects_tree = """
                                        {c.owner === user?.id && <Crown size={10} className={`flex-shrink-0 ${s.crownCls}`} />}
                                       </button>
                                       {isActive && c.projects?.length > 0 && (
                                            <div className="mt-1 mb-2 space-y-1">
                                                {c.projects.map(p => (
                                                    <div key={p.id} className="pl-4 border-l border-white/10 ml-5 py-0.5">
                                                        <button 
                                                            onClick={() => setSelectedProject(p)}
                                                            className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors hover:text-white ${selectedProject?.id === p.id ? 'text-white font-medium bg-white/5' : s.muted}` }>
                                                            <FolderOpen size={12} className={selectedProject?.id === p.id ? 'text-cyber-primary' : 'opacity-70'} />
                                                            <span className="truncate">{p.name}</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                       )}
                                    </div>
"""

code = code.replace(
    '{c.owner === user?.id && <Crown size={10} className={`flex-shrink-0 ${s.crownCls}`} />}\n                                    </button>',
    new_projects_tree
)

# Now, hide the original "Notes" sidebar in ProjectDetail?
# Or just let them enjoy the nested project list. Wait, if the user ALSO wants to see the Notes as sub-divisions under the Project!
# Let's add the notes right into the same sidebar!
# But CommunityView doesn't have openNote. That's fine, selecting a specific note would require lifting selectedNote. This is already a massive improvement.

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Modified CommunityView.jsx")

import re
import codecs

path = '/home/volcan/Documentos/dev/volcan/frontend/src/pages/CommunityView.jsx'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

# 1. Modify CommunityView states:
# Find: const [selectedProject, setSelectedProject] = useState(null);
# Replace with selectedNote, isCreatingNote too
text = text.replace(
    "const [selectedProject, setSelectedProject] = useState(null);",
    "const [selectedProject, setSelectedProject] = useState(null);\n    const [selectedNote, setSelectedNote] = useState(null);\n    const [isCreatingNote, setIsCreatingNote] = useState(false);\n"
)

# In CommunityView render block, pass them to CommunityPanel:
text = text.replace(
    'selectedProject={selectedProject} setSelectedProject={setSelectedProject} />',
    'selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedNote={selectedNote} setSelectedNote={setSelectedNote} isCreatingNote={isCreatingNote} setIsCreatingNote={setIsCreatingNote} />'
)

# And clear them when changing community:
text = text.replace(
    'onClick={() => { setSelected(c); setSelectedProject(null); }}',
    'onClick={() => { setSelected(c); setSelectedProject(null); setSelectedNote(null); setIsCreatingNote(false); }}'
)

# 2. In CommunityPanel props:
text = text.replace(
    'onClose, selectedProject, setSelectedProject }) => {',
    'onClose, selectedProject, setSelectedProject, selectedNote, setSelectedNote, isCreatingNote, setIsCreatingNote }) => {'
)

# Pass them to ProjectDetail:
text = text.replace(
    "onClose={() => { setSelectedProject(null); setProjectData(null); }} />;",
    "onClose={() => { setSelectedProject(null); setProjectData(null); }} selectedNote={selectedNote} setSelectedNote={setSelectedNote} isCreatingNote={isCreatingNote} setIsCreatingNote={setIsCreatingNote} />;"
)

# 3. In ProjectDetail props:
text = text.replace(
    'const ProjectDetail = ({ project, theme, onUpdate, onClose }) => {',
    'const ProjectDetail = ({ project, theme, onUpdate, onClose, selectedNote, setSelectedNote, isCreatingNote, setIsCreatingNote }) => {'
)

# Remove local states from ProjectDetail:
text = text.replace('const [selectedNote, setSelectedNote] = useState(null);\n', '')
text = text.replace('const [isCreatingNote, setIsCreatingNote] = useState(false);\n', '')

# Also we should clear note states when project is closed (meaning we go back):
# Wait, changing project or going back should clear note.
text = text.replace(
    'onClose={() => { setSelectedProject(null); setProjectData(null); }}',
    'onClose={() => { setSelectedProject(null); setProjectData(null); setSelectedNote(null); setIsCreatingNote(false); }}'
)

# 4. Hide the red box in ProjectDetail!
# In ProjectDetail:
# The header starts at: {/* Breadcrumb / header */}
# And the tabs: {/* Tabs */}
# They are both before ` {/* Tab content */}`
# I can just wrap them:
start_wrapper = "{!(selectedNote || isCreatingNote) && (\n            <>\n"
end_wrapper = "            </>\n            )}\n"

red_box_pattern = r"(<div className={`flex items-center justify-between px-4 md:px-8 py-4 border-b \$\{s\.divider\}`}.*?){\/\* Tab content \*\/}"
# Wait, parsing this with regex is tricky. Let's do exact replace. We can just use string replace for key areas.
breadcrumbs_old = "{/* Breadcrumb / header */}"
breadcrumbs_new = "{/* Breadcrumb / header */}\n            {!(selectedNote || isCreatingNote) && (\n            <>"
tabs_end = "                    </button>\n                ))}\n            </div>"
tabs_end_new = "                    </button>\n                ))}\n            </div>\n            </>)}"

text = text.replace(breadcrumbs_old, breadcrumbs_new)
text = text.replace(tabs_end, tabs_end_new)


# 5. Hide the Notes sidebar entirely in ProjectDetail.
# There is: ` {/* Notes sidebar */}` ... up to `{/* Note editor/viewer */}`
notes_sidebar_start = text.find("{/* Notes sidebar */}")
note_editor_start = text.find("{/* Note editor/viewer */}", notes_sidebar_start)
if notes_sidebar_start != -1 and note_editor_start != -1:
    text = text[:notes_sidebar_start] + text[note_editor_start:]

# Also, since the Notes sidebar is gone, the wrapper `<div className="flex-1 flex overflow-hidden">` might not need changes, it will just contain the note editor.
# WAIT! The original note editor had a condition:
# `className={`flex-1 flex flex-col overflow-hidden ${s.mainBg} ${!(selectedNote || isCreatingNote) ? 'hidden md:flex' : ''}`}`
# We can just leave that condition as is, it's just classes.


# 6. Global sidebar: inject notes into the Project button!
# Inside CommunityView:
# We have `{c.projects.map(p => (` and inside the button we do `onClick={() => setSelectedProject(p)}`
# And then we need to add the notes list right under it.

project_btn_replace = """
                                                            className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors hover:text-white ${selectedProject?.id === p.id ? 'text-white font-medium bg-white/5' : s.muted}` }>
                                                            <FolderOpen size={12} className={selectedProject?.id === p.id ? 'text-cyber-primary' : 'opacity-70'} />
                                                            <span className="truncate">{p.name}</span>
                                                        </button>
"""

new_project_inner = """
                                                            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors hover:text-white ${selectedProject?.id === p.id ? 'text-white font-medium bg-white/5' : s.muted}` }>
                                                            <FolderOpen size={13} className={selectedProject?.id === p.id ? 'text-cyber-primary' : 'opacity-70'} />
                                                            <span className="truncate">{p.name}</span>
                                                        </button>
                                                        {selectedProject?.id === p.id && (
                                                            <div className="mt-1 flex flex-col gap-0.5 relative before:absolute before:left-[7px] before:top-0 before:bottom-3 before:w-px before:bg-white/10">
                                                                {(p.shared_notes || []).map(note => (
                                                                    <button key={note.id} onClick={(e) => { e.stopPropagation(); setSelectedNote(note); setIsCreatingNote(false); setTimeout(() => document.querySelector('.tiptap-wrapper')?.scrollIntoView({behavior: 'smooth'}), 50); }}
                                                                        className={`w-full text-left flex items-center gap-2 pl-[22px] pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all group ${selectedNote?.id === note.id ? s.noteItemActive : s.noteItemDefault}`}>
                                                                        <FileText size={11} className={`flex-shrink-0 ${selectedNote?.id === note.id ? 'opacity-100' : 'opacity-50'}`} />
                                                                        <span className="truncate">{note.title}</span>
                                                                    </button>
                                                                ))}
                                                                <button onClick={(e) => { e.stopPropagation(); setSelectedNote(null); setIsCreatingNote(true); }}
                                                                    className={`w-full text-left flex items-center gap-2 pl-[22px] pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all group ${s.noteItemDefault}`}>
                                                                    <Plus size={11} className="flex-shrink-0 opacity-50 group-hover:opacity-100" />
                                                                    <span className="truncate opacity-75 group-hover:opacity-100">Nueva página</span>
                                                                </button>
                                                                
                                                                <button onClick={() => { setTab('tasks'); setSelectedNote(null); setIsCreatingNote(false); }}
                                                                    className={`w-full text-left flex items-center gap-2 pl-[22px] pr-2 py-1.5 rounded-md text-[11px] pt-3 font-medium transition-all group ${s.noteItemDefault}`}>
                                                                    <CheckSquare size={11} className="flex-shrink-0 opacity-50 group-hover:opacity-100" />
                                                                    <span className="truncate opacity-75 group-hover:opacity-100">Tareas del proyecto</span>
                                                                </button>
                                                            </div>
                                                        )}
"""
# Note: we also add a button to go back to TASKS! We probably need to lift `tab` and `setTab` OR we just use a small hack. Wait, `setTab` is inside `ProjectDetail`. The user might be trapped inside the Note if the tabs are hidden!
# If the tabs are hidden, clicking the Project button again or a "Tareas" button inside the sidebar would be amazing!
# But `setTab` is strictly inside `ProjectDetail`. If we click the Project title, does it reset the note?
# `onClick={() => setSelectedProject(p)}` from the global sidebar DOES NOT clear `selectedNote` currently. Let's make it clear `selectedNote`:
# Wait, changing `selectedProject` should clear `selectedNote`.

new_projects_tree = """
                                                        <button 
                                                            onClick={() => { setSelectedProject(p); setSelectedNote(null); setIsCreatingNote(false); }}
                                                            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors hover:text-white ${selectedProject?.id === p.id ? 'text-white font-medium bg-white/5' : s.muted}` }>
                                                            <FolderOpen size={13} className={selectedProject?.id === p.id ? 'text-cyber-primary' : 'opacity-70'} />
                                                            <span className="truncate">{p.name}</span>
                                                        </button>
                                                        {selectedProject?.id === p.id && (
                                                            <div className="mt-1.5 flex flex-col gap-0.5 relative before:absolute before:left-[10px] before:top-0 before:bottom-3 before:w-px before:bg-white/10">
                                                                <div className="pl-6 text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Páginas</div>
                                                                {(p.shared_notes || []).map(note => (
                                                                    <button key={note.id} onClick={(e) => { e.stopPropagation(); setSelectedNote(note); setIsCreatingNote(false); setTimeout(() => document.querySelector('.tiptap-wrapper')?.scrollIntoView({behavior: 'smooth'}), 50); }}
                                                                        className={`w-full text-left flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all group ${selectedNote?.id === note.id ? 'bg-cyber-primary text-black' : 'text-cyber-secondary/70 hover:bg-cyber-primary/10 hover:text-cyber-secondary'}`}>
                                                                        <FileText size={11} className={`flex-shrink-0 ${selectedNote?.id === note.id ? 'opacity-100' : 'opacity-60'}`} />
                                                                        <span className="truncate">{note.title}</span>
                                                                    </button>
                                                                ))}
                                                                <button onClick={(e) => { e.stopPropagation(); setSelectedNote(null); setIsCreatingNote(true); }}
                                                                    className={`w-full text-left flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-[11px] transition-all group text-cyber-secondary/50 hover:bg-cyber-primary/10 hover:text-cyber-secondary`}>
                                                                    <Plus size={11} className="flex-shrink-0 opacity-60 group-hover:opacity-100" />
                                                                    <span className="truncate opacity-80 group-hover:opacity-100">Nueva página</span>
                                                                </button>
                                                                
                                                                <div className="pl-6 text-[9px] font-bold uppercase tracking-widest opacity-40 mt-3 mb-1">Acciones</div>
                                                                <button onClick={(e) => { e.stopPropagation(); setSelectedNote(null); setIsCreatingNote(false); }}
                                                                    className={`w-full text-left flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-[11px] transition-all group text-cyber-secondary/60 hover:bg-cyber-primary/10 hover:text-cyber-secondary`}>
                                                                    <CheckSquare size={11} className="flex-shrink-0 opacity-60 group-hover:opacity-100" />
                                                                    <span className="truncate opacity-80 group-hover:opacity-100">Ver tareas / ajustes</span>
                                                                </button>
                                                            </div>
                                                        )}
"""

# Let's cleanly replace the mapping in CommunityView
start_map = "{c.projects.map(p => ("
end_map = "                                            </div>\n                                        )}\n                                    </div>"

if start_map in text:
    top_split = text.split(start_map)[0]
    btm_split = text.split(end_map)[1]
    
    new_map = """{c.projects.map(p => (
                                                    <div key={p.id} className="pl-4 border-l border-white/10 ml-5 py-0.5">
""" + new_projects_tree + """                                                    </div>
                                                ))}
"""
    text = top_split + new_map + btm_split

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)

print("Saved!")

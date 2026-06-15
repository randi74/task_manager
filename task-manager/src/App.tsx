import { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Plus,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  X,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import ActingAsDropdown from "./components/Dropdown";
import { UserContext } from "./contexts/userContext";

// --- INTERFACES ---
interface Task {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "PENDING" | "IN_PROGRESS" | "DONE";
  createdAt: string;
  updatedAt: string;
}

interface LogItem {
  id: number;
  task_id: number | null;
  actor_id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  from_status: string | null;
  to_status: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: {
    id: number;
    title: string;
    description: string;
    status: string;
  } | null;
  users: {
    id: number;
    username: string;
  };
}

export default function Dashboard() {
  // --- CONTEXT & USER ID DERIVATION ---
  const context = useContext(UserContext);
  const { role, users } = context;
  const targetUser = users.find((user) => user.username === role);
  const currentUserId = targetUser?.id;

  // --- NAVIGATION STATE (Solusi Satu File) ---
  const [view, setView] = useState<'tasks' | 'audit'>('tasks');

  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [createFormData, setCreateFormData] = useState({ title: "", description: "" });
  const [editFormData, setEditFormData] = useState({
    id: 0,
    title: "",
    description: "",
    status: "TODO" as Task["status"],
  });

  // --- GET API: FETCH ALL TASKS ---
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3100/api/task");
      if (response.data && response.data.data) {
        setTasks(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat daftar task:", error);
    }
  };

  // --- GET API: FETCH ALL LOGS ---
  const fetchLogs = async () => {
    setIsLogsLoading(true);
    try {
      const response = await axios.get('http://localhost:3100/api/logs');
      if (response.data && response.data.data) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error('Gagal memuat audit log:', error);
    } finally {
      setIsLogsLoading(false);
    }
  };

  // Muat task di awal load aplikasi
  useEffect(() => {
    fetchTasks();
  }, []);

  // Muat log otomatis setiap kali user masuk ke tampilan audit log
  useEffect(() => {
    if (view === 'audit') {
      fetchLogs();
    }
  }, [view]);

  // --- POST API: CREATE TASK ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      alert("Sesi user (ID) tidak ditemukan. Pastikan Anda sudah memilih role/user.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:3100/api/task/create", {
        user_id: currentUserId,
        title: createFormData.title,
        description: createFormData.description,
      });
      setCreateFormData({ title: "", description: "" });
      setIsCreateModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Gagal membuat task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PUT API: UPDATE TASK ---
  const openEditModal = (task: Task) => {
    setEditFormData({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setIsSubmitting(true);
    try {
      await axios.put(`http://localhost:3100/api/task/update/${editFormData.id}`, {
        user_id: currentUserId,
        title: editFormData.title,
        description: editFormData.description,
        status: editFormData.status,
      });
      setIsEditModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Gagal mengupdate task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE API: DELETE TASK ---
  const handleDeleteTask = async (taskId: number) => {
    if (!currentUserId) return;
    if (window.confirm("Apakah Anda yakin ingin menghapus task ini?")) {
      try {
        await axios.delete(`http://localhost:3100/api/task/delete/${taskId}`, {
          data: { user_id: currentUserId },
        });
        fetchTasks();
      } catch (error) {
        console.error("Gagal menghapus task:", error);
      }
    }
  };

  // --- HELPERS & COUNTERS ---
  const todoCount = tasks.filter((t) => t.status?.toUpperCase() === "TODO").length;
  const pendingCount = tasks.filter((t) => t.status?.toUpperCase() === "PENDING").length;
  const inProgressCount = tasks.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS").length;
  const doneCount = tasks.filter((t) => t.status?.toUpperCase() === "DONE").length;

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#110c1d] via-[#0d0914] to-[#07050a] text-white font-sans antialiased p-6 md:p-12 relative overflow-hidden">
      {/* Efek Glow Latar Belakang */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- HEADER NAVIGATION --- */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-16 relative z-10">
        {view === 'audit' ? (
          <button 
            onClick={() => setView('tasks')}
            className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-900/40 border border-gray-800/80 px-4 py-2 rounded-xl text-sm transition-all backdrop-blur-sm"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        ) : (
          <div /> // Spacer jika berada di halaman utama
        )}
        <ActingAsDropdown />
      </header>

      {/* ========================================================= */}
      {/* TAMPILAN 1: HALAMAN UTAMA (LIST TASKS)                     */}
      {/* ========================================================= */}
      {view === 'tasks' && (
        <main className="max-w-5xl mx-auto relative z-10 animate-fade-in">
          {/* Banner Audit Log */}
          <div 
            onClick={() => setView('audit')} // <--- LANGSUNG MODAL/VIEW SWAP KE AUDIT
            className="inline-flex items-center gap-2 bg-[#25193a]/30 border border-purple-500/20 text-purple-300 text-xs py-1 px-3 rounded-full mb-6 cursor-pointer hover:bg-purple-500/10 transition-all select-none"
          >
            <Sparkles size={12} className="text-purple-400" />
            <span>Every action is tracked.</span>
            <span className="font-semibold text-white flex items-center gap-0.5">
              See audit log <ArrowRight size={12} />
            </span>
          </div>

          {/* Grid Counter Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              <div className="h-22 rounded-2xl bg-[#130f1c]/80 border border-gray-800/60 p-4 flex flex-col items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-gray-300">{todoCount}</span>
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">To Do</span>
              </div>
              <div className="h-22 rounded-2xl bg-[#130f1c]/80 border border-gray-800/60 p-4 flex flex-col items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-amber-500">{pendingCount}</span>
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">Pending</span>
              </div>
              <div className="h-22 rounded-2xl bg-[#130f1c]/80 border border-gray-800/60 p-4 flex flex-col items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-cyan-400">{inProgressCount}</span>
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">In Progress</span>
              </div>
              <div className="h-22 rounded-2xl bg-[#130f1c]/80 border border-gray-800/60 p-4 flex flex-col items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-emerald-400">{doneCount}</span>
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">Done</span>
              </div>
            </div>
          </div>

          {/* New Task Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end items-stretch sm:items-center mb-8">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-purple-400 to-cyan-400 hover:from-purple-500 hover:to-cyan-500 text-black font-semibold text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 transition-all transform active:scale-[0.98]"
            >
              <Plus size={18} strokeWidth={2.5} />
              New task
            </button>
          </div>

          {/* List Of Tasks */}
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-[#110c1b]/20 border border-dashed border-gray-800 rounded-2xl text-gray-500 text-sm">
                No tasks found. Create a new task to get started!
              </div>
            ) : (
              tasks.map((task) => {
                const currentStatus = task.status?.toUpperCase();
                const isDone = currentStatus === "DONE";

                let statusIconColor = "text-gray-600 bg-gray-900/30";
                if (isDone) statusIconColor = "text-emerald-500 bg-emerald-950/30";
                if (currentStatus === "IN_PROGRESS") statusIconColor = "text-cyan-400 bg-cyan-950/30";
                if (currentStatus === "PENDING") statusIconColor = "text-amber-500 bg-amber-950/30";

                return (
                  <div key={task.id} className="bg-[#110c1b]/40 border border-gray-900/60 rounded-2xl p-5 flex items-start gap-4 hover:border-gray-800/80 transition-all backdrop-blur-sm group relative">
                    <div className="pt-0.5">
                      <CheckCircle2 className={`${statusIconColor} rounded-full`} size={22} />
                    </div>
                    <div className="flex-1 min-w-0 pr-20">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className={`text-base font-semibold tracking-wide ${isDone ? "text-gray-500 line-through decoration-gray-600 decoration-2" : "text-gray-200"}`}>
                          {task.title}
                        </h3>
                        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase border ${
                          currentStatus === "DONE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          currentStatus === "IN_PROGRESS" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                          currentStatus === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>{task.status}</span>
                      </div>
                      <p className={`text-sm mb-3 font-normal ${isDone ? "text-gray-500" : "text-gray-400"}`}>{task.description}</p>
                      <div className="text-xs text-gray-600 font-medium">
                        Updated {task.updatedAt ? new Date(task.updatedAt).toLocaleString("id-ID") : "Recent"}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="absolute right-5 top-5 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(task)} className="p-2 bg-gray-900/50 hover:bg-purple-500/20 border border-gray-800 rounded-xl text-gray-400 hover:text-purple-400 transition-all"><Pencil size={15} /></button>
                      <button onClick={() => handleDeleteTask(task.id)} className="p-2 bg-gray-900/50 hover:bg-red-500/20 border border-gray-800 rounded-xl text-gray-400 hover:text-red-400 transition-all"><Trash2 size={15} /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* TAMPILAN 2: HALAMAN AUDIT LOG                              */}
      {/* ========================================================= */}
      {view === 'audit' && (
        <main className="max-w-4xl mx-auto relative z-10 animate-fade-in">
          <div className="mb-10">
            <h1 className="text-5xl font-bold tracking-tight mb-3">
              Audit <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">log</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-xl font-normal leading-relaxed">
              A complete, chronological record of every task change — who did what, when, and what changed.
            </p>
          </div>

          <div className="relative border-l border-gray-800/80 ml-4 pl-8 space-y-6">
            {isLogsLoading ? (
              <div className="text-center py-12 text-gray-500 text-sm">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 bg-[#110c1b]/20 border border-dashed border-gray-800 rounded-2xl text-gray-500 text-sm">No logs recorded yet.</div>
            ) : (
              logs.map((log) => {
                let ActionIcon = Pencil;
                let iconWrapperColor = "border-cyan-500/30 bg-cyan-950/20 text-cyan-400";
                let actionText = "updated";

                if (log.action === 'CREATE') {
                  ActionIcon = Plus;
                  iconWrapperColor = "border-emerald-500/30 bg-emerald-950/20 text-emerald-400";
                  actionText = "created";
                } else if (log.action === 'DELETE') {
                  ActionIcon = Trash2;
                  iconWrapperColor = "border-red-500/30 bg-red-950/20 text-red-400";
                  actionText = "deleted";
                }

                const taskTitle = log.tasks ? `"${log.tasks.title}"` : "Deleted Task";

                return (
                  <div key={log.id} className="relative group">
                    <div className={`absolute -left-[45px] top-3 w-8 h-8 rounded-full border flex items-center justify-center backdrop-blur-md transition-all ${iconWrapperColor}`}>
                      <ActionIcon size={14} />
                    </div>

                    <div className="bg-[#110c1b]/40 border border-gray-900/60 rounded-2xl p-5 hover:border-gray-800/80 transition-all backdrop-blur-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {getInitials(log.users?.username)}
                          </div>
                          <p className="text-sm text-gray-400">
                            <span className="font-semibold text-gray-200">{log.users?.username || "Unknown User"}</span>
                            {` ${actionText} `}
                            <span className={`font-medium ${log.tasks ? 'text-gray-200' : 'text-red-400 italic'}`}>{taskTitle}</span>
                          </p>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{new Date(log.createdAt).toLocaleString('id-ID')}</span>
                      </div>

                      <div className="space-y-2 text-xs text-gray-400">
                        {log.action === 'UPDATE' && log.from_status && log.to_status && (
                          <div className="flex items-center gap-6 bg-[#0d0915]/60 border border-gray-900/50 rounded-xl px-4 py-2.5">
                            <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] w-14">Status</span>
                            <div className="flex items-center gap-2">
                              <span className="line-through text-gray-600 uppercase font-mono">{log.from_status.toLowerCase()}</span>
                              <ArrowRight size={12} className="text-gray-600" />
                              <span className="text-cyan-400 font-mono uppercase font-semibold">{log.to_status.toLowerCase()}</span>
                            </div>
                          </div>
                        )}

                        {log.action === 'CREATE' && log.tasks && (
                          <div className="bg-[#0d0915]/60 border border-gray-900/50 rounded-xl p-4 space-y-2.5">
                            <div className="flex items-center gap-6"><span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] w-14">Title</span><span className="text-gray-300 font-medium">{log.tasks.title}</span></div>
                            <div className="flex items-center gap-6"><span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] w-14">Status</span><span className="text-gray-300 font-mono uppercase">{log.tasks.status.toLowerCase()}</span></div>
                          </div>
                        )}

                        {!log.tasks && (
                          <div className="bg-red-950/10 border border-red-900/20 rounded-xl px-4 py-2.5 text-red-400/70 italic text-[11px]">
                            Data detail untuk task ini sudah tidak tersedia karena telah dihapus permanen (Deleted).
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* --- MODAL 1: CREATE TASK --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#130f22] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-5">Create New Task</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Task Title</label>
                <input type="text" required value={createFormData.title} onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })} placeholder="e.g., Config Project" className="w-full bg-[#0a0712] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Description</label>
                <textarea required rows={4} value={createFormData.description} onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })} placeholder="e.g., Make configuration project" className="w-full bg-[#0a0712] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2.5 text-gray-400 hover:bg-gray-900 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-400 to-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl disabled:opacity-50">{isSubmitting ? "Creating..." : "Create Task"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT TASK --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#130f22] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-5">Edit Task</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Task Title</label>
                <input type="text" required value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} className="w-full bg-[#0a0712] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Description</label>
                <textarea required rows={4} value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full bg-[#0a0712] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Status</label>
                <div className="relative">
                  <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Task["status"] })} className="w-full appearance-none bg-[#0a0712] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500">
                    <option value="TODO">TODO</option>
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2.5 text-gray-400 hover:bg-gray-900 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-400 to-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl disabled:opacity-50">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
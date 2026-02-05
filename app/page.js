"use client";

import { siteConfig } from "./siteConfig";
import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, CheckSquare, User, X, Plus, RotateCcw, Save, Edit2, FileSpreadsheet, Calendar, Upload, LayoutDashboard, Kanban as KanbanIcon, TrendingUp, BarChart3, Trash2, Lock as LockIcon, Unlock as UnlockIcon, Link as LinkIcon, PlayCircle, PauseCircle, LogOut } from 'lucide-react';


import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabaseClient';

// === COMPONENT: Login Page ===
const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#253256] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.jpg" alt="PSC Consulting" className="h-20 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">PSC - Time Monitoring</h1>
          <p className="text-slate-500 mt-2">Silakan login untuk mengakses Board</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="nama@psc.co.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2"
          >
            {loading ? 'Masuk...' : 'Masuk sekarang'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Belum punya akun? Hubungi Admin.
        </p>
      </div>
    </div>
  );
};

// === COMPONENT: Setup Profile Page (Nama Panggilan) ===
const ProfileSetupPage = ({ session }) => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return alert("Nama panggilan wajib diisi!");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (error) {
      alert("Gagal menyimpan profil: " + error.message);
    } else {
      window.location.reload(); // Reload untuk refresh session metadata
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#253256] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Satu Langkah Lagi!</h1>
          <p className="text-slate-500 mt-2">Siapa nama panggilan Anda? (Max 8 Huruf)</p>
          <p className="text-xs text-slate-400 mt-1">Ini akan jadi nama di kartu tugas Anda.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Panggilan</label>
            <input
              type="text"
              required
              maxLength={8}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
              placeholder="IKHSAN"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.toUpperCase())}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2"
          >
            {loading ? 'Menyimpan...' : 'Simpan & Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

// === FUNCTION HELPER: Format Durasi ===
const calculateDuration = (start, end) => {
  if (!start || !end) return "-";

  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime - startTime; // selisih dalam milidetik

  // Konversi ke jam dan menit
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);

  return `${diffHrs}j ${diffMins}m`;
};

// Helper Durasi untuk Excel (Format Decimal Hour untuk mudah dijumlah)
const calculateDurationDecimal = (start, end) => {
  if (!start || !end) return 0;
  const diffMs = new Date(end) - new Date(start);
  return parseFloat((diffMs / 3600000).toFixed(2)); // return jam dalam desimal, misal 1.5 jam
};

// === COMPONENT: Kartu Tugas ===
const TaskCard = ({ task, onMove, onEdit, onDelete, isAdmin, onRefresh, isSelected, onToggleSelect }) => {
  const [duration, setDuration] = useState(0); // Hitung durasi realtime
  useEffect(() => {
    let interval;
    const updateDuration = () => {
      if (task.status === 'IN_PROGRESS' && task.started_at && !task.is_paused) {
        const start = new Date(task.started_at).getTime();
        const now = new Date().getTime();
        const deducted = task.elapsed_pause_ms || 0;
        setDuration(Math.floor((now - start - deducted) / 1000));
      } else if (task.status === 'IN_PROGRESS' && task.is_paused && task.started_at) {
        // Jika PAUSED, durasi stuck di waktu pause
        const start = new Date(task.started_at).getTime();
        const pausedAt = new Date(task.paused_at).getTime();
        const deducted = task.elapsed_pause_ms || 0;
        setDuration(Math.floor((pausedAt - start - deducted) / 1000));
      } else if (task.status === 'DONE' && task.started_at && task.finished_at) {
        const start = new Date(task.started_at).getTime();
        const end = new Date(task.finished_at).getTime();
        const deducted = task.elapsed_pause_ms || 0;
        setDuration(Math.floor((end - start - deducted) / 1000));
      } else {
        setDuration(0); // Reset duration if not in progress or done
      }
    };

    updateDuration(); // Initial call
    if (task.status === 'IN_PROGRESS' && !task.is_paused) {
      interval = setInterval(updateDuration, 1000); // Update every second
    }
    return () => clearInterval(interval);
  }, [task]);

  const formatDuration = (seconds) => {
    if (seconds < 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}j ${m}m ${s}d`;
    if (m > 0) return `${m}m ${s}d`;
    return `${s}d`;
  };

  const handlePauseToggle = async () => {
    const now = new Date();
    if (task.is_paused) {
      // RESUME
      const pausedAt = new Date(task.paused_at);
      const pauseDuration = now.getTime() - pausedAt.getTime();
      const currentElapsed = task.elapsed_pause_ms || 0;

      const updates = {
        is_paused: false,
        paused_at: null,
        elapsed_pause_ms: currentElapsed + pauseDuration
      };

      await supabase.from('tasks').update(updates).eq('id', task.id);
      onRefresh(); // Trigger parent refresh
    } else {
      // PAUSE
      await supabase.from('tasks').update({
        is_paused: true,
        paused_at: now.toISOString()
      }).eq('id', task.id);
      onRefresh();
    }
  };

  const handleSubtaskToggle = async (subtaskIndex) => {
    const updatedSubtasks = [...(task.subtasks || [])];
    updatedSubtasks[subtaskIndex].done = !updatedSubtasks[subtaskIndex].done;

    const { error } = await supabase
      .from('tasks')
      .update({ subtasks: updatedSubtasks })
      .eq('id', task.id);

    if (!error) {
      onRefresh();
    }
  };

  const now = new Date();
  const isOverdue = task.due_date && new Date(task.due_date) < now && task.status !== 'DONE';

  return (
    <div
      draggable
      onDragStart={(e) => onMove(e, task.id)}
      className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Due Date Badge */}
      {task.due_date && (
        <div className={`absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
          <Calendar size={10} />
          {new Date(task.due_date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {/* CHECKBOX SELECTION (ADMIN ONLY) */}
      {isAdmin && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={(e) => onToggleSelect(task.id, e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
        </div>
      )}

      {/* Tombol Edit & Delete: Muncul saat hover (atau selalu ada di mobile) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="text-slate-300 hover:text-blue-600 p-1"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        {isAdmin && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-slate-300 hover:text-red-500 p-1"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Header Kartu: Prioritas & Inisial */}
      <div className={`flex justify-between items-start mb-2 pr-12 ${isAdmin ? 'pl-6' : ''}`}> {/* pr-12 agar tidak tertutup tombol edit/delete */}
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-100 text-red-600' :
          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
            'bg-gray-100 text-gray-500'
          }`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
          <User size={12} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">{task.assignee}</span>
        </div>
      </div>

      {/* Konten Utama */}
      <h3 className="font-semibold text-slate-800 text-sm mb-1">{task.title}</h3>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>

      {/* Attachments & External Links */}
      <div className="space-y-1 mb-3">
        {/* Supabase Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          task.attachments.map((file, idx) => (
            <a
              key={idx}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded w-fit max-w-full"
            >
              <FileSpreadsheet size={10} className="shrink-0" />
              <span className="truncate">{file.name}</span>
            </a>
          ))
        )}

        {/* External URL */}
        {task.externalUrl && (
          <a
            href={task.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded w-fit max-w-full"
          >
            <LinkIcon size={10} className="shrink-0" />
            <span className="truncate">Link Eksternal / GDrive</span>
          </a>
        )}
      </div>

      {/* SUBTASKS LIST (Visible on Card) */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="space-y-1 mb-3 pt-2 border-t border-slate-50">
          {task.subtasks.map((sub, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={sub.done}
                onChange={() => handleSubtaskToggle(idx)}
                className={`mt-0.5 w-3 h-3 rounded border-slate-300 cursor-pointer ${sub.done ? 'accent-emerald-500' : 'accent-slate-300'}`}
              />
              <span className={`${sub.done ? 'line-through text-slate-400' : ''}`}>{sub.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer: Informasi Waktu & Aksi */}
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">

        {/* Tampilan Durasi Jika Selesai */}
        {task.status === 'DONE' ? (
          <div className="text-xs text-[#279c5a] font-medium flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(duration)}
          </div>
        ) : task.status === 'IN_PROGRESS' ? (
          <div className="flex items-center gap-2">
            <div className={`text-xs font-medium flex items-center gap-1 ${task.is_paused ? 'text-amber-500' : 'text-blue-600'}`}>
              <Clock size={12} />
              {task.is_paused ? 'Paused: ' : 'Berjalan: '} {formatDuration(duration)}
            </div>

            {/* Tombol Pause/Resume (Admin Only) */}
            {isAdmin && (
              <button
                onClick={handlePauseToggle}
                className={`p-1 rounded-full ${task.is_paused ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                title={task.is_paused ? "Lanjutkan Task" : "Pause Task"}
              >
                {task.is_paused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Belum mulai
          </div>
        )}

        {/* Tombol Aksi Perpindahan */}
        <div className="flex gap-1">
          {/* Tombol Undo: Muncul jika bukan TODO */}
          {task.status === 'IN_PROGRESS' && isAdmin && (
            <button
              onClick={() => onMove(task.id, 'TODO')}
              title="Kembalikan ke Todo"
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
            >
              <RotateCcw size={14} />
            </button>
          )}
          {task.status === 'DONE' && isAdmin && (
            <button
              onClick={() => onMove(task.id, 'IN_PROGRESS')}
              title="Kembalikan ke In Progress"
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded mr-1"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {/* Tombol Maju */}
          {task.status === 'TODO' && (
            <button
              onClick={() => onMove(task.id, 'IN_PROGRESS')}
              className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium"
            >
              Start
            </button>
          )}
          {task.status === 'IN_PROGRESS' && (
            (() => {
              const subtasks = task.subtasks || [];
              const totalSub = subtasks.length;
              const doneSub = subtasks.filter(s => s.done).length;
              const allDone = totalSub === 0 || doneSub === totalSub;

              return (
                <button
                  onClick={() => {
                    if (allDone) onMove(task.id, 'DONE');
                    else alert("Harap selesaikan semua Sub-Task terlebih dahulu!");
                  }}
                  disabled={!allDone}
                  className={`text-xs text-white px-3 py-1 rounded font-medium flex items-center gap-1 transition-all ${allDone ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}
                  style={{ backgroundColor: allDone ? '#279c5a' : '#94a3b8' }}
                >
                  {allDone ? (
                    <><CheckCircle size={12} /> Selesai</>
                  ) : (
                    <><LockIcon size={10} /> {doneSub}/{totalSub}</>
                  )}
                </button>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

// === COMPONENT: Dashboard Stats ===
const DashboardStats = ({ tasks, month }) => {
  // 1. Hitung Summary
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'DONE').length;
  const progress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todo = tasks.filter(t => t.status === 'TODO').length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Total Jam Kerja
  const totalHours = tasks.reduce((acc, curr) => acc + calculateDurationDecimal(curr.started_at, curr.finished_at), 0).toFixed(1);

  // 2. Group by Priority
  const priorityCount = {
    High: tasks.filter(t => t.priority === 'High').length,
    Medium: tasks.filter(t => t.priority === 'Medium').length,
    Low: tasks.filter(t => t.priority === 'Low').length,
  };

  // 3. Group by Assignee
  const assigneeStats = Object.values(tasks.reduce((acc, curr) => {
    const name = curr.assignee || '?';
    if (!acc[name]) acc[name] = { name, total: 0, done: 0, hours: 0 };
    acc[name].total += 1;
    if (curr.status === 'DONE') {
      acc[name].done += 1;
      acc[name].hours += calculateDurationDecimal(curr.started_at, curr.finished_at);
    }
    return acc;
  }, {}));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Task</p>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><LayoutDashboard size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Selesai</p>
            <p className="text-2xl font-bold text-emerald-600">{done} <span className="text-sm text-slate-400 font-normal">/ {total}</span></p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><CheckCircle size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Productivity</p>
            <p className="text-2xl font-bold text-indigo-600">{completionRate}%</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><TrendingUp size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Jam Kerja</p>
            <p className="text-2xl font-bold text-orange-600">{totalHours}j</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><Clock size={20} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribusi Prioritas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-700">Distribusi Prioritas</h3>
          </div>
          <div className="space-y-4">
            {['High', 'Medium', 'Low'].map(prio => (
              <div key={prio}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">{prio}</span>
                  <span className="text-slate-400">{priorityCount[prio]} task</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${prio === 'High' ? 'bg-red-500' : prio === 'Medium' ? 'bg-yellow-500' : 'bg-slate-400'}`}
                    style={{ width: `${total ? (priorityCount[prio] / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Tim */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <User size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-700">Performa Tim ({month})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-2 rounded-l-lg">Nama</th>
                  <th className="px-4 py-2">Total Task</th>
                  <th className="px-4 py-2">Selesai</th>
                  <th className="px-4 py-2 rounded-r-lg">Jam Kerja</th>
                </tr>
              </thead>
              <tbody>
                {assigneeStats.length > 0 ? assigneeStats.map((stat, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-none">
                    <td className="px-4 py-3 font-bold">{stat.name}</td>
                    <td className="px-4 py-3">{stat.total}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{stat.done}</td>
                    <td className="px-4 py-3 text-orange-600">{stat.hours.toFixed(1)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center py-4 text-slate-400 italic">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// === COMPONENT UTAMA: Dashboard ===
export default function KanbanBoard() {
  // Helper untuk mendapatkan Bulan Tahun Saat Ini (YYYY-MM)
  const getCurrentMonthPeriod = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // State dummy default
  // State dummy default (REMOVED) - Initial state empty
  const [tasks, setTasks] = useState([]);
  const [session, setSession] = useState(null); // Auth Session

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State Search Judul
  const [viewMode, setViewMode] = useState('DASHBOARD'); // 'BOARD' or 'DASHBOARD'

  // State untuk Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'Medium',
    monthPeriod: new Date().toISOString().slice(0, 7),
    externalUrl: '',
    due_date: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // Loading state

  // ADMIN STATE
  const [isAdmin, setIsAdmin] = useState(false);

  const importFileRef = useRef(null); // Ref untuk input file hidden

  // === SUPABASE INTEGRATION ===

  // 1. Fetch Data Initial & Realtime
  // 1. Fetch Data Initial & Realtime
  useEffect(() => {
    // Cek Session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session Error:", error.message);
        if (error.message.includes('Refresh Token')) {
          supabase.auth.signOut(); // Force logout if token corrupted
        }
      }
      setSession(session);
      if (session) fetchTasks(); // Only fetch if logged in
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTasks();
    });

    // Setup Realtime Subscription
    const channel = supabase
      .channel('realtime_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('Realtime change:', payload);
        fetchTasks(); // Reload data on any change (simple strategy)
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Run once on mount

  const fetchTasks = async () => {
    // PROTEKSI: Cek session & role untuk filter data
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      console.error("Auth Error:", userError?.message);
      if (userError?.message?.includes('Refresh Token')) {
        await supabase.auth.signOut();
        window.location.reload();
      }
      return;
    }

    const userEmail = currentUser.email;
    const userName = currentUser.user_metadata?.full_name;

    // Check Admin Status (Hardcoded for simplicity in this function too to be safe)
    const adminEmails = ['ikhsan29@gmail.com', 'admin@psc.co.id', 'boss@psc.co.id'];
    const isUserAdmin = adminEmails.includes(userEmail);

    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    // FILTER LOGIC:
    // Jika BUKAN Admin, hanya ambil task milik sendiri
    if (!isUserAdmin) {
      if (userName) {
        query = query.eq('assignee', userName);
      } else {
        // Edge case: User baru belum punya nama tapi lolos guard?
        // Return empty to be safe
        setTasks([]);
        return;
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      // Map DB snake_case to Frontend camelCase
      const mappedData = (data || []).map(t => ({
        ...t,
        monthPeriod: t.month_period || t.monthPeriod, // Ensure fallback
        externalUrl: t.external_url || ''
      }));
      setTasks(mappedData);
    }
  };

  // Fungsi simpan manual (REMOVED - Auto save to cloud)
  const handleSave = () => {
    alert("✅ Data tersimpan otomatis di Cloud (Supabase)!");
  };

  // FILTER LOGIC
  // 1. Filter by Month
  const currentMonthTasks = tasks.filter(t => t.monthPeriod === selectedMonth);

  // 2. Filter by Assignee (based on Month data)
  const uniqueAssignees = [...new Set(currentMonthTasks.map(t => t.assignee))].filter(Boolean).sort();
  const filteredTasks = currentMonthTasks.filter(t => {
    const matchAssignee = selectedAssignee ? t.assignee === selectedAssignee : true;
    const matchSearch = searchQuery ? (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) : true;
    return matchAssignee && matchSearch;
  });

  // 3. Derived Lists for Board
  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const progressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter(t => t.status === 'DONE');

  // --- EXPORT TO EXCEL ---
  const handleExport = () => {
    // Export mengikuti filter yang sedang aktif
    const dataToExport = filteredTasks.map(task => ({
      ID: task.id,
      Periode: task.monthPeriod,
      Judul: task.title,
      Deskripsi: task.description,
      Assignee: task.assignee,
      Prioritas: task.priority,
      Status: task.status,
      Mulai: task.started_at ? new Date(task.started_at).toLocaleString() : '-',
      Selesai: task.finished_at ? new Date(task.finished_at).toLocaleString() : '-',
      Durasi_Jam: calculateDurationDecimal(task.started_at, task.finished_at), // Durasi angka decimal
      Durasi_Teks: calculateDuration(task.started_at, task.finished_at), // Durasi text readable
      Subtasks: (task.subtasks || []).map(s => `[${s.done ? 'x' : ' '}] ${s.title}`).join(' | ') // Format: [x] Title | [ ] Title
    }));

    // 2. Buat Worksheet & Workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Laporan ${selectedMonth}`);

    // 3. Download File
    XLSX.writeFile(wb, `Laporan_TimeMonitor_${selectedMonth}_${selectedAssignee || 'All'}.xlsx`);
  };

  // --- IMPORT FROM EXCEL ---
  const handleImportClick = () => {
    importFileRef.current.click();
  };

  // ... (Import Handlers) ...

  const handleImportFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        // Mapping Data Excel ke Format Task DB
        const newTasks = data.map((row) => ({
          title: row['Judul'] || row['Title'] || 'Tanpa Judul',
          description: row['Deskripsi'] || row['Description'] || '',
          assignee: row['Assignee'] || '?',
          priority: row['Prioritas'] || row['Priority'] || 'Medium',
          status: row['Status'] ? row['Status'].toUpperCase() : 'TODO',
          month_period: selectedMonth, // Note: DB column is month_period
          monthPeriod: selectedMonth, // Keep frontend compability
          // Parse Subtasks from string "[x] Title | [ ] Title"
          subtasks: (row['Subtasks'] || row['Subtask'] || '').split('|').filter(s => s.trim()).map(s => {
            const clean = s.trim();
            const isDone = clean.startsWith('[x]') || clean.startsWith('[v]') || clean.toLowerCase().startsWith('done');
            // Remove prefix like "[x] " or "done: "
            const title = clean.replace(/^\[.\]\s*/, '').replace(/^done:?\s*/i, '').trim();
            return { title, done: isDone };
          })
          // created_at auto
        }));

        if (confirm(`Ditemukan ${newTasks.length} task dari file. Upload ke database?`)) {
          // Bulk Insert to Supabase
          // Transform keys to snake_case for DB
          const dbPayload = newTasks.map(t => ({
            title: t.title,
            description: t.description,
            assignee: t.assignee,
            priority: t.priority,
            status: t.status,
            month_period: t.monthPeriod,
            subtasks: t.subtasks // Save subtasks
          }));

          const { error } = await supabase.from('tasks').insert(dbPayload);
          if (error) throw error;

          alert("✅ Import berhasil & tersimpan ke Cloud!");
          fetchTasks();
        }
      } catch (error) {
        console.error(error);
        alert("❌ Gagal import: " + error.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset input
  };


  // Fungsi memindahkan kartu & mencatat waktu otomatis (UPDATE)
  const moveTask = async (taskId, newStatus) => {
    // Cari task saat ini untuk validasi logika waktu
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const now = new Date().toISOString();
    let updates = { status: newStatus };

    // Logika Maju
    if (newStatus === 'IN_PROGRESS' && currentTask.status === 'TODO') {
      updates.started_at = now;
    } else if (newStatus === 'DONE') {
      updates.finished_at = now;
    }

    // Logika Mundur (Undo)
    if (newStatus === 'TODO') {
      updates.started_at = null;
      updates.finished_at = null;
      updates.is_paused = false;
      updates.paused_at = null;
      updates.elapsed_pause_ms = 0; // Reset history if back to Todo
    } else if (newStatus === 'IN_PROGRESS' && currentTask.status === 'DONE') {
      // Logic Reverse: Hitung selisih waktu saat Done s.d. Sekarang agar tidak dihitung sebagai waktu kerja
      const finishedAt = new Date(currentTask.finished_at).getTime();
      const nowMs = new Date().getTime();
      const timeInDoneState = nowMs - finishedAt;

      updates.finished_at = null;
      // Force Resume
      updates.is_paused = false;
      updates.paused_at = null;
      // Tambahkan durasi "Done" ke "Paused" agar timer melanjutkan dari posisi terakhir
      updates.elapsed_pause_ms = (currentTask.elapsed_pause_ms || 0) + timeInDoneState;
    }

    // Optimistic Update (Optional, but let's stick to simple await for safety first)
    // Direct Update to DB
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error("Gagal update status:", error);
      alert("Gagal update status task.");
    } else {
      fetchTasks(); // Force Refresh UI

      // NOTIFICATION TRIGGER (Telegram)
      // Only if User is NOT Admin AND Status is moving to IN_PROGRESS or DONE
      if (!isAdmin && (newStatus === 'IN_PROGRESS' || newStatus === 'DONE')) {
        const currentUserDisplay = session?.user?.user_metadata?.full_name || session?.user?.email;
        const statusText = newStatus === 'IN_PROGRESS' ? 'sedang dikerjakan (In Progress)' : 'telah selesai (Done)';
        const message = `🔔 <b>Update Task</b>\nUser: ${currentUserDisplay}\nTask: <b>${currentTask.title}</b>\nStatus: ${statusText}`;

        fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
      }
    }
  };

  // Logic Buka Modal Edit
  const handleEditClick = (task) => {
    setEditingId(task.id);
    setNewTask({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      monthPeriod: task.monthPeriod || task.month_period || selectedMonth, // Handle DB column name diff
      externalUrl: task.externalUrl || task.external_url || '',
      subtasks: task.subtasks || []
    });
    setAttachment(null);
    setIsModalOpen(true);
  };

  // Logic Buka Modal Baru
  const handleNewClick = () => {
    setEditingId(null); // Reset mode edit
    const currentUser = session?.user?.user_metadata?.full_name || '';
    setNewTask({
      title: '',
      description: '',
      assignee: currentUser, // Auto-fill Assignee
      priority: 'Medium',
      monthPeriod: selectedMonth,
      externalUrl: '',
      subtasks: []
    });
    setAttachment(null);
    setIsModalOpen(true);
  };

  const handleSaveTaskForm = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    setIsUploading(true);
    let uploadedAttachments = [];

    // 1. Handle File Upload if exists
    if (attachment) {
      const fileName = `${Date.now()}-${attachment.name.replace(/\s+/g, '-')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-files')
        .upload(fileName, attachment);

      if (uploadError) {
        alert("Gagal upload file: " + uploadError.message);
        setIsUploading(false);
        return;
      }

      // Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('task-files')
        .getPublicUrl(fileName);

      uploadedAttachments.push({
        name: attachment.name,
        url: publicUrlData.publicUrl,
        type: attachment.type
      });
    }

    try {
      // 2. Prepare Payload
      const payload = {
        title: newTask.title,
        description: newTask.description,
        assignee: newTask.assignee,
        priority: newTask.priority,
        month_period: newTask.monthPeriod,
        external_url: newTask.externalUrl || null,
        due_date: newTask.due_date || null,
        subtasks: newTask.subtasks || [] // Save subtasks
        // Status default handled by DB default or Logic below
      };

      if (uploadedAttachments.length > 0) {
        payload.attachments = uploadedAttachments;
      }

      let error = null;

      if (editingId) {
        // --- MODE EDIT (UPDATE) ---
        const { error: updateError } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', editingId);
        error = updateError;

      } else {
        // --- MODE BARU (INSERT) ---
        // Add default status
        payload.status = 'TODO';
        if (!payload.attachments) payload.attachments = []; // Init empty array

        const { error: insertError } = await supabase
          .from('tasks')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      // SUCCESS
      setNewTask({ title: '', description: '', assignee: '', priority: 'Medium', monthPeriod: selectedMonth, externalUrl: '', subtasks: [] });
      setAttachment(null);
      setIsModalOpen(false);
      setEditingId(null);
      fetchTasks(); // Force refresh data

    } catch (err) {
      console.error("Save Task Error:", err);
      // More friendly error message
      if (err.message && err.message.includes("external_url")) {
        alert("Gagal simpan: Kolom 'external_url' tidak ditemukan di database. Pastikan script SQL sudah dijalankan.");
      } else {
        alert("Gagal simpan: " + (err.message || 'Terjadi kesalahan saat menyimpan'));
      }
    } finally {
      setIsUploading(false); // ALWAYS Stop loading
    }
  };

  // Logic Hapus Task (DELETE)
  const handleDeleteTask = async (taskId) => {
    if (confirm("Yakin ingin menghapus task ini secara permanen?")) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) {
        alert("Gagal hapus task: " + error.message);
      } else {
        // Force Refresh UI
        fetchTasks();
      }
    }
  };

  // Auto-Set Admin based on Email (Hardcoded for simplicity)
  // Also determines visibility of Admin Toggle
  // Auto-Set Admin based on Email (Hardcoded for simplicity)
  // Also determines visibility of Admin Toggle
  const adminEmails = ['ikhsan29@gmail.com', 'admin@psc.co.id', 'boss@psc.co.id'];
  const isSystemAdmin = !!(session?.user?.email && adminEmails.includes(session.user.email));

  useEffect(() => {
    setIsAdmin(isSystemAdmin);
  }, [isSystemAdmin]);



  // Prevent hydration mismatch by rendering only after mount
  const [mounted, setMounted] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]); // State untuk Bulk Action
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // AUTH GUARD
  if (!session) {
    return <AuthPage />;
  }

  // PROFILE SETUP GUARD (Check if Name is set)
  if (session && !session.user?.user_metadata?.full_name) {
    return <ProfileSetupPage session={session} />;
  }

  const handleToggleSelect = (id, checked) => {
    if (checked) {
      setSelectedTaskIds(prev => [...prev, id]);
    } else {
      setSelectedTaskIds(prev => prev.filter(tid => tid !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-[25vh]"> {/* White space bawah 25% */}



      {/* Header */}
      <header className="text-white p-6 shadow-md" style={{ backgroundColor: siteConfig.headerColor }}>
        <div className="max-w-[95%] mx-auto flex justify-between items-center sm:flex-row flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              <img src={siteConfig.logoPath} alt={siteConfig.companyName} className="h-12 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide leading-none">{siteConfig.appName}</h1>
              <p className="text-[10px] text-white/50 font-medium mt-1">
                Logged as: {session?.user?.email}
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${isAdmin ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {isAdmin ? 'ADMIN' : 'STAFF'}
                </span>
              </p>
            </div>

            {/* LOGOUT BUTTON */}
            <button
              onClick={() => supabase.auth.signOut()}
              className="ml-2 p-1.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white/70 hover:text-white transition-all"
              title="Keluar / Logout"
            >
              <LogOut size={14} />
            </button>



            {/* BULK DELETE BUTTON (Only if items selected) */}
            {isAdmin && selectedTaskIds.length > 0 && (
              <div className="ml-4 border-l border-white/20 pl-4">
                <button
                  onClick={async () => {
                    if (confirm(`Yakin hapus ${selectedTaskIds.length} task terpilih?`)) {
                      const { error } = await supabase.from('tasks').delete().in('id', selectedTaskIds);
                      if (error) {
                        alert("Gagal hapus: " + error.message);
                      } else {
                        setSelectedTaskIds([]);
                        fetchTasks();
                      }
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                >
                  <Trash2 size={12} /> Hapus ({selectedTaskIds.length})
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-center items-center">

            {/* VIEW TOGGLE */}
            <div className="bg-white/10 p-1 rounded-lg flex gap-1 mr-2">
              <button
                onClick={() => setViewMode('BOARD')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'BOARD' ? 'bg-white text-slate-800 shadow-sm' : 'text-white/70 hover:bg-white/5'}`}
              >
                Board
              </button>
              <button
                onClick={() => setViewMode('DASHBOARD')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'DASHBOARD' ? 'bg-white text-slate-800 shadow-sm' : 'text-white/70 hover:bg-white/5'}`}
              >
                Dashboard
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative mr-2">
              <input
                type="text"
                placeholder="Cari Task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/20 w-[150px] transition-all"
              />
            </div>

            {/* SELECTOR BULAN */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded text-sm mr-2">
              <Calendar size={16} className="text-white/70" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none outline-none text-white font-medium cursor-pointer"
              />
            </div>

            {/* SELECTOR ASSIGNEE */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded text-sm mr-2">
              <User size={16} className="text-white/70" />
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="bg-transparent border-none outline-none text-white font-medium cursor-pointer max-w-[100px]"
              >
                <option value="" className="text-slate-800">Semua Tim</option>
                {uniqueAssignees.map(a => (
                  <option key={a} value={a} className="text-slate-800">{a}</option>
                ))}
              </select>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={importFileRef}
              onChange={handleImportFileUpload}
              style={{ display: 'none' }}
            />

            {isAdmin && (
              <>
                <button
                  onClick={handleExport}
                  className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 font-medium"
                >
                  <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleImportClick}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 font-medium"
                >
                  <Upload size={16} /> <span className="hidden sm:inline">Import</span>
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 font-medium"
            >
              <Save size={16} />
            </button>
            {isAdmin && (
              <button
                onClick={handleNewClick}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> <span className="hidden sm:inline">Task</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[95%] mx-auto mt-8 px-6">

        {viewMode === 'DASHBOARD' ? (
          <DashboardStats tasks={filteredTasks} month={selectedMonth} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <section>
              <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <h2 className="text-black font-bold text-lg">To Do ({todoTasks.length})</h2>
                </div>
                {isAdmin && todoTasks.length > 0 && (
                  <label className="flex items-center gap-1 cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                    <input
                      type="checkbox"
                      className="rounded accent-slate-500 cursor-pointer"
                      checked={todoTasks.every(t => selectedTaskIds.includes(t.id))}
                      onChange={(e) => {
                        const ids = todoTasks.map(t => t.id);
                        if (e.target.checked) {
                          setSelectedTaskIds(prev => [...new Set([...prev, ...ids])]);
                        } else {
                          setSelectedTaskIds(prev => prev.filter(p => !ids.includes(p)));
                        }
                      }}
                    /> Pilih Semua
                  </label>
                )}
              </div>
              <div className="bg-slate-100 p-3 rounded-xl min-h-[500px] border border-slate-200">
                {todoTasks.map(task =>
                  <TaskCard key={task.id} task={task} onMove={moveTask} onEdit={handleEditClick} onDelete={handleDeleteTask} isAdmin={isAdmin} onRefresh={fetchTasks}
                    isSelected={selectedTaskIds.includes(task.id)} onToggleSelect={handleToggleSelect}
                  />
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h2 className="text-black font-bold text-lg">In Progress ({progressTasks.length})</h2>
                </div>
                {isAdmin && progressTasks.length > 0 && (
                  <label className="flex items-center gap-1 cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                    <input
                      type="checkbox"
                      className="rounded accent-blue-600 cursor-pointer"
                      checked={progressTasks.every(t => selectedTaskIds.includes(t.id))}
                      onChange={(e) => {
                        const ids = progressTasks.map(t => t.id);
                        if (e.target.checked) {
                          setSelectedTaskIds(prev => [...new Set([...prev, ...ids])]);
                        } else {
                          setSelectedTaskIds(prev => prev.filter(p => !ids.includes(p)));
                        }
                      }}
                    /> Pilih Semua
                  </label>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-xl min-h-[500px] border border-blue-200">
                {progressTasks.map(task =>
                  <TaskCard key={task.id} task={task} onMove={moveTask} onEdit={handleEditClick} onDelete={handleDeleteTask} isAdmin={isAdmin} onRefresh={fetchTasks}
                    isSelected={selectedTaskIds.includes(task.id)} onToggleSelect={handleToggleSelect}
                  />
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#279c5a]"></div>
                  <h2 className="text-black font-bold text-lg">Done ({doneTasks.length})</h2>
                </div>
                {isAdmin && doneTasks.length > 0 && (
                  <label className="flex items-center gap-1 cursor-pointer text-xs text-emerald-600 hover:text-emerald-800">
                    <input
                      type="checkbox"
                      className="rounded accent-emerald-600 cursor-pointer"
                      checked={doneTasks.every(t => selectedTaskIds.includes(t.id))}
                      onChange={(e) => {
                        const ids = doneTasks.map(t => t.id);
                        if (e.target.checked) {
                          setSelectedTaskIds(prev => [...new Set([...prev, ...ids])]);
                        } else {
                          setSelectedTaskIds(prev => prev.filter(p => !ids.includes(p)));
                        }
                      }}
                    /> Pilih Semua
                  </label>
                )}
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl min-h-[500px] border border-emerald-200">
                {doneTasks.map(task =>
                  <TaskCard key={task.id} task={task} onMove={moveTask} onEdit={handleEditClick} onDelete={handleDeleteTask} isAdmin={isAdmin} onRefresh={fetchTasks}
                    isSelected={selectedTaskIds.includes(task.id)} onToggleSelect={handleToggleSelect}
                  />
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* MODAL ADD TASK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-700">
                {editingId ? 'Edit Task' : 'Tambah Task Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTaskForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Main Task</label>
                <input
                  autoFocus
                  type="text"
                  required
                  disabled={!isAdmin & !!editingId} // Disable if editing and not admin (Allow create for now? Or restricting creation too? User said "penambahan ... hanya bisa admin"). Assuming creation is already restricted by "Add Task" button visibility. But editing title should be restricted.
                  className={`w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-black ${!isAdmin && editingId ? 'bg-slate-100 text-slate-500' : ''}`}
                  placeholder="Contoh: Buat Laporan Harian"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              {/* SUBTASKS SECTION */}
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Sub-Task / Checklist</label>
                <div className="space-y-2">
                  {/* List Subtasks */}
                  {(newTask.subtasks || []).map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={sub.done}
                        onChange={(e) => {
                          const updated = [...(newTask.subtasks || [])];
                          updated[idx].done = e.target.checked;
                          setNewTask({ ...newTask, subtasks: updated });
                        }}
                        className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                      />
                      <input
                        type="text"
                        value={sub.title}
                        disabled={!isAdmin}
                        onChange={(e) => {
                          const updated = [...(newTask.subtasks || [])];
                          updated[idx].title = e.target.value;
                          setNewTask({ ...newTask, subtasks: updated });
                        }}
                        className={`flex-1 bg-transparent outline-none text-sm ${sub.done ? 'line-through text-slate-400' : 'text-slate-700'}`}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} // Prevent submit on edit enter
                      />
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newTask.subtasks.filter((_, i) => i !== idx);
                            setNewTask({ ...newTask, subtasks: updated });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add New Subtask Input */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 mt-2">
                      <Plus size={16} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tambah subtask... (Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault(); // Stop form submission!
                            e.stopPropagation();
                            const val = e.target.value;
                            if (val.trim()) {
                              setNewTask(prev => ({
                                ...prev,
                                subtasks: [...(prev.subtasks || []), { title: val, done: false }]
                              }));
                              e.target.value = '';
                            }
                          }
                        }}
                        className="flex-1 text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1 bg-transparent text-black"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1">Deskripsi / Notes</label>
                <textarea
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 text-black"
                  placeholder="Detail pekerjaan..."
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                ></textarea>
              </div>



              {/* ATTACHMENT INPUT */}
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Lampiran File (Opsional)</label>
                <input
                  type="file"
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={e => setAttachment(e.target.files[0])}
                />
                {attachment && <p className="text-xs text-green-600 mt-1">File terpilih: {attachment.name}</p>}
              </div>

              {/* SUBTASKS SECTION */}


              {/* EXTERNAL URL INPUT */}
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Link GDrive / Eksternal (Opsional)</label>
                <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-white">
                  <LinkIcon size={14} className="text-slate-400 mr-2" />
                  <input
                    type="url"
                    className="w-full text-sm outline-none text-black placeholder:text-slate-300"
                    placeholder="https://drive.google.com/..."
                    value={newTask.externalUrl}
                    onChange={e => setNewTask({ ...newTask, externalUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">Assignee (Penanggung Jawab)</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    disabled={!isAdmin} // Lock for non-admin
                    className={`w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-black uppercase ${!isAdmin ? 'bg-slate-100 text-slate-500' : ''}`}
                    placeholder="NAMA"
                    value={newTask.assignee}
                    onChange={e => setNewTask({ ...newTask, assignee: e.target.value.toUpperCase() })}
                  />
                  {!isAdmin && <p className="text-[10px] text-slate-400 mt-1">*Otomatis terisi sesuai nama Anda</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-slate-600"
                    value={newTask.due_date || ''}
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1">Prioritas</label>
                  <select
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white text-black"
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 flex justify-center items-center gap-2"
                  style={{ backgroundColor: '#253256' }}
                  disabled={isUploading}
                >
                  {isUploading ? 'Mengupload...' : (editingId ? 'Simpan Perubahan' : 'Buat Task')}
                </button>
              </div>
            </form>
          </div>
        </div >
      )
      }

    </div >
  );
}

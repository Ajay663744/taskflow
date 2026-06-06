import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { tasksAPI } from '../utils/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-circle" />
    <div className="skeleton-body">
      <div className="skeleton-line w-60" />
      <div className="skeleton-line w-80" />
      <div className="skeleton-line w-40" />
    </div>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  // Task state
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tasksAPI.getAll({
        page: currentPage,
        limit: 5,
        status: statusFilter,
        search: debouncedSearch,
      });
      const { tasks: fetchedTasks, pagination: pag, stats: taskStats } = res.data.data;
      setTasks(fetchedTasks);
      setPagination(pag);
      setStats(taskStats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // CRUD operations
  const handleCreateTask = async (data) => {
    try {
      setModalLoading(true);
      await tasksAPI.create(data);
      setModalOpen(false);
      setEditingTask(null);
      toast.success('Task created successfully');
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateTask = async (data) => {
    if (!editingTask) return;
    try {
      setModalLoading(true);
      await tasksAPI.update(editingTask._id, data);
      setModalOpen(false);
      setEditingTask(null);
      toast.success('Task updated successfully');
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      setActionLoading(true);
      const res = await tasksAPI.toggle(id);
      const newStatus = res.data.data.task.status;
      toast.success(
        newStatus === 'completed' ? 'Task completed! 🎉' : 'Task moved to pending'
      );
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setActionLoading(true);
      await tasksAPI.delete(id);
      toast.success('Task deleted');
      if (tasks.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchTasks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTask = (task) => { setEditingTask(task); setModalOpen(true); };
  const handleOpenCreate = () => { setEditingTask(null); setModalOpen(true); };
  const handleCloseModal = () => { setModalOpen(false); setEditingTask(null); };

  const handleLogout = () => { logout(); };

  const progressPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Today's date
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const filters = [
    { key: 'all', label: 'All Tasks', iconClass: 'all', icon: '◇' },
    { key: 'pending', label: 'Pending', iconClass: 'pending', icon: '◔' },
    { key: 'completed', label: 'Completed', iconClass: 'completed', icon: '✓' },
  ];

  return (
    <div className="dashboard-layout" id="dashboard">
      {/* ───── SIDEBAR ───── */}
      <aside className="sidebar glass-panel" id="sidebar">
        {/* User greeting */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{getInitials(user?.name)}</div>
          <div className="sidebar-user-info">
            <p>Welcome back</p>
            <h2>{user?.name || 'User'}</h2>
          </div>
        </div>

        {/* Progress */}
        <div className="sidebar-progress">
          <div className="sidebar-progress-header">
            <span>Total Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="sidebar-stats">
          <div className="stat-box">
            <h3 className="stat-pending">{stats.pending}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-box">
            <h3 className="stat-completed">{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>

        {/* Filters */}
        <p className="sidebar-filters-label">Filters</p>
        <div className="sidebar-filters" id="filter-group">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`filter-btn ${statusFilter === f.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.key)}
              id={`filter-${f.key}`}
            >
              <span className={`filter-icon ${f.iconClass}`}>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button className="sidebar-logout" onClick={handleLogout} id="btn-logout" aria-label="Logout">
          <span>⏻</span>
          <span>Log Out</span>
        </button>
      </aside>

      {/* ───── MAIN PANEL ───── */}
      <main className="main-panel glass-panel" id="main-panel">
        {/* Header */}
        <header className="main-header">
          <div className="main-header-left">
            <h1>Your Tasks</h1>
            <p>{todayDate}</p>
          </div>
          <div className="main-header-right">
            <div className="search-wrapper">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-input"
                aria-label="Search tasks"
              />
            </div>
            <button className="btn-new-task btn-gradient" onClick={handleOpenCreate} id="btn-add-task">
              <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>+</span>
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="alert-error" style={{ margin: '1rem 1.5rem 0', display: 'flex', alignItems: 'center' }}>
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: '#f87171', cursor: 'pointer', fontSize: '1rem', padding: '0 4px',
              }}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Task List / Skeleton / Empty */}
        <div className="task-scroll">
          {loading ? (
            <div className="skeleton-list">
              {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : tasks.length > 0 ? (
            <div className="task-list" id="task-list">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state" id="empty-state">
              <div className="empty-icon-wrap">
                {debouncedSearch ? '🔍' : statusFilter !== 'all' ? '📭' : '✨'}
              </div>
              <h3>
                {debouncedSearch
                  ? 'No tasks found'
                  : statusFilter !== 'all'
                  ? `No ${statusFilter} tasks`
                  : 'No tasks yet'}
              </h3>
              <p>
                {debouncedSearch
                  ? `No tasks matching "${debouncedSearch}"`
                  : statusFilter !== 'all'
                  ? `You don't have any ${statusFilter} tasks`
                  : 'Your universe is clear. Create a new task to get started.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="pagination" id="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage}
              id="btn-prev-page"
            >
              ← Prev
            </button>
            <span className="pagination-info">
              Page <span>{pagination.currentPage}</span> of <span>{pagination.totalPages}</span>
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              id="btn-next-page"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        loading={modalLoading}
      />
    </div>
  );
};

export default Dashboard;

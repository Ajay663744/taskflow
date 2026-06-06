import { useState, useEffect, useRef } from 'react';

const TaskModal = ({ isOpen, onClose, onSubmit, task, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);
  const overlayRef = useRef(null);

  const isEditing = !!task;

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
      } else {
        setTitle('');
        setDescription('');
      }
      setErrors({});
      setTimeout(() => titleRef.current?.focus(), 150);
    }
  }, [isOpen, task]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Task title is required';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    if (description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || loading) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      id="task-modal-overlay"
    >
      <div className="modal-card glass-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            id="btn-modal-close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title-input">Task Title</label>
            <input
              ref={titleRef}
              id="task-title-input"
              type="text"
              className={`glass-input ${errors.title ? 'input-error' : ''}`}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              maxLength={100}
              style={{ fontSize: '1.05rem' }}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc-input">
              Description <span style={{ opacity: 0.4, textTransform: 'none', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              id="task-desc-input"
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              placeholder="Add some details..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              maxLength={500}
              rows={3}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
              id="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save btn-gradient"
              disabled={loading}
              id="btn-modal-submit"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" />
                  {isEditing ? 'Saving...' : 'Saving...'}
                </span>
              ) : (
                'Save Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

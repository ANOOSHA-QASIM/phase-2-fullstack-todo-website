import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface TodoItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string, description?: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({
  id,
  title,
  description,
  completed,
  onToggle,
  onEdit,
  onDelete
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description || '');

  const handleSave = () => {
    onEdit(id, editTitle, editDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditDescription(description || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="antigravity-card p-4 mb-3 bg-white rounded-md hover:bg-[rgb(var(--muted))] transition-colors group"
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[rgb(var(--input))] text-[rgb(var(--foreground))] rounded-md border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 bg-[rgb(var(--input))] text-[rgb(var(--foreground))] rounded-md border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent"
            rows={2}
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => onToggle(id)}
            className="mt-1 h-4 w-4 text-[rgb(var(--primary))] rounded cursor-pointer border-[rgb(var(--border))] bg-white focus:ring-[rgb(var(--primary))] focus:ring-offset-2"
          />
          <div className="ml-3 flex-1 min-w-0">
            <h3 className={`text-base font-medium transition-all ${
              completed
                ? 'line-through text-[rgb(var(--muted-foreground))]'
                : 'text-[rgb(var(--foreground))]'
            }`}>
              {title}
            </h3>
            {description && (
              <p className={`text-sm mt-1 transition-all ${
                completed
                  ? 'line-through text-[rgb(var(--muted-foreground))/0.7]'
                  : 'text-[rgb(var(--muted-foreground))]'
              }`}>
                {description}
              </p>
            )}
          </div>
          <div className="flex space-x-2 ml-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(id)}
              className="text-[rgb(var(--destructive))] hover:text-[rgb(var(--destructive)/0.8)]"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
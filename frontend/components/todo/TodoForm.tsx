import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface TodoFormProps {
  onSubmit: (title: string, description?: string, priority?: 'low' | 'medium' | 'high', dueDate?: string) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialPriority?: 'low' | 'medium' | 'high';
  initialDueDate?: string;
}

export default function TodoForm({
  onSubmit,
  onCancel,
  submitButtonText = 'Add Todo',
  initialTitle = '',
  initialDescription = '',
  initialPriority = 'medium',
  initialDueDate = ''
}: TodoFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState(initialPriority);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return;
    }

    onSubmit(title, description, priority, dueDate);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="antigravity-card p-6 mb-6">
      {error && (
        <div className="mb-3 p-2 bg-[rgb(var(--destructive)/0.1)] text-[rgb(var(--destructive))] rounded text-sm border border-[rgb(var(--destructive)/0.2)]">
          {error}
        </div>
      )}

      <Input
        label="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        fullWidth
        required
        maxLength={200}
      />

      <Input
        label="Description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Additional details (optional)"
        fullWidth
        maxLength={1000}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3 py-2 bg-[rgb(var(--input))] text-[rgb(var(--foreground))] rounded-md border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <Input
          label="Due Date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          fullWidth
        />
      </div>

      <div className="flex space-x-2 mt-3">
        <Button type="submit" variant="primary">
          {submitButtonText}
        </Button>

        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
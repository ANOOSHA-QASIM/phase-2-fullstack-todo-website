import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface TodoFormProps {
  onSubmit: (title: string, description?: string) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  initialTitle?: string;
  initialDescription?: string;
}

export default function TodoForm({
  onSubmit,
  onCancel,
  submitButtonText = 'Add Todo',
  initialTitle = '',
  initialDescription = ''
}: TodoFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
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

    onSubmit(title, description);
    setTitle('');
    setDescription('');
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
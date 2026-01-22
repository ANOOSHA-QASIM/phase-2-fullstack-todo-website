import { motion, AnimatePresence } from 'framer-motion';
import TodoItem from './TodoItem';
import { Todo } from '@/types/todo';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string, description?: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({
  todos,
  onToggle,
  onEdit,
  onDelete
}: TodoListProps) {
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            title={todo.title}
            description={todo.description}
            completed={todo.completed}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>

      {todos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-[rgb(var(--muted-foreground))]"
        >
          No todos yet. Add one to get started!
        </motion.div>
      )}
    </div>
  );
}
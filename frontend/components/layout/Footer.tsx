export default function Footer() {
  return (
    <footer className="bg-white border-t border-[rgb(var(--border))] py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Manage your tasks without the mess.
          </p>
          <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))/0.7]">
            &copy; {new Date().getFullYear()} Todo App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
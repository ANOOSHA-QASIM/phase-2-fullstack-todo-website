export default function Footer() {
  return (
    <footer className="bg-[rgb(var(--background))] border-t border-[rgb(var(--border))] py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            © {new Date().getFullYear()} TalkTodo. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-[rgb(var(--muted-foreground))/0.7]">
            <a href="#" className="hover:text-[rgb(var(--primary))] transition-colors">About</a>
            <a href="#" className="hover:text-[rgb(var(--primary))] transition-colors">Terms</a>
            <a href="#" className="hover:text-[rgb(var(--primary))] transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
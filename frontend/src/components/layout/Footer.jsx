export default function Footer() {
  return (
    <footer className="bg-[#0a192f] border-t border-teal-500/20 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">© 2025 TidalTrees. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">Twitter</a>
          <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">Facebook</a>
          <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
}

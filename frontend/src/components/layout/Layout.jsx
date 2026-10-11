import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

export default function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-[#0a192f] to-[#022c43]">
      <Navbar />
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${user ? 'pt-20' : ''}`}>
        {children}
      </main>
      {user && <Footer />}
    </div>
  );
}

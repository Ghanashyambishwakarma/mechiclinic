import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => (
  <>
    <SEO title="Page Not Found" />
    <div className="min-h-screen flex items-center justify-center gradient-bg-soft p-6">
      <div className="glass-strong max-w-md w-full p-8 text-center">
        <div className="font-display text-8xl font-bold text-clinic-teal mb-4">404</div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  </>
);

export default NotFound;

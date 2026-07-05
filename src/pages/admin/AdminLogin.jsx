import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';
import Logo from '../../components/Logo';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, accessDenied, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (user && isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to Mechi Clinic Admin Panel');
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Admin Login" />
      <div className="min-h-screen flex items-center justify-center gradient-bg p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong max-w-md w-full p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <Logo size="lg" light />
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Sign in with your authorized Google account to access the Mechi Clinic dashboard.
          </p>

          {accessDenied && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-left"
            >
              <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400">Access Denied</p>
                <p className="text-sm text-red-500/80">You are not authorized to access this panel.</p>
              </div>
            </motion.div>
          )}

          <Button onClick={handleLogin} loading={loading} className="w-full">
            Sign in with Google
          </Button>

          <p className="mt-6 text-xs text-slate-500">
            Only authorized administrators can access this panel.
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;

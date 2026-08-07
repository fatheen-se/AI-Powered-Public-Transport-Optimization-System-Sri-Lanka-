import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { authApi } from '../../api/auth';
import { setAuth } from '../../store/authSlice';
import { ThemeToggle } from '../atoms/ThemeToggle';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email, password });
      
      dispatch(setAuth({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
      }));

      if (response.user.role === 'Admin' || response.user.role === 'Authority') {
        navigate('/authority/dashboard');
      } else if (response.user.role === 'Driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div style={{position: 'absolute', top: 20, right: 20}}>
        <ThemeToggle />
      </div>
      <motion.div 
        className={`${styles.loginBox} glass-panel`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h2>Welcome Back</h2>
          <p>Sign in to your OptiTransit account.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <Input 
            label="Email Address" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@optitransit.lk"
          />
          <Input 
            label="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          
          {error && <div className={styles.errorBanner}>{error}</div>}
          
          <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>
            Sign In
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

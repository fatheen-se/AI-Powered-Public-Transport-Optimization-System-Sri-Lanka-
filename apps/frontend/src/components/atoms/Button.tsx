import React from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className,
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${styles.btn} ${styles[variant]} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...(props as any)}
    >
      {isLoading ? <span className={styles.loader}></span> : children}
    </motion.button>
  );
};

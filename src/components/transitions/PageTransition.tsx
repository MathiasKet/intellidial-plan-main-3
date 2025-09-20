import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, x: -200, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -100 },
};

type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ ease: 'easeInOut', duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

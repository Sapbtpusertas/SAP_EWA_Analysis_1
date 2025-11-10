
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => {
  return (
    <section className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-ewa-purple">{title}</h2>
      {children}
    </section>
  );
};

export default Section;

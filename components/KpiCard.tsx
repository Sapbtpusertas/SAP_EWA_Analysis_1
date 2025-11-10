
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  icon?: string;
  valueColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, valueColor = 'text-text-dark' }) => {
  return (
    <div className="bg-bg-card rounded-xl p-6 text-center shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <div className="text-base font-medium text-text-light mb-2">{title}</div>
      <div className={`text-4xl font-bold leading-tight ${valueColor}`}>
        {value} {icon && <span className="text-2xl ml-2">{icon}</span>}
      </div>
    </div>
  );
};

export default KpiCard;

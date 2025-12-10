import React from 'react';

const StatsCard = ({ title, value, icon, description, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="p-3 rounded-full bg-blue-50">
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        
        {trend && (
          <div className={`mt-2 flex items-center text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend.direction === 'up' && <span className="mr-1">↑</span>}
            {trend.direction === 'down' && <span className="mr-1">↓</span>}
            <span>{trend.value}% {trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
import React from "react";
import { StatsCardProps } from "../types";

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, title, value, description, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-6 text-white bg-gradient-to-br ${gradient}`}>
    <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
      <Icon className="w-full h-full" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
      </div>
      <p className="text-xs sm:text-sm opacity-80 font-medium">{title}</p>
      <p className="text-xl sm:text-3xl font-bold mt-1 mb-1 sm:mb-2">{value}</p>
      <p className="text-xs opacity-70">{description}</p>
    </div>
  </div>
);

export default StatsCard;
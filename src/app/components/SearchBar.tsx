import React, { useState } from "react";
import { Search } from "lucide-react";
import { SearchBarProps } from "../types";

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder }) => {
  const [query, setQuery] = useState("");
  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">내 차 찾기</h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white font-semibold text-gray-800 placeholder-gray-500 text-sm sm:text-base"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl text-sm sm:text-base"
        >
          검색
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
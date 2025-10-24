// components/SearchAndFilters.jsx
import React from "react";
import { Search, Filter, CheckCircle, X } from "lucide-react";

const SearchAndFilters = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  return (
    <div className=" backdrop-blur-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Clean Structured Search Bar */}
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200 group-focus-within:text-blue-500"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Гишүүн эсвэл тэмдэглэлээр хайх..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
            aria-label="Search schedules"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Structured Filters Row */}
        <div className="flex flex-wrap gap-3">
          {/* Type Filter */}
          <div className="relative group">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200 group-focus-within:text-blue-500 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={filters.type}
              onChange={(e) =>
                onFiltersChange({ ...filters, type: e.target.value })
              }
              className="pl-9 pr-4 py-3.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 text-sm font-medium"
              aria-label="Filter by type"
            >
              <option value="all">Төрлүүд</option>
              <option value="workout">Дасгалууд</option>
              <option value="meeting">Уулзалт</option>
              <option value="measurement">Хэмжилт</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative group">
            <CheckCircle
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200 group-focus-within:text-blue-500 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                onFiltersChange({ ...filters, status: e.target.value })
              }
              className="pl-8 pr-4 py-3.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 text-sm font-medium"
              aria-label="Filter by status"
            >
              <option value="all">Бүх статус</option>
              <option value="pending">Хүлээгбэж буй</option>
              <option value="completed">Дууссан</option>
            </select>
          </div>

          {/* Clear Button */}
          <button
            type="button"
            onClick={onClearFilters}
            className="flex bg-white items-center gap-3 px-3 py-3.5 rounded-md border border-gray-300 hover:border-gray-400 hover:bg-red-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm font-medium text-gray-700"
            aria-label="Clear"
          >
            <X className="w-4 h-4" />
            Цэвэрлэх
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;

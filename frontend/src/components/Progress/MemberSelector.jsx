// MemberSelector.jsx
import React from "react";
import { Users, Search } from "lucide-react";

const MemberSelector = ({
  searchTerm,
  setSearchTerm,
  showDropdown,
  setShowDropdown,
  filteredMembers,
  handleSelectMember,
  handleBrowseAll,
  searchRef,
}) => {
  return (
    <div className="relative z-50 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md mb-6 border border-white/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
          <Users size={20} />
          <span>Select Member</span>
        </h2>
        <button
          className="flex items-center py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition-all"
          onClick={handleBrowseAll}
        >
          <Users size={16} className="mr-2" />
          <span>Browse All</span>
        </button>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        Choose a member to track their progress
      </p>
      <div ref={searchRef} className="relative mb-4">
        <input
          type="text"
          placeholder="Search members by name, email, or specialization..."
          className="w-full pl-4 pr-12 py-3 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
        />
        <Search
          size={18}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        {showDropdown && filteredMembers.length > 0 && (
          <ul className="absolute z-[100] w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-96 overflow-auto shadow-xl">
            {filteredMembers.map((member) => (
              <li
                key={member._id}
                className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-3 transition-colors"
                onClick={() => handleSelectMember(member)}
              >
                {member.profileImage ? (
                  <img
                    src={member.profileImage}
                    alt={`${member.username}'s profile`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users size={16} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{`${member.username} ${member.surname}`}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {showDropdown && searchTerm && filteredMembers.length === 0 && (
          <div className="absolute z-[100] w-full bg-white border border-gray-200 rounded-lg mt-1 p-4 text-gray-500 text-sm shadow-xl">
            No members found.
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberSelector;

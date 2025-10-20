// MemberProfile.jsx
import React from "react";
import { Users, Mail, MapPin } from "lucide-react";

const MemberProfile = ({ selectedMember, isMembershipActive }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-shrink-0 relative">
          {selectedMember.profileImage ? (
            <img
              src={selectedMember.profileImage}
              alt={`${selectedMember.username} ${selectedMember.surname}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
              <Users size={40} className="text-gray-500" />
            </div>
          )}
          {!selectedMember.profileImage && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-full">
              <Mail size={16} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-gray-800">
            {selectedMember.username} {selectedMember.surname}
          </h3>
          <p className="text-gray-600 flex items-center justify-center md:justify-start space-x-1">
            <Mail size={16} className="text-gray-400" />
            <span>{selectedMember.email}</span>
          </p>
          {selectedMember.phone && (
            <p className="text-sm text-gray-500 mt-1">
              Phone: {selectedMember.phone}
            </p>
          )}
        </div>
      </div>

      {/* Stats Block under Image */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {selectedMember.age && (
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Age
              </div>
              <div className="text-lg font-bold text-gray-900">
                {selectedMember.age}
              </div>
            </div>
          )}
          {selectedMember.gender && (
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Gender
              </div>
              <div className="text-lg font-bold text-gray-900 capitalize">
                {selectedMember.gender}
              </div>
            </div>
          )}
          {selectedMember.address && (
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Address
              </div>
              <div className="text-sm font-bold text-gray-900 break-words">
                {selectedMember.address}
              </div>
            </div>
          )}
          {selectedMember.membership?.startDate && (
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Started At
              </div>
              <div className="text-lg font-bold text-gray-900">
                {new Date(
                  selectedMember.membership.startDate
                ).toLocaleDateString()}
              </div>
            </div>
          )}
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Membership
            </div>
            <div
              className={`text-lg font-bold ${
                isMembershipActive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isMembershipActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;

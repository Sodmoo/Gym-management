// components/Trainer/chat/ChatList.jsx (Fixed: Single "All Chats" section, search filters all, use room.updated for last updated time)
import React, { useState } from "react";
import { Search, MessageCircle } from "lucide-react";

const ChatList = ({ rooms, onSelectRoom, selectedRoomId, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  // Deduplicate rooms by _id and keep first occurrence (preserve order)
  const dedupedRooms = (() => {
    const seen = new Set();
    const list = [];
    for (const r of rooms || []) {
      const id = r?._id ?? r?.id ?? "";
      if (!id) continue;
      if (!seen.has(String(id))) {
        seen.add(String(id));
        list.push(r);
      }
    }
    return list;
  })();

  // Sort by updated (fallback to last message timestamp)
  dedupedRooms.sort((a, b) => {
    const aTs = new Date(
      a?.updated || a?.lastMessage?.createdAt || 0
    ).getTime();
    const bTs = new Date(
      b?.updated || b?.lastMessage?.createdAt || 0
    ).getTime();
    return bTs - aTs;
  });

  // Filter rooms by search (use deduped & sorted list)
  const q = (searchQuery && String(searchQuery).toLowerCase()) || "";
  const filteredRooms = dedupedRooms.filter((r) => {
    // safe fields to search: name, memberName, lastMessagePreview
    const name = (r?.name || r?.memberName || r?.lastMessagePreview || "")
      .toString()
      .toLowerCase();
    return name.includes(q);
  });

  const timeAgo = (iso) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const days = Math.floor(hr / 24);
    if (days === 1) return "Yesterday";
    return new Date(iso).toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 text-gray-900 pr-4 py-2 border border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-100 bg-blue-100"
          />
        </div>
      </div>

      {/* All Chats Label */}
      <div className="px-5 py-4 border-b border-gray-200 bg-white sticky top-16 z-10 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          All Chats ({rooms.length})
        </span>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No chats found</p>
            <p className="text-sm">Try a different search.</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room._id}
              className={`room-item p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors ${
                selectedRoomId === room._id
                  ? "bg-purple-50 border-l-4 border-purple-500"
                  : ""
              }`}
              onClick={() => onSelectRoom(room)}
            >
              <img
                src={room.avatar}
                alt={room.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 truncate">
                    {room.name}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0 whitespace-nowrap">
                    {timeAgo(room.updated || room.lastMessage?.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {room.lastMessagePreview}
                </p>
                {room.unreadCount > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {room.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;

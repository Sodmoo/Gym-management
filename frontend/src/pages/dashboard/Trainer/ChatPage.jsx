// TrainerChatPage.jsx (Fixed: Always sort by originalIndex in enhancedRooms for stable order)
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useDeepCompareEffect } from "react-use";
import { useUserStore } from "../../../store/userStore";
import { useTrainerStore } from "../../../store/trainerStore";
import { useChatStore } from "../../../store/chatStore";
import { AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  AlertCircle,
  MessageCircle,
  Phone,
  Info,
  Search,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";

const ChatList = lazy(() =>
  import("../../../components/Trainer/chat/ChatList")
);
const ChatWindow = lazy(() =>
  import("../../../components/Trainer/chat/ChatWindow")
);
const GroupInfo = lazy(() =>
  import("../../../components/Trainer/chat/GroupInfo")
); // New component below

const ErrorFallback = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <p className="text-red-600 mb-4 text-center">
      {error.message || "Алдаа гарлаа"}
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Дахин ачаалах
    </button>
  </div>
);

export default function TrainerChatPage() {
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

  const { user, fetchUser } = useUserStore();
  const {
    currentTrainer,
    getTrainerById,
    isLoading: isLoadingTrainer,
  } = useTrainerStore();
  const {
    rooms,
    currentRoom,
    fetchRooms,
    initSocket,
    disconnectSocket,
    isLoading: isChatLoading,
    selectRoom,
  } = useChatStore();

  // ✅ ENHANCED: Restore selected room by studentId on load
  useEffect(() => {
    const savedStudentId = localStorage.getItem("selectedChatStudentId");
    if (savedStudentId && rooms.length > 0) {
      const matchingRoom = rooms.find(
        (r) => String(r.studentId) === String(savedStudentId) // ✅ FIXED: Strict string comparison
      );
      if (matchingRoom) {
        selectRoom(matchingRoom._id || matchingRoom.studentId, {
          studentId: matchingRoom.studentId,
          trainerUserId: currentTrainer?.userId,
          useCache: true,
        }).catch(console.error);
      }
    }
  }, [rooms, currentTrainer?.userId, selectRoom]);

  // ✅ ENHANCED: Save current studentId on change
  useEffect(() => {
    if (currentRoom?.studentId) {
      localStorage.setItem(
        "selectedChatStudentId",
        String(currentRoom.studentId)
      ); // ✅ FIXED: String
    } else {
      localStorage.removeItem("selectedChatStudentId");
    }
  }, [currentRoom?.studentId]);

  // Socket init
  useEffect(() => {
    const trainerUserId = currentTrainer?.userId;
    if (trainerUserId) {
      initSocket(trainerUserId);
      return () => disconnectSocket();
    }
  }, [currentTrainer?.userId, initSocket, disconnectSocket]);

  useDeepCompareEffect(() => {
    const students = currentTrainer?.students || [];
    if (currentTrainer?.userId && students.length > 0) {
      fetchRooms(students);
    } else if (currentTrainer?.userId) {
      fetchRooms([]);
    }
  }, [currentTrainer?.students, currentTrainer?.userId, fetchRooms]);

  const fetchAllData = useCallback(
    async (trainerId) => {
      setIsRefreshing(true);
      setError(null);
      try {
        await Promise.allSettled([getTrainerById(trainerId)]);
      } catch (err) {
        setError(err);
      } finally {
        setIsRefreshing(false);
      }
    },
    [getTrainerById]
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  useEffect(() => {
    const trainerId = user?._id || currentTrainer?.trainerId;
    if (trainerId) setTimeout(() => fetchAllData(trainerId), 100);
  }, [user?._id, currentTrainer?.trainerId, fetchAllData]);

  const handleRefresh = useCallback(() => {
    const trainerId = currentTrainer?.trainerId || user?._id;
    if (trainerId) fetchAllData(trainerId);
    fetchRooms(currentTrainer?.students || []);
  }, [
    currentTrainer?.trainerId,
    currentTrainer?.students,
    user?._id,
    fetchAllData,
    fetchRooms,
  ]);

  const enhancedRooms = useMemo(() => {
    if (!rooms?.length) return currentTrainer?.students?.length ? [] : null;
    // ✅ FIXED: Always sort by originalIndex to maintain stable order regardless of updatedAt changes
    return rooms
      .sort(
        (a, b) => (a.originalIndex ?? Infinity) - (b.originalIndex ?? Infinity)
      )
      .slice(0, 50)
      .map((room) => ({
        ...room,
        lastMessagePreview: room.lastMessagePreview || "Яриа эхлүүлэх",
        unreadCount: room.unreadCount || 0,
        updated: room.updatedAt || room.createdAt, // ✅ FIXED: No fallback to now to prevent reordering
      }));
  }, [rooms, currentTrainer?.students?.length]);

  // ✅ ENHANCED: Initial loading only (exclude isChatLoading to avoid overlay on room switch)
  const isInitialLoading = useMemo(
    () => isLoadingTrainer || isRefreshing || !currentTrainer?.userId,
    [isLoadingTrainer, isRefreshing, currentTrainer?.userId]
  );

  const handleSelectRoom = useCallback(
    async (room) => {
      const roomId = String(room?._id || room?.studentId); // ✅ FIXED: Ensure string
      try {
        await selectRoom(roomId, {
          studentId: String(room.studentId), // ✅ FIXED: Ensure string
          trainerUserId: String(currentTrainer?.userId), // ✅ FIXED: Ensure string
          useCache: true,
        });
        // ✅ NEW: Close sidebar on mobile after select
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      } catch (err) {
        console.error("Failed to select room:", err);
      }
    },
    [selectRoom, currentTrainer?.userId]
  );

  if (error && !isInitialLoading)
    return <ErrorFallback error={error} onRetry={handleRefresh} />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 relative flex flex-col lg:flex-row">
      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="fixed top-4 right-4 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50 lg:absolute lg:top-4 lg:right-4"
      >
        {isRefreshing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <RefreshCw className="w-5 h-5" />
        )}
      </button>

      {/* Initial Loading (no chat loading overlay) */}
      {isInitialLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Ачаалж байна...</p>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-16 left-4 z-30 p-2 bg-white rounded-full shadow-md"
      >
        <Menu className="w-6 h-6 text-purple-600" />
      </button>

      <div
        className={`flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-2rem)] gap-0 lg:gap-4 transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "ml-0 lg:ml-0"
        }`}
      >
        {/* Left Sidebar - Chat List */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex-shrink-0 lg:relative fixed  z-20 lg:z-0 top-0 h-full lg:h-auto overflow-y-auto"
            >
              <Suspense
                fallback={<div className="h-64 bg-gray-50 animate-pulse" />}
              >
                {enhancedRooms === null ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Оюутан байхгүй</p>
                  </div>
                ) : (
                  <ChatList
                    rooms={enhancedRooms}
                    onSelectRoom={handleSelectRoom}
                    selectedRoomId={String(currentRoom?._id)} // ✅ FIXED: Ensure string for comparison in ChatList
                    isLoading={isChatLoading}
                  />
                )}
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {" "}
            {/* ✅ NEW: AnimatePresence for smooth ChatWindow transitions */}
            {currentRoom ? (
              <motion.div
                key={`chat-${String(currentRoom._id)}`} // ✅ FIXED: Ensure string for unique key
                initial={{ opacity: 0, x: 20 }} // ✅ NEW: Slide in from right with fade
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} // ✅ NEW: Slide out to left with fade
                transition={{ duration: 0.2 }} // ✅ NEW: Quick transition for Messenger-like feel
                className="h-[calc(100vh-8rem)]"
              >
                <Suspense
                  fallback={
                    <div className="h-full bg-gray-50 animate-pulse flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Чат ачаалж байна...</p>
                      </div>
                    </div>
                  }
                >
                  <ChatWindow
                    room={currentRoom}
                    userId={String(currentTrainer?.userId)} // ✅ FIXED: Ensure string
                    isLoading={isChatLoading} // ✅ Pass isLoading to ChatWindow for custom handling
                    onCloseRoom={() => {
                      useChatStore.setState({
                        currentRoom: null,
                        messages: [],
                      });
                      localStorage.removeItem("selectedChatStudentId");
                    }}
                  />
                </Suspense>
              </motion.div>
            ) : (
              <motion.div
                key="no-chat-placeholder" // ✅ NEW: Key for placeholder animation
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-50 rounded-lg"
              >
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Чат сонгоно уу</p>
                  <p className="text-sm">
                    Зүүн талын жагсаалтаас оюутан сонгоод чат эхлүүлнэ үү.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Overlay for Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  );
}

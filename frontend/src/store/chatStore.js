// store/chatStore.js (Fixed: Use strict string comparison for studentId to prevent match failures)
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";
export const BASE_URL = "http://localhost:3000"; // ✅ Exported for use in components

export const useChatStore = create((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  messagesByRoom: {}, // cached messages per roomId
  userStatuses: new Map(), // userId -> { isActive: bool, lastSeen: Date }
  isLoading: false,
  socket: null,
  userId: null,

  setRooms: (rooms) => set({ rooms }),

  fetchRooms: async (students) => {
    if (!students || !Array.isArray(students)) {
      set({ rooms: [] });
      return;
    }
    try {
      const roomsData = students
        .map((s, index) => {
          // ✅ ENHANCED: Add originalIndex for stable ordering
          const studentId = String(s._id || s.id || s); // ✅ FIXED: Ensure string for comparison
          const name =
            s.username || s.name || s.studentName || "Unknown Student";
          const avatar = s.profileImage || s.avatar || "/default-avatar.png";
          return {
            studentId,
            _id: `proxy-${studentId}`,
            isProxy: true,
            originalIndex: index, // ✅ NEW: Preserve original position from students array
            name,
            studentName: name,
            avatar,
            lastMessagePreview: null,
            unreadCount: 0,
            status: "offline", // Initial status
          };
        })
        .filter((room) => room.studentId);
      set({ rooms: roomsData });
    } catch (err) {
      console.error("Error fetching rooms:", err);
      set({ rooms: [] });
    }
  },

  // Update status for a user
  updateUserStatus: (userId, isActive, lastSeen = new Date()) => {
    set((state) => {
      const statuses = new Map(state.userStatuses);
      statuses.set(String(userId), { isActive, lastSeen }); // ✅ FIXED: String key
      // Update rooms if this user is in a room
      const rooms = state.rooms.map((room) => {
        if (String(room.studentId) === String(userId)) {
          // ✅ FIXED: Strict string comparison
          const statusText = isActive
            ? "Online"
            : `Last seen ${Math.floor(
                (Date.now() - lastSeen) / 60000
              )} mins ago`;
          return { ...room, status: statusText };
        }
        return room;
      });
      return { userStatuses: statuses, rooms };
    });
  },

  createOrGetRoom: async (memberId, trainerUserId) => {
    try {
      const payload = { memberId: String(memberId) }; // ✅ FIXED: Ensure string
      if (trainerUserId) payload.trainerId = String(trainerUserId);
      const res = await axiosInstance.post("/chat/room", payload);
      return res.data?.data ?? res.data;
    } catch (err) {
      console.error("Error creating room:", err.response?.data || err.message);
      throw err;
    }
  },

  // Create or get real room and select it
  selectRoom: async (roomOrId, opts = {}) => {
    const {
      currentRoom: stateCurrentRoom,
      rooms: stateRooms,
      messagesByRoom,
      socket,
    } = get();
    // ✅ ENHANCED: Only set isLoading true initially, no immediate reset
    set({ isLoading: true });

    try {
      // Normalize input (existing logic)...
      let proxyRoom = null;

      if (typeof roomOrId === "string") {
        proxyRoom = stateRooms.find((r) => String(r._id) === String(roomOrId));
        if (!proxyRoom) {
          if (roomOrId.startsWith("proxy-")) {
            const studentId = String(roomOrId.replace(/^proxy-/, "")); // ✅ FIXED: Ensure string
            proxyRoom = {
              _id: roomOrId,
              isProxy: true,
              studentId,
            };
          } else {
            proxyRoom = { _id: roomOrId, isProxy: false };
          }
        }
      } else if (roomOrId && typeof roomOrId === "object") {
        proxyRoom = roomOrId;
      } else {
        console.error("selectRoom: invalid roomOrId", roomOrId);
        set({ isLoading: false });
        return;
      }

      if (proxyRoom.isProxy && !proxyRoom.studentId) {
        if (
          typeof proxyRoom._id === "string" &&
          proxyRoom._id.startsWith("proxy-")
        ) {
          proxyRoom.studentId = String(proxyRoom._id.replace(/^proxy-/, "")); // ✅ FIXED: Ensure string
        }
      }

      let realRoom;
      if (proxyRoom.isProxy) {
        if (!proxyRoom.studentId) {
          console.error("selectRoom: proxy room missing studentId", proxyRoom);
          set({ isLoading: false });
          return;
        }
        // ✅ FIXED: Call createOrGetRoom via get() to access internal action
        realRoom = await get().createOrGetRoom(
          proxyRoom.studentId,
          opts.trainerUserId
        );
      } else {
        realRoom = proxyRoom;
      }

      const realRoomId = String(
        realRoom?._id ?? realRoom?.id ?? realRoom?.roomId ?? null
      ); // ✅ FIXED: Ensure string
      if (!realRoomId) {
        console.error("selectRoom: real room id missing after create/get", {
          proxyRoom,
          realRoom,
        });
        set({ isLoading: false });
        return;
      }

      // Join socket room after getting real ID
      if (socket) {
        socket.emit("joinRoom", realRoomId);
      }

      // Helper to get non-null timestamp
      const getUpdatedAt = (room) =>
        room.updatedAt || room.createdAt || new Date();

      // Helper to get last message time from messages
      const getLastMessageTime = (msgs) => {
        if (msgs && msgs.length > 0) {
          // Sort messages by createdAt to get the latest
          const sortedMsgs = [...msgs].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          return sortedMsgs[0].createdAt;
        }
        return null;
      };

      // If useCache requested and we have cached messages, use them (no fetch, no reset)
      const useCache = !!opts.useCache;
      let messages = [];
      if (useCache && messagesByRoom && messagesByRoom[realRoomId]) {
        messages = messagesByRoom[realRoomId];
        const lastMsgTime = getLastMessageTime(messages);
        const roomUpdatedAt = lastMsgTime || getUpdatedAt(realRoom); // ✅ ENHANCED: Use last message time to avoid reordering on select
        const mergedRoom = {
          ...proxyRoom,
          _id: realRoomId,
          members: realRoom.members || realRoom.users || [],
          updatedAt: roomUpdatedAt, // ✅ FIXED: Use last message time
          createdAt: realRoom.createdAt,
          isProxy: false,
        };
        set({
          currentRoom: mergedRoom,
          messages,
          isLoading: false,
        });

        // update rooms list if needed
        if (proxyRoom.isProxy) {
          set((state) => ({
            rooms: state.rooms.map((r) =>
              String(r.studentId) === String(proxyRoom.studentId) // ✅ FIXED: Strict string comparison to ensure match
                ? {
                    ...r,
                    _id: realRoomId,
                    members: realRoom.members || realRoom.users || [],
                    updatedAt: roomUpdatedAt, // ✅ FIXED: Use last message time
                    createdAt: realRoom.createdAt,
                    isProxy: false,
                    originalIndex: r.originalIndex, // ✅ NEW: Preserve originalIndex
                  }
                : r
            ),
          }));
        }
        return;
      }

      // ✅ ENHANCED: For non-cached, clear messages but keep currentRoom until loaded (no null set)
      set({ messages: [] });

      // Fetch messages for real room
      const res = await axiosInstance.get(`/chat/messages/${realRoomId}`);
      messages = res.data?.data ?? res.data ?? [];

      // Cache messages
      set((state) => ({
        messagesByRoom: {
          ...(state.messagesByRoom || {}),
          [realRoomId]: messages,
        },
      }));

      const lastMsgTime = getLastMessageTime(messages);
      const roomUpdatedAt = lastMsgTime || getUpdatedAt(realRoom); // ✅ ENHANCED: Use last message time to avoid reordering on select
      const mergedRoom = {
        ...proxyRoom,
        _id: realRoomId,
        members: realRoom.members || realRoom.users || [],
        updatedAt: roomUpdatedAt, // ✅ FIXED: Use last message time
        createdAt: realRoom.createdAt,
        isProxy: false,
      };
      set({
        currentRoom: mergedRoom,
        messages,
        isLoading: false,
      });

      if (proxyRoom.isProxy) {
        set((state) => ({
          rooms: state.rooms.map((r) =>
            String(r.studentId) === String(proxyRoom.studentId) // ✅ FIXED: Strict string comparison to ensure match
              ? {
                  ...r,
                  _id: realRoomId,
                  members: realRoom.members || realRoom.users || [],
                  updatedAt: roomUpdatedAt, // ✅ FIXED: Use last message time
                  createdAt: realRoom.createdAt,
                  isProxy: false,
                  originalIndex: r.originalIndex, // ✅ NEW: Preserve originalIndex
                }
              : r
          ),
        }));
      }
    } catch (err) {
      console.error("Error selecting room:", err);
      set({ isLoading: false, messages: [] });
    }
  },

  // FIXED: sendMessage - Upload first, optimistic "sent" after emit, full URLs
  sendMessage: async (payload = {}) => {
    const {
      text,
      replyTo,
      senderId,
      roomId: payloadRoomId,
      attachment,
      ...rest
    } = payload;
    const currentRoom = get().currentRoom;
    const roomId = String(payloadRoomId || currentRoom?._id); // ✅ FIXED: Ensure string
    if (!roomId) throw new Error("No room selected to send message");

    // Handle attachment upload first (if present)
    let imageUrl = null,
      voiceUrl = null,
      attachmentUrl = null,
      attachmentName = null;
    if (attachment) {
      try {
        const formData = new FormData();
        formData.append(
          "attachment",
          attachment,
          attachment.name || "attachment"
        );
        const uploadRes = await axiosInstance.post("/chat/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const { url, type, originalName } = uploadRes.data;
        if (type.startsWith("image/")) imageUrl = url;
        else if (type.startsWith("audio/")) voiceUrl = url;
        else {
          // For other files (e.g., PDF), store as custom fields for display
          attachmentUrl = url;
          attachmentName = originalName;
        }
      } catch (uploadErr) {
        console.error("Upload failed:", uploadErr);
        throw new Error("Failed to upload attachment");
      }
    }

    // create optimistic message with UNIQUE tempId
    const tempId = `tmp-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const now = new Date().toISOString();
    const optimistic = {
      _id: tempId,
      tempId, // NEW: Track for potential future matching
      text,
      imageUrl,
      voiceUrl,
      attachmentUrl,
      attachmentName,
      replyTo: replyTo ? { ...replyTo } : null,
      senderId: String(
        typeof senderId === "object" ? senderId._id || senderId : senderId
      ), // ✅ FIXED: Ensure string
      createdAt: now,
      status: "sending", // Start as sending
      ...rest,
    };

    // append to messages and cache immediately
    set((state) => {
      const msgs = [...(state.messages || []), optimistic];
      const cache = { ...(state.messagesByRoom || {}) };
      if (cache[roomId]) {
        cache[roomId] = [...cache[roomId], optimistic];
      } else {
        cache[roomId] = [optimistic];
      }
      return { messages: msgs, messagesByRoom: cache };
    });

    // Socket emit ONLY (server saves/emits "newMessage")
    try {
      if (get().socket) {
        // FIXED: Use chatRoomId key
        get().socket.emit("sendMessage", {
          chatRoomId: roomId, // ✅ Key fix
          text,
          imageUrl,
          voiceUrl,
          replyTo,
          senderId: String(senderId),
          ...rest,
        });
      } else {
        throw new Error("Socket not connected");
      }

      // FIXED: Optimistically set to "sent" after emit (DB will confirm via echo, but no wait)
      // Also update room updatedAt to message time
      set((state) => {
        const newMessages = state.messages.map((m) =>
          m._id === tempId ? { ...m, status: "sent" } : m
        );
        const cache = { ...(state.messagesByRoom || {}) };
        if (cache[roomId]) {
          cache[roomId] = cache[roomId].map((m) =>
            m._id === tempId ? { ...m, status: "sent" } : m
          );
        }

        // ✅ FIXED: Update room updatedAt for sent message
        const updatedRooms = state.rooms.map(
          (r) => (String(r._id) === roomId ? { ...r, updatedAt: now } : r) // ✅ FIXED: Strict string comparison
        );
        const updatedCurrentRoom =
          String(state.currentRoom?._id) === roomId // ✅ FIXED: Strict string comparison
            ? { ...state.currentRoom, updatedAt: now }
            : state.currentRoom;

        return {
          messages: newMessages,
          messagesByRoom: cache,
          rooms: updatedRooms,
          currentRoom: updatedCurrentRoom,
        };
      });

      return { tempId };
    } catch (err) {
      console.error("sendMessage error:", err);
      // mark optimistic as failed
      set((state) => {
        const newMessages = state.messages.map((m) =>
          m._id === tempId ? { ...m, status: "failed" } : m
        );
        const cache = { ...(state.messagesByRoom || {}) };
        if (cache[roomId]) {
          cache[roomId] = cache[roomId].map((m) =>
            m._id === tempId ? { ...m, status: "failed" } : m
          );
        }
        return { messages: newMessages, messagesByRoom: cache };
      });
      throw err;
    }
  },

  initSocket: (userId) => {
    const prevSocket = get().socket;
    if (prevSocket) prevSocket.disconnect();
    const newSocket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      // Emit user-joined for status tracking
      newSocket.emit("user-joined", String(userId)); // ✅ FIXED: Ensure string
    });

    // FIXED: Listener for others' messages only; own updates optimistically
    newSocket.on("newMessage", (incomingMsg) => {
      const { currentRoom, messages, userId: currentUserId } = get();
      if (
        !currentRoom ||
        String(incomingMsg.chatRoomId) !== String(currentRoom._id) ||
        String(incomingMsg.senderId) === String(currentUserId) // Skip own (optimistic handles)
      )
        return;

      // Add new (from other user) - no temp replacement needed
      const exists = messages.some(
        (msg) => String(msg._id) === String(incomingMsg._id)
      ); // ✅ FIXED: Strict string comparison
      if (!exists) {
        set((state) => {
          const newMessages = [...messages, incomingMsg];

          // ✅ FIXED: Update room updatedAt for received message
          const updatedRooms = state.rooms.map((r) =>
            String(r._id) === String(incomingMsg.chatRoomId) // ✅ FIXED: Strict string comparison
              ? { ...r, updatedAt: incomingMsg.createdAt }
              : r
          );
          const updatedCurrentRoom =
            String(state.currentRoom?._id) === String(incomingMsg.chatRoomId) // ✅ FIXED: Strict string comparison
              ? { ...state.currentRoom, updatedAt: incomingMsg.createdAt }
              : state.currentRoom;

          // Update cache too
          const cache = { ...(state.messagesByRoom || {}) };
          if (cache[incomingMsg.chatRoomId]) {
            cache[incomingMsg.chatRoomId] = [
              ...cache[incomingMsg.chatRoomId],
              incomingMsg,
            ];
          }

          return {
            messages: newMessages,
            messagesByRoom: cache,
            rooms: updatedRooms,
            currentRoom: updatedCurrentRoom,
          };
        });
      }
    });

    // Listen for status updates
    newSocket.on(
      "status-update",
      ({ userId: updatedUserId, isActive, lastSeen }) => {
        get().updateUserStatus(
          String(updatedUserId),
          isActive,
          new Date(lastSeen)
        ); // ✅ FIXED: String userId
      }
    );

    newSocket.on("typing", ({ senderId }) =>
      console.log("User typing:", senderId)
    );

    newSocket.on("messageError", (error) => {
      console.error("Server message error:", error);
      // Mark last message as failed if needed
    });

    set({
      socket: newSocket,
      userId: String(userId || localStorage.getItem("userId")), // ✅ FIXED: Ensure string
    });
    if (userId && !localStorage.getItem("userId"))
      localStorage.setItem("userId", String(userId));
    return newSocket;
  },

  startTyping: (roomId) => {
    const { socket } = get();
    if (socket)
      socket.emit("typing", {
        roomId: String(roomId),
        senderId: String(get().userId || "currentUser"),
      });
  },

  stopTyping: () => {
    const { socket, currentRoom } = get();
    if (socket && currentRoom)
      socket.emit("stopTyping", { roomId: String(currentRoom._id) });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

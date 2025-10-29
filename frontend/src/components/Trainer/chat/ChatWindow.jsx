// components/Trainer/chat/ChatWindow.jsx (Enhanced: Custom loading message with room name; use passed isLoading)
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatStore } from "../../../store/chatStore";
import { BASE_URL } from "../../../store/chatStore"; // ✅ NEW: Import BASE_URL for full URLs

const ChatWindow = ({
  room,
  userId,
  onCloseRoom,
  isLoading: propIsLoading,
}) => {
  const {
    messages,
    isLoading: storeIsLoading,
    sendMessage,
    startTyping,
    stopTyping,
    userStatuses,
  } = useChatStore();
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const effectiveIsLoading = propIsLoading ?? storeIsLoading;

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioFile = new File([audioBlob], "voice-note.wav", {
          type: "audio/wav",
        });
        setSelectedFile(audioFile);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
      alert("Mic access denied or failed");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // NEW: Retry failed message
  const retryMessage = useCallback(
    (failedMsg) => {
      if (failedMsg.text || failedMsg.imageUrl || failedMsg.voiceUrl) {
        sendMessage({
          text: failedMsg.text,
          imageUrl: failedMsg.imageUrl,
          voiceUrl: failedMsg.voiceUrl,
          replyTo: failedMsg.replyTo,
          senderId: userId,
          roomId: room._id,
        }).catch(console.error);
      }
    },
    [sendMessage, userId, room._id]
  );

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSending || (!inputText.trim() && !selectedFile) || !userId) return;
      setIsSending(true);
      try {
        await sendMessage({
          text: inputText,
          replyTo,
          senderId: userId,
          attachment: selectedFile,
        });
        setInputText("");
        setSelectedFile(null);
        setReplyTo(null);
      } catch (err) {
        console.error("Send failed:", err);
      } finally {
        setIsSending(false);
      }
    },
    [inputText, replyTo, userId, isSending, selectedFile, sendMessage]
  );

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleTyping = useCallback(
    (e) => {
      setInputText(e.target.value);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (e.target.value && room?._id) {
        typingTimeoutRef.current = setTimeout(() => startTyping(room._id), 500);
      } else {
        stopTyping();
      }
    },
    [room?._id, startTyping, stopTyping]
  );

  // ✅ NEW: Helper to build full URL for media/attachments
  const buildFullUrl = useCallback((urlPath) => {
    if (!urlPath) return null;
    if (urlPath.startsWith("http")) return urlPath;
    return `${BASE_URL}${urlPath.startsWith("/") ? "" : "/"}${urlPath}`;
  }, []);

  // ✅ ENHANCED: Custom loading with room name
  if (effectiveIsLoading)
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="chat-header p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <img
              src={room.avatar || "/default-avatar.png"}
              alt={room.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {room.name || room.studentName || "User"}
              </h3>
              <p className="text-gray-400">Loading messages...</p>
            </div>
          </div>
          <button
            onClick={onCloseRoom}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">
              Loading {room.name || room.studentName || "chat"} messages...
            </p>
          </div>
        </div>
        {/* Empty input during load */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-center py-3 text-gray-400">
            Select messages to send...
          </div>
        </div>
      </div>
    );
  if (!room) return <div className="p-4 text-center">Select a chat</div>;

  const isOwnMessage = (msg) => {
    const sender = msg.senderId?._id || msg.senderId;
    return sender?.toString() === userId?.toString();
  };

  // Dynamic status
  const otherUserId = room.members?.find((m) => m._id !== userId)?._id;
  const statusObj = otherUserId ? userStatuses.get(otherUserId) : null;
  const status = statusObj?.isActive
    ? "Online"
    : statusObj
    ? `Last seen ${Math.floor(
        (Date.now() - statusObj.lastSeen) / 60000
      )} mins ago`
    : "Offline";
  const statusColor = statusObj?.isActive ? "text-green-500" : "text-gray-400";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="chat-header p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <img
            src={room.avatar || "/default-avatar.png"}
            alt={room.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {room.name || room.studentName || "User"}
            </h3>
            <p className={statusColor}>{status}</p>
          </div>
        </div>
        <button
          onClick={onCloseRoom}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Messages Container */}
      <div className="messages flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg._id || msg.tempId} // FIXED: Use tempId fallback for unique keys
            className={`flex ${
              isOwnMessage(msg) ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md p-3 rounded-2xl shadow-sm relative ${
                isOwnMessage(msg)
                  ? "bg-blue-500 text-white ml-auto rounded-br-md"
                  : "bg-white border border-gray-200 rounded-bl-md"
              } ${msg.status === "uploading" ? "opacity-70" : ""}`}
            >
              {/* Received Avatar (only for others) */}
              {!isOwnMessage(msg) && (
                <img
                  src={room.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="absolute -top-2 -left-3 w-6 h-6 rounded-full border-2 border-white"
                />
              )}

              {/* Reply Preview */}
              {msg.replyTo && (
                <div className="mb-2 p-2 bg-opacity-50 rounded-lg text-xs italic">
                  <span
                    className={
                      isOwnMessage(msg) ? "text-blue-100" : "text-gray-500"
                    }
                  >
                    Replying to: {msg.replyTo.text?.substring(0, 30)}...
                  </span>
                </div>
              )}

              {/* Message Content */}
              {msg.text && <p className="mb-1 leading-relaxed">{msg.text}</p>}
              {msg.imageUrl && (
                <img
                  src={buildFullUrl(msg.imageUrl)} // ✅ FIXED: Use full URL
                  alt="Sent image"
                  className="max-w-full rounded-lg mb-1"
                  onError={(e) => {
                    // ✅ NEW: Debug log for failed loads
                    console.error("Image load failed:", msg.imageUrl);
                    e.target.style.display = "none";
                  }}
                />
              )}
              {msg.voiceUrl && (
                <audio
                  src={buildFullUrl(msg.voiceUrl)} // ✅ FIXED: Use full URL
                  controls
                  className="w-full mb-1"
                  onError={() => {
                    // ✅ NEW: Debug log for failed loads
                    console.error("Audio load failed:", msg.voiceUrl);
                  }}
                />
              )}
              {/* FIXED: Handle other attachments */}
              {msg.attachmentUrl && !msg.imageUrl && !msg.voiceUrl && (
                <a
                  href={buildFullUrl(msg.attachmentUrl)} // ✅ FIXED: Use full URL
                  download={msg.attachmentName}
                  className="text-blue-500 underline text-sm mb-1 block"
                >
                  📎 Download {msg.attachmentName || "file"}
                </a>
              )}

              {/* Status/Retry */}
              {isOwnMessage(msg) && msg.status && msg.status !== "sent" && (
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      msg.status === "failed" ? "text-red-200" : "text-blue-100"
                    }`}
                  >
                    {msg.status === "sending"
                      ? "Sending..."
                      : msg.status === "uploading"
                      ? "Uploading..."
                      : "Failed"}
                  </span>
                  {msg.status === "failed" && (
                    <button
                      onClick={() => retryMessage(msg)}
                      className="ml-2 text-xs text-blue-200 underline hover:text-blue-100"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-1 flex justify-between ${
                  isOwnMessage(msg) ? "text-blue-100" : "text-gray-400"
                }`}
              >
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isOwnMessage(msg) && !msg.status && (
                  <span className="text-blue-200">✓✓</span>
                )}
              </div>

              {/* Tail */}
              <div
                className={`absolute w-0 h-0 border-transparent ${
                  isOwnMessage(msg)
                    ? "bottom-0 left-0 border-t-8 border-t-blue-500 border-r-8 border-r-transparent"
                    : "bottom-0 right-0 border-t-8 border-t-white border-l-8 border-l-transparent"
                }`}
              ></div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="message-input p-4 border-t border-gray-200 bg-white flex gap-2 items-end"
        key={room._id}
      >
        {replyTo && (
          <div className="reply-indicator w-full mb-2 p-2 bg-gray-100 rounded-lg text-sm flex justify-between border-l-4 border-blue-500">
            <span>Replying to: {replyTo.text?.substring(0, 50)}...</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-red-500 underline text-sm"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={handleTyping}
            placeholder={
              selectedFile
                ? `Sending ${selectedFile.name}...`
                : "Type a message..."
            }
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSending || effectiveIsLoading}
            onFocus={() => room?._id && startTyping(room._id)}
            onBlur={() =>
              (typingTimeoutRef.current = setTimeout(stopTyping, 1000))
            }
          />
          {/* File input + Voice record button */}
          <input
            type="file"
            id="fileInput"
            onChange={handleFileSelect}
            accept="image/*,audio/*,.pdf"
            className="hidden"
            disabled={effectiveIsLoading}
          />
          <label
            htmlFor="fileInput"
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 cursor-pointer"
          >
            📎
          </label>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
            disabled={isSending || effectiveIsLoading}
          >
            {isRecording ? "⏹️" : "🎤"}
          </button>
          {selectedFile && (
            <span className="absolute right-20 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 truncate max-w-20">
              {selectedFile.name}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={
            (!inputText.trim() && !selectedFile) ||
            !userId ||
            isSending ||
            effectiveIsLoading
          }
          className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors font-semibold"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

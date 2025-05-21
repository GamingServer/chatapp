import React, { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import useGetMsg from "../../../hooks/useGetMsg";
import { useSocketContext } from "../../../context/SocketContext";
import Picker from "@emoji-mart/react";
import emojiRegex from "emoji-regex";

const RightMenu = ({ onBack }) => {
  const { selectedUser, socket, setLastMsg, setSeenMessage, onlineUser } =
    useSocketContext();
  const { getMsg } = useGetMsg();
  const { isAdmin, adminRole } = useAuthContext();

  const [messages, setMessages] = useState([]);
  const [newmsg, setNewmsg] = useState({ user: "sent", message: "" });
  const [fullMedia, setFullMedia] = useState({ type: "", url: "" });
  const [showDrawer, setShowDrawer] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(selectedUser.role);
  const [role, setrole] = useState([]);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const containerRef = useRef(null);
  const messageEndRef = useRef(null);
  const userDetailsDrawerRef = useRef(null);

  const renderMessageWithEmojis = (message) => {
    const regex = emojiRegex();
    const parts = [];
    let lastIndex = 0;

    for (const match of message.matchAll(regex)) {
      const { index } = match;
      if (index > lastIndex) {
        parts.push(
          <span key={lastIndex}>{message.slice(lastIndex, index)}</span>
        );
      }
      parts.push(
        <span key={index} className="text-2xl inline-block align-middle">
          {match[0]}
        </span>
      );
      lastIndex = index + match[0].length;
    }

    if (lastIndex < message.length) {
      parts.push(<span key={lastIndex}>{message.slice(lastIndex)}</span>);
    }

    return parts;
  };

  let imageUrl = (
    <img
      src={selectedUser.image}
      alt="Admin avatar"
      className="w-6 h-6 rounded-full"
    />
  );

  const handleAttachClick = () => setShowDrawer((prev) => !prev);

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(
        `http://localhost:8080/api/messages/upload/${type}/admin/${selectedUser.name}`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Failed to upload file");
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
      setShowDrawer(false);
    } catch (e) {
      alert(e);
    }
  };

  const handleRoleChange = async (role) => {
    const isselected = selectedRoles.includes(role);

    if (!isselected) {
      await fetch("http://localhost:8080/api/user/add/admin/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.name,
          role: role,
        }),
      });
    } else {
      await fetch("http://localhost:8080/api/user/remove/admin/role", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.name,
          role: role,
        }),
      });
    }
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((id) => id !== role) : [...prev, role]
    );
  };

  useEffect(() => {
    async function fetchRoles() {
      const res = await fetch("http://localhost:8080/api/admin/get/adminroles");
      const data = await res.json();
      setrole(data);
    }
    fetchRoles();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const updateMessages = [...messages];
        const seenMessages = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const _id = entry.target.dataset.id;
            const index = updateMessages.findIndex((msg) => msg._id === _id);
            if (
              index !== -1 &&
              updateMessages[index].status !== "seen" &&
              updateMessages[index].senderName !== "admin"
            ) {
              updateMessages[index].status = "seen";
              seenMessages.push({ _id: updateMessages[index]._id });
            }
          }
        });

        if (seenMessages.length > 0) {
          setSeenMessage(seenMessages);
        }
      },
      { root: containerRef.current, threshold: 1.0 }
    );

    const timeout = setTimeout(() => {
      const messageElements =
        containerRef.current.querySelectorAll("[data-id]");
      messageElements.forEach((el) => observer.observe(el));
    }, 300);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [messages, setSeenMessage]);

  useEffect(() => {
    if (isAdmin) {
      getMsg({ senderName: "admin", reciverName: selectedUser.name }).then(
        (value) => {
          if (Array.isArray(value)) {
            setMessages(value);
          } else {
            setMessages([]);
          }
        }
      );
    }
  }, [selectedUser, isAdmin]);

  useEffect(() => {
    socket.on("receiveMessage", ({ message }) => {
      if (message.senderName === selectedUser.name) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    socket.on("online-userName", (value) => {
      if (selectedUser && selectedUser.name === value) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.status === "sent" || msg.status === "delivered"
              ? { ...msg, status: "seen" }
              : msg
          )
        );
      }
    });

    socket.on("seen-Message", (value) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          value.includes(msg._id) ? { ...msg, status: "seen" } : msg
        )
      );
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedUser, socket]);

  const handleInput = async () => {
    if (newmsg.message !== "") {
      const messageToSend = {
        message: newmsg.message,
        senderName: "admin",
        receiverName: selectedUser.name,
      };
      const res = await fetch(
        `http://localhost:8080/api/messages/sendmsg/admin/${selectedUser.name}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageToSend),
        }
      );
      const data = await res.json();
      setNewmsg({ ...newmsg, message: "" });
      setLastMsg((prevMessages) =>
        prevMessages.map((msg) =>
          selectedUser.name === msg.senderName ||
          selectedUser.name === msg.receiverName
            ? { ...msg, message: data.message }
            : msg
        )
      );
      setMessages([...messages, data]);
    } else {
      alert("Please enter a message");
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateHeader = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) return "Today";
    if (messageDate.toDateString() === yesterday.toDateString())
      return "Yesterday";

    return messageDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const addEmoji = (emoji) => {
    if (!emoji?.unified) return;
    const emojiCode = emoji.unified.split("-").map((el) => `0x${el}`);
    const emojiChar = String.fromCodePoint(...emojiCode);
    setNewmsg((prev) => ({ ...prev, message: prev.message + emojiChar }));
  };

  let lastDate = null;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-[10%] w-full flex justify-between items-center border-b-2 border-black px-4">
        <button
          className="md:hidden text-blue-600 font-semibold"
          onClick={onBack}
        >
          ← Back
        </button>
        <h2 className="text-[30px] mx-auto md:mx-0 pt-0 flex flex-col">
          {selectedUser.name}{" "}
          {onlineUser.includes(selectedUser.name) && (
            <span className="text-sm">online</span>
          )}
        </h2>
        {!role.some((item) => item.role === adminRole) && (
          <button onClick={() => setShowUserDetails(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path
                fill="currentColor"
                d="M20.75 7a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75m0 5a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75m0 5a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75"
              />
            </svg>
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto flex flex-col gap-3 px-4"
      >
        {messages.map((item) => {
          const messageDate = new Date(item.createdAt).toDateString();
          const showDateHeader = messageDate !== lastDate;
          if (showDateHeader) lastDate = messageDate;

          return (
            <React.Fragment key={item._id}>
              {showDateHeader && (
                <div className="flex justify-center my-2">
                  <div className="bg-slate-400 rounded-md px-3 py-1 text-xs text-white">
                    {formatDateHeader(item.createdAt)}
                  </div>
                </div>
              )}
              <div
                data-id={item._id}
                className={`flex items-end min-w-[40%] gap-2 ${
                  item.senderName === "admin"
                    ? "self-end flex-row-reverse"
                    : "self-start"
                }`}
              >
                {item.senderName !== "admin" && imageUrl}
                <div
                  className={`${
                    item.senderName === "admin"
                      ? "bg-[#007bff] text-white"
                      : "bg-[#e4e6eb] text-black"
                  } rounded-[10px] px-3 py-2 max-w-[100%] min-w-[30%]`}
                >
                  {item.type === "image" ? (
                    <img
                      src={`http://localhost:8080${item.message}`}
                      alt="sent"
                      className="w-48 h-48 object-cover cursor-pointer rounded"
                      onClick={() =>
                        setFullMedia({
                          type: "image",
                          url: `http://localhost:8080${item.message}`,
                        })
                      }
                    />
                  ) : item.type === "video" ? (
                    <video
                      src={`http://localhost:8080${item.message}`}
                      controls
                      className="w-64 h-48 rounded cursor-pointer"
                      onClick={() =>
                        setFullMedia({
                          type: "video",
                          url: `http://localhost:8080${item.message}`,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm break-words">
                      {renderMessageWithEmojis(item.message)}
                    </p>
                  )}
                  <span className="text-[10px] block text-right whitespace-nowrap">
                    <time dateTime={item.createdAt}>
                      {formatTime(item.createdAt)}
                    </time>
                    {item.senderName === "admin" && (
                      <span className="ml-1">
                        {item.status === "sent" && "✓"}
                        {item.status === "delivered" && "✓✓"}
                        {item.status === "seen" && (
                          <span style={{ color: "black" }}>✓✓</span>
                        )}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {fullMedia.url && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setFullMedia({ type: "", url: "" })}
        >
          {fullMedia.type === "image" ? (
            <img
              src={fullMedia.url}
              alt="Full view"
              className="max-w-[100%] max-h-[100%] rounded-lg shadow-lg"
            />
          ) : (
            <video
              src={fullMedia.url}
              controls
              className="max-w-[100%] max-h-[100%] rounded-lg shadow-lg"
            />
          )}
        </div>
      )}

      <div className="border-t p-2 flex flex-wrap items-center gap-2 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newmsg.message}
            placeholder="Type your message..."
            className="w-full border-2 border-black rounded-lg p-2 pr-10"
            onChange={(e) => setNewmsg({ ...newmsg, message: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInput();
            }}
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 z-50">
              <Picker onEmojiSelect={addEmoji} />
            </div>
          )}
        </div>

        <div className="relative group">
          <button
            className="p-2 border border-gray-300 rounded hover:bg-gray-100"
            onClick={handleAttachClick}
          >
            📎
          </button>
          {showDrawer && (
            <div className="absolute bottom-full mb-2 left-[-25px] bg-white border rounded shadow-md w-40 p-2 z-50">
              <button
                onClick={() => fileInputRef.current.click()}
                className="block w-full text-left hover:bg-gray-100 px-2 py-1 text-sm"
              >
                📷 Upload Image
              </button>
              <button
                onClick={() => videoInputRef.current.click()}
                className="block w-full text-left hover:bg-gray-100 px-2 py-1 text-sm"
              >
                🎥 Upload Video
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFileChange(e, "image")}
          />
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            className="hidden"
            onChange={(e) => handleFileChange(e, "video")}
          />
        </div>

        <button
          onClick={handleInput}
          className="w-[80px] bg-blue-500 text-white rounded-lg h-[42px]"
        >
          Send
        </button>
      </div>

      {/* User Details Drawer */}
      <div
        ref={userDetailsDrawerRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-lg w-64 transform ${
          showUserDetails ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-4">
          <button
            onClick={() => setShowUserDetails(false)}
            className="text-gray-600 mb-4"
          >
            Close
          </button>
          <div className="flex flex-col items-center">
            <img
              src={selectedUser.image}
              alt={`${selectedUser.name} avatar`}
              className="w-16 h-16 rounded-full mb-4"
            />
            <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
            <p className="text-sm text-gray-500">
              {onlineUser.includes(selectedUser.name) ? "Online" : "Offline"}
            </p>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold">Roles</h4>
            <div className="space-y-2 mt-2">
              {role.map((r) => (
                <label key={r.role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r.role)}
                    onChange={() => handleRoleChange(r.role)}
                    className="mr-2"
                  />
                  {r.role}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showUserDetails && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setShowUserDetails(false)}
        ></div>
      )}
    </div>
  );
};

export default RightMenu;

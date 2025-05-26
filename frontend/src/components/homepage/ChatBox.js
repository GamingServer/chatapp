import React, { useEffect, useRef, useState } from "react";
import UserForm from "./UserForm";
import useGetMsg from "../../hooks/useGetMsg";
import useSentMsg from "../../hooks/useSentMsg";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import Picker from "@emoji-mart/react";
const ChatBox = ({ toggle }) => {
  const { socket, setSeenMessage, isAdminOnline } = useSocketContext();
  const { getMsg } = useGetMsg();
  const { sendMsg } = useSentMsg();
  const { authUser } = useAuthContext();

  const [messages, setMessages] = useState([]);
  const [newmsg, setNewmsg] = useState({ user: "sent", message: "" });
  const [showDrawer, setShowDrawer] = useState(false);
  const [fullMedia, setFullMedia] = useState({ type: "", url: "" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messageEndRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  let selectedUser;

  const adminPic = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M11.77 20v-1H19v-7.446q0-2.81-2.066-4.693Q14.867 4.977 12 4.977T7.066 6.861T5 11.554v5.696H3v-4.706h1l.017-1.224q.027-1.57.68-2.905t1.744-2.323t2.524-1.54T12.001 4t3.032.552t2.513 1.538t1.735 2.32t.702 2.895l.017 1.24h1v4.705h-1V20zm-2.385-6.461q-.31 0-.54-.21t-.23-.52t.23-.531t.54-.22q.31 0 .539.215q.23.216.23.535q0 .31-.23.52t-.54.21m5.232 0q-.31 0-.54-.21t-.23-.52t.23-.53t.54-.22t.539.215t.23.535q0 .31-.23.52t-.54.21M6.718 11.95q-.136-2.246 1.447-3.829q1.582-1.583 3.887-1.583q1.935 0 3.43 1.163t1.827 3.055q-1.987-.025-3.688-1.014t-2.61-2.75q-.362 1.731-1.505 3.034q-1.144 1.303-2.788 1.924"
      />
    </svg>
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const updateMessages = [...messages];
        const seenMessages = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.id;
            const index = updateMessages.findIndex((msg) => msg.id === id);
            if (
              index !== -1 &&
              updateMessages[index].status !== "seen" &&
              updateMessages[index].sender.username === "admin"
            ) {
              updateMessages[index].status = "seen";
              seenMessages.push({ id: updateMessages[index].id });
            }
          }
        });

        if (seenMessages.length > 0) {
          setSeenMessage(seenMessages);
        }
      },
      {
        root: containerRef.current,
        threshold: 1.0,
      }
    );

    const timeout = setTimeout(() => {
      if (containerRef.current) {
        const messageElements =
          containerRef.current.querySelectorAll("#message");
        messageElements.forEach((el) => observer.observe(el));
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [messages]);

  useEffect(() => {
    if (authUser) {
      getMsg({ senderName: authUser.username, reciverName: "admin" }).then(
        (value) => {
          setMessages(Array.isArray(value) ? value : []);
        }
      );
    }
  }, [authUser]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    if (authUser) {
      if (selectedUser === authUser.username) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (!msg || typeof msg !== "object") return msg;
            return msg.status === "sent" || msg.status === "delivered"
              ? { ...msg, status: "seen" }
              : msg;
          })
        );
      }
    }
  }, [selectedUser, authUser]);

  useEffect(() => {
    if (socket && authUser?.username) {
      socket.on("receiveMessage", ({ message, status }) => {
        setMessages((prev) => [...prev, message]);
      });
      socket.on("selectedUser", (value) => {
        selectedUser = value;
      });
      socket.on("seen-Message", (value) => {
        setMessages((prev) =>
          prev.map((msg) =>
            value.includes(msg.id) ? { ...msg, status: "seen" } : msg
          )
        );
      });

      return () => {
        socket.off("receiveMessage");
        socket.off("selectedUser");
        socket.off("seen-Message");
      };
    }
  }, [socket, authUser?.username]);

  const handleInput = async (customMsg, item_id) => {
    console.log(item_id)
    const messageToSend = customMsg || newmsg.message;

    if (!messageToSend.trim()) {
      alert("Please enter a message");
      return;
    }

    let payload = {};

    if (customMsg) {
      payload = {
        message: messageToSend,
        senderName: authUser.username,
        receiverName: "admin",
        status: "sent",
        choice_id: item_id,
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === item_id ? { ...msg, selectedChoice: messageToSend } : msg
        )
      );
    } else {
      payload = {
        message: messageToSend,
        senderName: authUser.username,
        receiverName: "admin",
        status: "sent",
      };
    }

    if (socket) {
      socket.emit("sendMessage", {
        to: "admin",
        message: messageToSend,
        status: "sent",
      });
    }

    const data = await sendMsg({
      MSG: payload,
      senderName: authUser.username,
      reciverName: "admin",
    });
    setMessages((prev) => [...prev, data]);
    setNewmsg((prev) => ({ ...prev, message: "" }));
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAttachClick = () => setShowDrawer((prev) => !prev);

  const handleFileChange = async (e, type, id, category) => {
    const file = e.target.files[0];
    if (!file || !authUser?.username) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("messageId", id);
    formData.append("category", category);
    try {
      if (id) {
        const res = await fetch(
          `http://localhost:8080/api/category/image/${authUser.username}/admin`,
          {
            method: "POST",
            body: formData,
            // credentials: 'include'
          }
        );
        const data = await res.json();
        console.log(data);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === data.id ? data : msg))
        );
      } else {
        const res = await fetch(
          `http://localhost:8080/api/messages/upload/${type}/${authUser.username}/admin`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to upload file");
        const data = await res.json();
        setMessages((prev) => [...prev, data]);
        setShowDrawer(false);
      }
    } catch (e) {
      console.log(e);
      // alert(e);
    }
  };

  const formatDateHeader = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return messageDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  let lastDate = null;

  return (
    <div
      className="fixed bg-[#fff] rounded-xl shadow-lg flex flex-col pb-[10px] overflow-hidden
      md:w-[400px] md:h-[600px] w-screen h-screen bottom-0 right-0 md:bottom-5 md:right-5 z-50"
    >
      <div className="bg-[#007bff] text-white p-4 rounded-tl-[10px] rounded-tr-[10px] flex justify-between items-center">
        <h2 className="text-xl flex flex-col">
          Chat with us{" "}
          {isAdminOnline && <span className="text-xs">admin is online</span>}
        </h2>

        <button
          className="bg-transparent border-0 text-white text-[20px] cursor-pointer"
          onClick={toggle}
        >
          X
        </button>
      </div>

      {authUser ? (
        <>
          <div
            ref={containerRef}
            className="flex-grow overflow-y-auto p-[10px] mb-[50px] flex flex-col gap-[10px]"
          >
            {Array.isArray(messages) &&
              messages.map((item, index) => {
                if (!item || typeof item !== "object") return null;

                const messageDate = new Date(item.createdAt).toDateString();
                const showDateHeader = messageDate !== lastDate;
                if (showDateHeader) lastDate = messageDate;

                return (
                  <React.Fragment key={item.id}>
                    {showDateHeader && (
                      <div className="flex justify-center my-2">
                        <div className="bg-slate-400 rounded-md px-3 py-1 text-xs text-white">
                          {formatDateHeader(item.createdAt)}
                        </div>
                      </div>
                    )}
                    <div
                      data-id={item.id}
                      id="message"
                      className={`flex items-end min-w-[40%] gap-2 ${
                        item.sender.username !== "admin"
                          ? "self-end flex-row-reverse"
                          : "self-start"
                      }`}
                    >
                      {item.sender.username === "admin" && adminPic}

                      <div
                        className={`${
                          item.sender.username !== "admin"
                            ? "bg-[#007bff] text-white"
                            : "bg-[#e4e6eb] text-black"
                        } rounded-[10px] px-3 py-2 max-w-[100%] min-w-[30%]`}
                      >
                        {item.type === "image" ? (
                          <img
                            src={`http://localhost:8080${item.message}`}
                            alt="sent"
                            onClick={() =>
                              setFullMedia({
                                type: "image",
                                url: `http://localhost:8080${item.message}`,
                              })
                            }
                            className="w-48 h-48 object-cover cursor-pointer rounded"
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
                        ) : /^https?:\/\/.*\.(jpeg|jpg|gif|png|webp)$/i.test(
                            item.message
                          ) ? (
                          <img
                            src={item.message}
                            alt="sent"
                            onClick={() =>
                              setFullMedia({ type: "image", url: item.message })
                            }
                            className="w-20 h-20 object-cover cursor-pointer rounded"
                          />
                        ) : /^https?:\/\/.*\.(mp4|webm|ogg)$/i.test(
                            item.message
                          ) ? (
                          <video
                            src={item.message}
                            controls
                            className="w-32 h-24 rounded cursor-pointer"
                            onClick={() =>
                              setFullMedia({ type: "video", url: item.message })
                            }
                          />
                        ) : /^https?:\/\/[^\s]+$/i.test(item.message) ? (
                          <a
                            href={item.message}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 break-all"
                          >
                            {item.message}
                          </a>
                        ) : item.type === "category" ? (
                          !item.isUsed ? (
                            <div className="flex flex-col gap-2 mt-1">
                              <p className="text-sm">{item.message}</p>
                              <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
                                Send File
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileChange(
                                      e,
                                      "image",
                                      item.id,
                                      item.category
                                    )
                                  }
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 mt-1">
                              <p className="text-base">
                                Image Already Uploaded
                              </p>
                              <img
                                src={"http://localhost:8080" + item.image}
                                alt="sent"
                                onClick={() =>
                                  setFullMedia({
                                    type: "image",
                                    url: `http://localhost:8080${item.image}`,
                                  })
                                }
                                className="w-20 h-20 object-cover cursor-pointer rounded"
                              />
                            </div>
                          )
                        ) : item.isChoice && item.choice?.length > 0 ? (
                          <div className="flex flex-col gap-2 mt-1">
                            <p className="text-sm">{item.message}</p>
                            {item.choice.map((choice, idx) => (
                              <button
                                key={idx}
                                disabled={!!item.selectedChoice}
                                className={
                                  " px-3 py-1 rounded text-sm transition-colors " +
                                  (item.selectedChoice === choice
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-blue-600 hover:text-white bg-white text-black")
                                }
                                onClick={() => handleInput(choice, item.id)}
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm">{item.message}</p>
                        )}

                        <span className="text-[10px] block text-right whitespace-nowrap">
                          {formatTime(item.createdAt)}
                          {item.sender.username !== "admin" && (
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
                  className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
                />
              ) : (
                <video
                  src={fullMedia.url}
                  controls
                  className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
                />
              )}
            </div>
          )}

          <div className="border-t p-2 flex flex-row items-center gap-2 relative">
            <input
              type="text"
              value={newmsg.message}
              placeholder="Type your message..."
              className="flex-grow border-2 border-black rounded-lg p-2"
              onChange={(e) =>
                setNewmsg({ ...newmsg, message: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInput();
              }}
            />

            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-2xl"
              >
                😊
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 right-[-100 px] z-50">
                  <Picker
                    onEmojiSelect={(emoji) =>
                      setNewmsg({
                        ...newmsg,
                        message: newmsg.message + emoji.native,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="relative group">
              <button onClick={handleAttachClick} className="p-2">
                📎
              </button>
              {showDrawer && (
                <div className="absolute bottom-full mb-2 right-0 bg-white border rounded shadow-md w-40 p-2 z-50">
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
              onClick={async () => await handleInput()}
              className="bg-blue-500 text-white rounded-lg px-4 py-2"
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <UserForm />
      )}
    </div>
  );
};

export default ChatBox;

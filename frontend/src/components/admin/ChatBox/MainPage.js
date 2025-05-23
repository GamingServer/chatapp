import React, { useEffect, useState } from "react";
import RightMenu from "./RightMenu";
import { useSocketContext } from "../../../context/SocketContext";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
const MainPage = () => {
  const { selectedUser, setSelectedUser, allUser, setAllUser, lastMsg } =
    useSocketContext();

  const { adminRole } = useAuthContext();

  const [showChatOnly, setShowChatOnly] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(
        "http://localhost:8080/api/messages/getall/admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ role: adminRole }),
        }
      );
      const data = await response.json();
      if (response.status === 200) {
        await setAllUser(data);
      } else {
        alert(data.message);
      }
    };
    fetchUsers();
  }, [setAllUser]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - messageTime) / 1000);

    if (diffInSeconds < 60) return "now";
    else if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    else if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    else if (diffInSeconds < 172800) return "yesterday";
    else return messageTime.toLocaleDateString();
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row">
      <div
        className={`md:w-1/3 w-full h-full border-r-2 md:flex flex-col transition-all duration-300 ${
          showChatOnly ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-10 h-[10%] w-full flex justify-between items-center border-b-2 border-black">
          <h1 className="text-[30px]">Chat Box</h1>
          <Link to={"/admin/game"}>
            <h4 className="hover:text-blue-600 duration-300 hover:text-lg">
              Game
            </h4>
          </Link>
        </div>
        <div className="h-full px-5 py-3 flex gap-y-2 flex-col overflow-y-auto">
          {allUser.map((user, index) => {
            const lastMessage = Array.isArray(lastMsg)
              ? lastMsg.find(
                  (msg) =>
                    msg.sender.username === user.name ||
                    msg.reciver.username === user.name
                )
              : null;

            return (
              <div
                key={index}
                className="border-black border-[1px] px-3 py-2 rounded-[20px] hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                onClick={() => {
                  setSelectedUser(user);
                  setShowChatOnly(true);
                }}
              >
                <img
                  src={
                    user.image ||
                    "https://avatar.iran.liara.run/public/boy/hello"
                  }
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover border"
                />

                <div className="flex-1">
                  <div className="w-full justify-between flex">
                    <h2>{user.name}</h2>
                    <h2 className="text-xs">
                      {lastMessage ? formatTimeAgo(lastMessage.createdAt) : ""}
                    </h2>
                  </div>
                  <h4 className="text-xs text-gray-500">
                    {lastMessage
                      ? lastMessage.type == "image" ||
                        lastMessage.type == "video"
                        ? lastMessage.type == "image"
                          ? "image"
                          : "video"
                        : lastMessage.message
                      : "No message yet"}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedUser && (
        <div
          className={`md:w-2/3 w-full h-full transition-all duration-300 ${
            showChatOnly ? "flex" : "hidden md:flex"
          }`}
        >
          <RightMenu onBack={() => setShowChatOnly(false)} />
        </div>
      )}
    </div>
  );
};

export default MainPage;

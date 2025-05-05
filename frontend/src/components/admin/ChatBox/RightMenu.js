import React, { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import useGetMsg from '../../../hooks/useGetMsg';
import { useSocketContext } from '../../../context/SocketContext';

const RightMenu = ({ onBack }) => {
  const { selectedUser, socket, setLastMsg } = useSocketContext();
  const { getMsg } = useGetMsg();
  const { isAdmin } = useAuthContext();
  const [messages, setMessages] = useState([]);
  const [newmsg, setNewmsg] = useState({
    user: 'sent',
    message: '',
  });

  const messageEndRef = useRef(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const observerRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(()=>{
    observerRef.current = new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if(entry.isIntersecting){
          const messageId = Number(entry.target.dataset.id);
          setMessages((prevMessages)=>prevMessages.map((msg)=>msg.id === messageId ? {...msg,status:'seen'}:msg))
        }
      })
    },{root:document.qu})
  },[])

  useEffect(() => {
    if (isAdmin) {
      getMsg({ senderName: 'admin', reciverName: selectedUser.name }).then((value) => {
        if (Array.isArray(value)) {
          console.log(value)
          setMessages(value);
        } else {
          setMessages([]);
        }
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    socket.on('receiveMessage', ({ message, status }) => {
      if (message.senderName === selectedUser.name) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    socket.on('online-userName', (value) => {
      if (selectedUser) {
        if (selectedUser.name === value) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (!msg || typeof msg !== 'object') return msg;
              return msg.status === 'sent' || msg.status === 'delivered'
                ? { ...msg, status: 'seen' }
                : msg;
            })
          );
        }
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedUser]);

  const handleInput = async () => {
    if (newmsg.message !== '') {
      const messageToSend = {
        message: newmsg.message,
        senderName: 'admin',
        receiverName: selectedUser.name,
      };
      const res = await fetch(
        `http://localhost:8080/api/messages/sendmsg/admin/${selectedUser.name}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageToSend),
        }
      );
      const data = await res.json();
      setNewmsg({ ...newmsg, message: '' });
      setLastMsg((prevMessages) =>
        prevMessages.map((msg) => {
          if (selectedUser.name === msg.senderName || selectedUser.name === msg.receiverName) {
            return { ...msg, message: data.message };
          }
          return msg;
        })
      );
      setMessages([...messages, data]);
    } else {
      alert('Please enter a message');
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [newmsg, messages]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return messageDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  let lastDate = null;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-[10%] w-full flex justify-between items-center border-b-2 border-black px-4 md:justify-between md:items-center ">
        <button
          className="md:hidden text-blue-600 font-semibold"
          onClick={onBack}
        >
          ← Back
        </button>
        <h2 className="text-[30px] mx-auto md:mx-0 pt-0">{selectedUser.name}</h2>
        <button className='' onClick={()=>setShowUserDetails(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M20.75 7a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75m0 5a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75m0 5a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75" clip-rule="evenodd" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4">
        {messages.map((item, index) => {
          const messageDate = new Date(item.createdAt).toDateString();
          const showDateHeader = messageDate !== lastDate;
          if (showDateHeader) lastDate = messageDate;

          return (
            <React.Fragment key={index}>
              {showDateHeader && (
                <div className="flex justify-center my-2">
                  <div className="bg-slate-400 rounded-md px-3 py-1 text-xs text-white">
                    {formatDateHeader(item.createdAt)}
                  </div>
                </div>
              )}
              <div
                className={`${item.senderName !== selectedUser.name
                    ? 'bg-[#007bff] text-white rounded-[10px] px-[10px] pt-[5px] max-w-[60%] self-end flex flex-col gap-[2px]'
                    : 'bg-[#696b6e] text-white rounded-[10px] max-w-[60%] self-start pt-[5px] px-[10px]'
                  }`}
              >
                <p className="flex flex-row gap-[20px] text-lg">
                  {item.message}
                  <span className="text-[10px] mt-2">
                    {formatTime(item.createdAt)}
                    {item.senderName === 'admin' && (
                      <span className="seen-msg mt-2">
                        {item.status === 'sent' && '✓'}
                        {item.status === 'delivered' && '✓✓'}
                        {item.status === 'seen' && <span style={{ color: 'black' }}>✓✓</span>}
                      </span>
                    )}
                  </span>
                </p>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <div className="border-t p-2 flex gap-2">
        <input
          type="text"
          className="flex-1 border-2 border-black rounded-lg p-2"
          value={newmsg.message}
          placeholder="Type your message here..."
          onChange={(e) => setNewmsg({ ...newmsg, message: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleInput();
            }
          }}
        />
        <button onClick={handleInput} className="w-[80px] bg-blue-500 text-white rounded-lg">
          Send
        </button>
      </div>
      {showUserDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
    <div className="w-72 bg-white h-full shadow-xl p-4 relative">
      <button
        className="absolute top-2 right-2 text-red-500 text-lg"
        onClick={() => setShowUserDetails(false)}
      >
        ×
      </button>
      <h2 className="text-xl font-semibold mb-4">User Details</h2>

      {selectedUser.image && (
        <div className="mb-4 flex justify-center">
          <img
            src={selectedUser.image}
            alt="User"
            className="w-24 h-24 rounded-full border object-cover"
          />
        </div>
      )}

      <div className="space-y-2 text-sm">
        <p><strong>Name:</strong> {selectedUser.name}</p>
        <p><strong>Email:</strong> {selectedUser.email}</p>
        <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default RightMenu;

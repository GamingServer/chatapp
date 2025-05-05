import React, { useEffect, useRef, useState } from 'react';
// import './ChatBox.css';
import UserForm from './UserForm';
import useGetMsg from '../../hooks/useGetMsg';
import useSentMsg from '../../hooks/useSentMsg';
import { useAuthContext } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';

const ChatBox = ({ toggle }) => {

    const { socket } = useSocketContext();
    const { getMsg } = useGetMsg();
    const { sendMsg } = useSentMsg();
    const { authUser } = useAuthContext();
    const [selectedUser, setSelectedUser] = useState();
    const [messages, setMessages] = useState([]);
    const [newmsg, setNewmsg] = useState({ user: 'sent', message: '' });
    const messageEndRef = useRef(null);
    useEffect(() => {
        if (authUser) {
            getMsg({ senderName: authUser.username, reciverName: 'admin' }).then((value) => {
                setMessages(Array.isArray(value) ? value : []);
            });
        }
    }, [authUser]);

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (authUser) {
            if (selectedUser === authUser.username) {
                setMessages(prevMessages =>
                    prevMessages.map(msg => {
                        if (!msg || typeof msg !== 'object') return msg;
                        return (msg.status === 'sent' || msg.status === 'delivered')
                            ? { ...msg, status: 'seen' }
                            : msg;
                    })
                );
            }
        }
    }, [selectedUser, authUser]);






    useEffect(() => {
        if (socket && authUser?.username) {



            socket.on('receiveMessage', ({ message, status }) => {
                setMessages(prev => [
                    ...prev,
                    message
                ]);
            });
            socket.on('selectedUser', (value) => {
                setSelectedUser(value);
            })

            return () => {
                socket.off('receiveMessage');
                socket.off('selectedUser');
            };
        }
    }, [socket, authUser?.username]);

    const handleInput = async () => {
        if (!newmsg.message.trim()) {
            alert("Please enter a message");
            return;
        }

        const messageToSend = {
            message: newmsg.message,
            senderName: authUser.username,
            receiverName: "admin",
            status: 'sent'
        };

        if (socket) {

            socket.emit('sendMessage', { to: 'admin', message: newmsg.message, status: 'sent' });
        }

        const data = await sendMsg({ MSG: messageToSend, senderName: authUser.username, reciverName: 'admin' });
        setMessages(prev => [...prev, data]);
        setNewmsg(prev => ({ ...prev, message: "" }));
    };

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatDateHeader = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday =
            messageDate.toDateString() === today.toDateString();
        const isYesterday =
            messageDate.toDateString() === yesterday.toDateString();

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
        <div className="fixed bg-[#fff] rounded-xl shadow-lg flex flex-col pb-[10px] overflow-hidden
    md:w-[400px] md:h-[600px] w-screen h-screen bottom-0 right-0 md:bottom-5 md:right-5  z-50">

            <div className="bg-[#007bff] text-white p-4 rounded-tl-[10px] rounded-tr-[10px] flex justify-between items-center">
                <h2>Chat with us</h2>
                <button className='bg-transparent border-0 text-white text-[20px] cursor-pointer' onClick={toggle}>X</button>
            </div>

            {authUser ? (
                <>
                    <div className="flex-grow overflow-y-auto p-[10px] mb-[50px] flex flex-col gap-[10px]">
                        {Array.isArray(messages) &&
                            messages.map((item, index) => {
                                if (!item || typeof item !== "object") return null;

                                const messageDate = new Date(item.createdAt).toDateString();
                                const showDateHeader = messageDate !== lastDate;
                                if (showDateHeader) lastDate = messageDate;
                                return (
                                    <>
                                        {showDateHeader && (
                                            <div className="flex justify-center my-2">
                                                <div className="bg-slate-400 rounded-md px-3 py-1 text-xs text-white">
                                                    {formatDateHeader(item.createdAt)}
                                                </div>
                                            </div>
                                        )}
                                        <div key={index} className={`p-[10px] rounded-[10px] max-w-[60%] flex justify-center items-center break-words mb-[10px] ${item.senderName === authUser.username ? "bg-[#007bff] text-white flex self-end justify-end items-center" : "bg-[#f1f1f1] text-black self-start flex justify-center items-center"}`}>
                                            <p>{item.message}</p>
                                            <span className='ml-3 text-[10px] mt-3'>{formatTime(item.createdAt)}</span>
                                            {item.senderName === authUser.username && (
                                                <span className="text-[12px] ml-[8px] inline-block mt-2">
                                                    {item.status === 'sent' && '✓'}
                                                    {item.status === 'delivered' && '✓✓'}
                                                    {item.status === 'seen' && <span style={{ color: 'black' }}>✓✓</span>}
                                                </span>
                                            )}

                                        </div>
                                    </>
                                );
                            })}


                        <div ref={messageEndRef} />
                    </div>
                    <div className="border-t p-2 flex gap-2">
                        <input
                            type="text"
                            value={newmsg.message}
                            placeholder="Type your message..."
                            className='flex-1 border-2 border-black rounded-lg p-2'
                            onChange={(e) => setNewmsg({ ...newmsg, message: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleInput()
                                }
                            }}
                        />
                        <button onClick={handleInput} className='w-[80px] bg-blue-500 text-white rounded-lg'>Send</button>
                    </div>
                </>
            ) : (
                <UserForm />
            )}
        </div>
    );
};

export default ChatBox;

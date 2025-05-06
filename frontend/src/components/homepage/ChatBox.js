import React, { useEffect, useRef, useState } from 'react';
import UserForm from './UserForm';
import useGetMsg from '../../hooks/useGetMsg';
import useSentMsg from '../../hooks/useSentMsg';
import { useAuthContext } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';

const ChatBox = ({ toggle }) => {

    const { socket, setSeenMessage } = useSocketContext();
    const { getMsg } = useGetMsg();
    const { sendMsg } = useSentMsg();
    const { authUser } = useAuthContext();
    // const [selectedUser, setSelectedUser] = useState();
    const [messages, setMessages] = useState([]);
    const [newmsg, setNewmsg] = useState({ user: 'sent', message: '' });
    const messageEndRef = useRef(null);
    const containerRef = useRef(null);
    let selectedUser;

    const adminPic = <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="M11.77 20v-1H19v-7.446q0-2.81-2.066-4.693Q14.867 4.977 12 4.977T7.066 6.861T5 11.554v5.696H3v-4.706h1l.017-1.224q.027-1.57.68-2.905t1.744-2.323t2.524-1.54T12.001 4t3.032.552t2.513 1.538t1.735 2.32t.702 2.895l.017 1.24h1v4.705h-1V20zm-2.385-6.461q-.31 0-.54-.21t-.23-.52t.23-.531t.54-.22q.31 0 .539.215q.23.216.23.535q0 .31-.23.52t-.54.21m5.232 0q-.31 0-.54-.21t-.23-.52t.23-.53t.54-.22t.539.215t.23.535q0 .31-.23.52t-.54.21M6.718 11.95q-.136-2.246 1.447-3.829q1.582-1.583 3.887-1.583q1.935 0 3.43 1.163t1.827 3.055q-1.987-.025-3.688-1.014t-2.61-2.75q-.362 1.731-1.505 3.034q-1.144 1.303-2.788 1.924" /></svg>

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const updateMessages = [...messages];
            const seenMessages = [];

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const _id = entry.target.dataset.id;
                    const index = updateMessages.findIndex((msg) => msg._id === _id);
                    if (
                        index !== -1 &&
                        updateMessages[index].status !== 'seen' &&
                        updateMessages[index].senderName === 'admin'
                    ) {
                        updateMessages[index].status = 'seen';
                        seenMessages.push({ _id: updateMessages[index]._id });
                    }
                }
            });

            if (seenMessages.length > 0) {
                setSeenMessage(seenMessages)
            }
        }, {
            root: containerRef.current,
            threshold: 1.0,
        });

        const timeout = setTimeout(() => {
            const messageElements = containerRef.current.querySelectorAll('#message');
            messageElements.forEach((el) => observer.observe(el));
        }, 300);

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [messages]);


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
                selectedUser = value;
            })
            socket.on('seen-Message', (value) => {
                setMessages(prev => prev.map(msg => value.includes(msg._id) ? { ...msg, status: 'seen' } : msg))
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
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
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
    md:w-[400px] md:h-[600px] w-screen h-screen bottom-0 right-0 md:bottom-5 md:right-5  z-50 duration-500">

            <div className="bg-[#007bff] text-white p-4 rounded-tl-[10px] rounded-tr-[10px] flex justify-between items-center">
                <h2>Chat with us</h2>
                <button className='bg-transparent border-0 text-white text-[20px] cursor-pointer' onClick={toggle}>X</button>
            </div>

            {authUser ? (
                <>
                    <div ref={containerRef} className="flex-grow overflow-y-auto p-[10px] mb-[50px] flex flex-col gap-[10px]">
                        {Array.isArray(messages) &&
                            messages.map((item, index) => {
                                if (!item || typeof item !== "object") return null;

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
                                            id="message"
                                            className={`flex items-end min-w-[40%] gap-2 ${item.senderName !== 'admin' ? 'self-end flex-row-reverse' : 'self-start'
                                                }`}
                                        >
                                            {item.senderName === 'admin' && (
                                                adminPic
                                            )}

                                            <div
                                                className={`${item.senderName !== 'admin'
                                                        ? 'bg-[#007bff] text-white'
                                                        : 'bg-[#e4e6eb] text-black'
                                                    } rounded-[10px] px-3 py-2 max-w-[60%] min-w-[30%]`}
                                            >
                                                <p className="text-sm">{item.message}</p>
                                                <span className="text-[10px] block text-right whitespace-nowrap">
                                                    {formatTime(item.createdAt)}
                                                    {item.senderName !== 'admin' && (
                                                        <span className="ml-1">
                                                            {item.status === 'sent' && '✓'}
                                                            {item.status === 'delivered' && '✓✓'}
                                                            {item.status === 'seen' && <span style={{ color: 'black' }}>✓✓</span>}
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

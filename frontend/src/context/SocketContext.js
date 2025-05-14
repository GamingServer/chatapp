
import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
}
export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [allUser, setAllUser] = useState([]);
    const { authUser, isAdmin } = useAuthContext();
    const [selectedUser, setSelectedUser] = useState();
    const [lastMsg, setLastMsg] = useState();
    const [seenMessages, setSeenMessage] = useState();
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const [onlineUser, setOnlineUser] = useState([]);

    useEffect(() => {
        setInterval(() => {
            if (isAdmin) {
                fetch('http://localhost:8080/api/messages/last/msg', {
                    credentials: 'include'
                }).then((value) => {
                    value.json().then((data) => {
                        setLastMsg(data);
                    });
                })
            }
        }, 1000)
    }, [isAdmin, allUser])



    useEffect(() => {
        if (authUser || isAdmin) {
            const socket = io(`http://localhost:8080`);

            if (authUser && isAdmin) {
                socket.emit('join', authUser.username);
                socket.emit('join', 'admin')
                socket.on('admin-online', (value) => {
                    console.log(value)
                })
            } else if (authUser) {
                socket.emit('join', authUser.username);
                socket.on('admin-online', (value) => {
                    setIsAdminOnline(value)
                })
                socket.emit('admin-online', {}, (value) => {
                    setIsAdminOnline(value)
                })
            } else {
                socket.emit('join', 'admin')
                socket.on('new-user', (value) => {
                    setAllUser(prev => [...prev, value])
                })

                socket.on('online-user', (value) => {
                    setOnlineUser(value)
                })

                socket.emit('online-user', {}, (value) => {
                    setOnlineUser(value);
                })
                
            }
            setSocket(socket)
            return () => socket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser, isAdmin]);


    useEffect(() => {
        if (selectedUser && isAdmin) {
            socket.emit('selectedUser', selectedUser)
        }
    }, [selectedUser])

    useEffect(() => {
        if (selectedUser) {
            socket.emit('selectedUser', selectedUser.name)
        }
    }, [selectedUser])

    useEffect(() => {
        if (seenMessages) {
            socket.emit('seen-Message', seenMessages);
        }
    }, [seenMessages])



    return <SocketContext.Provider value={{ onlineUser, seenMessages, setSeenMessage, socket, setSelectedUser, selectedUser, allUser, setAllUser, isAdminOnline, lastMsg, setLastMsg }}>{children}</SocketContext.Provider>
}
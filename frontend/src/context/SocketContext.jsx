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
    const [isAdminOnline, setIsAdminOnline] = useState(false);

    useEffect(() => {
        setInterval(() => {
            if (isAdmin) {
                fetch('http://localhost:8080/api/messages/last/msg').then((value) => {
                    value.json().then((data)=>{
                        setLastMsg(data);
                    });
                })
            }
        }, 1000)
    }, [isAdmin, allUser])



    useEffect(() => {
        if (authUser) {
            const socket = io(`http://localhost:8080`);
            socket.emit('join', authUser.username);
            socket.on('admin-online', (value) => {
                console.log(value)
            })
            setSocket(socket);

            return () => socket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
        if (isAdmin) {
            const socket = io('http://localhost:8080');
            socket.emit('join', "admin");
            socket.on('new-user', (value) => {
                setAllUser(prev => [...prev, value]);
            });

            socket.on('receiveMessage', (obj) => {
                console.log("last msg", lastMsg)
                console.log('obg', obj)
                // setLastMsg(prevMessages=> prevMessages.map(msg=>{
                //     if(msg.senderName === obj.senderName || obj.senderName === msg.reciverName){
                //         return {...msg , message:obj.message}
                //     }
                //     return msg;
                // }))
            })

            setSocket(null);
            setSocket(socket);
            return () => socket.close();
        } else {

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

    return <SocketContext.Provider value={{ socket, setSelectedUser, selectedUser, allUser, setAllUser, isAdminOnline, lastMsg, setLastMsg }}>{children}</SocketContext.Provider>
}
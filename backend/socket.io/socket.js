const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const MessageDb = require('../modules/schema/massage.modul')
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});


const user = new Map();
const msgID = new Map();
let selectedUser = null;
let onlineUsers = [];
const seenMsg = [];

const getAdminToken = ({ id }) => {
    return user.get(id);
};

const isUserOnline = ({ id }) => {
    return user.get(id);
};

let admin_online = false;
const getSelectedUser = () => selectedUser;

const getOnlineUsers = () => onlineUsers;

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        user.set(username, socket.id);
        msgID.set(socket.id, username);
        onlineUsers.push(username);
        socket.broadcast.emit('online-user', onlineUsers)
        if (user.get('admin') || username === 'admin') {
            admin_online = true;
            socket.broadcast.emit('admin-online', admin_online);
        }
    });

    socket.on('selectedUser', (value) => {
        selectedUser = value;
        socket.broadcast.emit('selectedUser', value);
    });


    socket.on('seen-Message', async (value) => {
        let user = []
        value.map((item) => user.push(item._id))
        const res = await MessageDb.updateMany({ _id: { $in: user } }, { $set: { status: 'seen' } })
        socket.broadcast.emit('seen-Message', user)
    })

    socket.on('online-user',(value , callback)=>{
        callback(onlineUsers)
    })

    socket.on('admin-online', (data, callback) => {
        callback(admin_online);
    })
    socket.on('disconnect', () => {
        const username = msgID.get(socket.id);

        if (username) {
            user.delete(username);
            msgID.delete(socket.id);
            onlineUsers = onlineUsers.filter((user) => user !== username);
            socket.broadcast.emit('online-user', onlineUsers)
            if (username === 'admin') {
                selectedUser = null;
                admin_online = false;
                socket.broadcast.emit('admin-online',admin_online)
            }
        }
    });
});

module.exports = {
    app,
    server,
    io,
    getOnlineUsers,
    getAdminToken,
    isUserOnline,
    getSelectedUser,
    seenMsg
};

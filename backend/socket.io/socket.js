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

const getSelectedUser = () => selectedUser;

const getOnlineUsers = () => onlineUsers;

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        user.set(username, socket.id);
        msgID.set(socket.id, username);
        
        if (user.get('admin') || username === 'admin') {
            socket.broadcast.emit('admin-online', true);
        }


    });

    socket.on('selectedUser', (value) => {
        selectedUser = value;
        socket.broadcast.emit('selectedUser', value);
    });

    socket.on('online-userName', (username) => {
        if (!onlineUsers.includes(username)) {
            onlineUsers.push(username);
            socket.broadcast.emit('online-userName', username);
        }
    });

    socket.on('offline-userName', (username) => {
        onlineUsers = onlineUsers.filter(user => user !== username);
    });
    socket.on('seen-Message', async (value) => {
        let user = []
        console.log(value)
        value.map((item) => user.push(item._id))
        const res = await MessageDb.updateMany({ _id: { $in: user } }, { $set: { status: 'seen' } })
        socket.broadcast.emit('seen-Message',user)
    })

    socket.on('disconnect', () => {
        const username = msgID.get(socket.id);

        if (username) {
            user.delete(username);
            msgID.delete(socket.id);
            onlineUsers = onlineUsers.filter(user => user !== username);

            if (username === 'admin') {
                selectedUser = null;
                socket.broadcast.emit('admin-online', false);
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

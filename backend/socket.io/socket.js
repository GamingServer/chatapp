const { Server } = require('socket.io')
const http = require('http');
const express = require('express');
const { console } = require('inspector');
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});


// Example usage:
const user = new Map();
const msgID = new Map();
let selectedUser = null

let onlineUser = [];

const getAdminTocken = ({ id }) => {
    return user.get(id);
};

const isInUserOnline = ({ id }) => {
    console.log(id)
    return user.get(id);
}

const getSelectedUser = () => {
    return selectedUser;
}

const getOnlineUser = () => {
    return onlineUser;
}


io.on('connection', async (socket) => {
    socket.on('join', (username) => {
        user.set(username, socket.id)
        msgID.set(socket.id, username)
        if (user.get('admin') || username == 'admin') {
            socket.broadcast.emit('admin-online', true)
        }
    })

    socket.on('selectedUser', (value) => {
        selectedUser = value;
        socket.broadcast.emit('selectedUser',value)
    })

    socket.on('online-userName', (value) => {
        onlineUser.push(value)
        socket.broadcast.emit('online-userName',value)
    })
    socket.on('offline-userName', (value) => {
        onlineUser = onlineUser.filter(item => item != value)
    })



    socket.on('disconnect', () => {
        for (const [username, id] of user.entries()) {
            if (id === socket.id) {
                user.delete(username)
                onlineUser = onlineUser.filter(item => item != username)
                if (username == 'admin') {
                    socket.broadcast.emit('admin-online', false)
                    selectedUser = null
                }
                break
            }

        }
    })

});


module.exports = { app, io, server, getOnlineUser, getAdminTocken, isInUserOnline, getSelectedUser }
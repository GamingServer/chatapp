const conversations = require('../../modules/schema/conversation')
const messageModule = require('../../modules/schema/massage.modul');
const pointCategory = require('../../modules/schema/pointCategory');
const categoryModule = require('../../modules/schema/pointCategory');
const pointTable = require('../../modules/schema/pointTable');
const { io, getAdminToken } = require('../../socket.io/socket')
const firstChoice = async ({ reciverName, token, io, message, choice_id }) => {

    if (choice_id) {
        await messageModule.findOneAndUpdate(
            { _id: choice_id },
            { $set: { selectedChoice: message } },
            { new: true }
        )
    }

    let conversation = await conversations.findOne({
        participants: { $all: ['admin', reciverName] }
    })
    if (!conversation) {
        conversation = await conversations.create({
            participants: ['admin', reciverName],
        })
    }
    let choice = [
        'Know Score',
        'Redeem Points',
        'give Scorecard'
    ]
    let newMessage;
    if (choice.includes(message)) {
        if (message.toLowerCase() === 'know score') {
            const score = await pointTable.find({
                playerName: reciverName
            })
            const totalPoints = score.reduce((sum, item) => sum + item.point, 0);
            console.log(totalPoints);
            newMessage = new messageModule({
                senderName: 'admin',
                receiverName: reciverName,
                message: `Point : ${totalPoints}`
            })
        }
        else if (message.toLowerCase() === 'redeem points') {
            const data = await categoryModule.find();
            const category = data.map(item => item.category)
            newMessage = new messageModule({
                senderName: 'admin',
                receiverName: reciverName,
                message: 'Select Point Category',
                choice: category,
                isChoice: true,
            })

        }
    } else if (choice_id) {
        const data = await categoryModule.find();
        const category = data.map(item => item.category)
        if (category.includes(message)) {
            newMessage = new messageModule({
                senderName: 'admin',
                receiverName: reciverName,
                message: 'Send Image',
                isChoice: false,
                type: 'category',
                category: message
            })
        }
    }
    else {
        newMessage = new messageModule({
            senderName: 'admin',
            receiverName: reciverName,
            message: 'select one of the options',
            choice: choice,
            isChoice: true,
        })
    }



    if (newMessage) {
        conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()])
        io.to(token).emit('receiveMessage', { message: newMessage });
    }


}

module.exports = {
    firstChoice
}
const conversations = require('../../modules/schema/conversation')
const messageModule = require('../../modules/schema/massage.modul')

const firstChoice = async ({ reciverName, token, io, message }) => {
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
            newMessage = new messageModule({
                senderName:'admin',
                receiverName:reciverName,
                message:'Point : 30'
            })
        }
    } else {
         newMessage = new messageModule({
            senderName: 'admin',
            receiverName: reciverName,
            message:'select one of the options',
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
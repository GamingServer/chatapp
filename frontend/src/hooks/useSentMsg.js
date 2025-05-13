const useSentMsg = () => {

    const sendMsg = async ({ senderName, reciverName , MSG }) => {
        try {
            const response = await fetch(`http://localhost:8080/api/messages/sendmsg/${senderName}/${reciverName}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify(MSG),
                credentials:'include'
            });
            const data = await response.json();
            if (response.status === 200) {
                return data
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    return {sendMsg};
}

module.exports = useSentMsg;
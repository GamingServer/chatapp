const { useState } = require("react");

const useGetMsg = () => {

    const getMsg = async ({ senderName, reciverName }) => {
        try {
            const response = await fetch(`http://localhost:8080/api/messages/getmsg/${senderName}/${reciverName}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
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
    return {getMsg};
}

module.exports = useGetMsg;
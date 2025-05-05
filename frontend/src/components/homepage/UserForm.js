import React, { useState } from 'react'
import './ChatBox.css'
import { useAuthContext } from '../../context/AuthContext'

const UserForm = () => {
    const {setAuthUser}  = useAuthContext();
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        phoneNumber: ""
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8080/api/user/userForm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (response.status === 200) {
            alert(data.message);
            setAuthUser(data);
            localStorage.setItem('user-data', JSON.stringify(userData));
        } else {
            alert(data.message);
        }
    }

    return (
        <div className='user-form'>
            <input type="text" placeholder="Enter your name" className='form-input' onChange={(e) => setUserData({ ...userData, username: e.target.value })} />
            <input type="email" placeholder="Enter your email" className='form-input' onChange={(e) => setUserData({ ...userData, email: e.target.value })} />
            <input type="number" placeholder="Enter your phone number" className='form-input' onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default UserForm

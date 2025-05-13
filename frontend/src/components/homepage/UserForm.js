import React, { useState } from 'react';
import './ChatBox.css';
import { useAuthContext } from '../../context/AuthContext';
import OtpPage from './otpPage';

const UserForm = () => {
    const { setAuthUser } = useAuthContext();
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        phoneNumber: ""
    });
    const [otpPageVisible, setOtpPageVisible] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8080/api/user/genOtp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (response.status === 200) {
            alert(data.message);
            setOtpPageVisible(true);
        } else {
            alert(data.message);
        }
    };

    const handleOtpSubmit = async (e) => {
        console.log(e)
        // e.preventDefault();
        const response = await fetch("http://localhost:8080/api/user/verifyOtp",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: userData.username,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    otp: e
                })
            }
        )
        const data = await response.json();
        console.log(data)
        if (response.status === 200) {
            localStorage.setItem('user-data', JSON.stringify(data));
            setAuthUser(data);
            setOtpPageVisible(false);
            alert(data.message);
        } else {
            alert(data.message);
        }


    }

    return (
        <>
            {otpPageVisible ? (
                <OtpPage onSubmit={handleOtpSubmit} />
            ) : (
                <div className='user-form'>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className='form-input'
                        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className='form-input'
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Enter your phone number"
                        className='form-input'
                        onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                    />
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            )}
        </>
    );
};

export default UserForm;

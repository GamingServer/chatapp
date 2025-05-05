import React, { useState } from 'react'
import './LoginPage.css'
import Cookies from 'js-cookie';
const LoginPage = () => {

    const [input,setInput] = useState({
        username: "",
        password: ""
    })

    const submit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8080/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(input)
        });
        const data = await response.json();
        if (response.status === 200) {
            alert(data.message);
            Cookies.set("admin",true);
            window.location.href = "/admin";
        } else {
            alert(data.message);
        }
    }

    return (
        <div className='main'>
            <div className='login-container'>
                <h2>Login</h2>
                <form className='login-form'>
                    <div className='form-group'>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" required onChange={(e)=>{
                            setInput({...input,username: e.target.value})
                        }} />
                    </div>
                    <div className='form-group'>
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required onChange={(e)=>{
                            setInput({...input,password: e.target.value})
                        }}/>
                    </div>
                    <button type="submit" onClick={submit}>Login</button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage

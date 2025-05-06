import { useEffect, useState } from 'react'
import Navbar from './navbar'
import FlottingButton from './FlottingButton'
import ChatBox from './ChatBox'
import { useSocketContext } from '../../context/SocketContext'
import { useAuthContext } from '../../context/AuthContext'
const HomePage = () => {
  // const {authUser} = useAuthContext();
  // const { socket } = useSocketContext();

  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    
    setIsOpen(!isOpen);
  }
  // useEffect(()=>{
  //   if (!socket || !authUser) return;
  //   if (isOpen ) {
  //     socket.emit('online-userName',authUser.username)
  //    }
  //    else{
  //     socket.emit('offline-userName',authUser.username)
  //    }
  // },[isOpen,authUser])
  return (
    <>
      <Navbar />
      {isOpen && <ChatBox toggle={toggle}/>}
      {!isOpen && <FlottingButton toggle={toggle} />}
    </>
  )
}

export default HomePage;
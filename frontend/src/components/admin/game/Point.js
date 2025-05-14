import React, { useEffect, useState } from 'react'
import { useSocketContext } from '../../../context/SocketContext';

const Point = () => {

  const { socket } = useSocketContext();




  const [pendingpoints, setPendingPoints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  useEffect(() => {
    fetch('http://localhost:8080/api/category/get/pendingpoint')
      .then((res) => res.json())
      .then((data) => {
        setPendingPoints(data.pendingPoint);
      });

    socket.on('aproveCategory', (data) => {
      setPendingPoints((prev) => [...prev, data]);
    });

    // Optional: Clean up socket listener on unmount
    return () => {
      socket.off('aproveCategory');
    };
  }, []);



  return (
    <div className='flex flex-row h-[100%]'>
      <div className='w-[30%] border-r-2 h-[100%]'>
        <header className='text-lg font-bold text-gray-600 p-4 flex flex-row justify-between border-b-2'>
          <h2>Pending Point</h2>
        </header>
        <div className="flex flex-col overflow-y-auto">
          {pendingpoints.map((item) => (
            <div
              key={item._id}
              className="m-2 border-[2px] border-black p-3 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedCategory(item)}
            >
              {item.playerName}
            </div>
          ))}
        </div>
      </div>
      <div className="w-[70%] h-[100%]">
        {selectedCategory ? (
          <div className="h-[100%] w-[100%]">
            <header className='text-lg font-bold text-gray-600 p-4 flex flex-row justify-between border-b-2'>
              <h2>{selectedCategory.playerName}</h2>

            </header>
            <div className='w-full h-full flex justify-center items-center flex-col gap-5'>
              <img src={`http://localhost:8080${selectedCategory.image}`} alt={'Imgae not found'} className='h-[400px] w-[400px]' />
              <button className='bg-blue-600 px-14 py-4 rounded-xl text-xl text-white' onClick={async () => {
                await fetch('http://localhost:8080/api/category/aprove/point', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ id: selectedCategory._id })
                })
                setSelectedCategory(null)
                setPendingPoints(prev =>
                  prev.filter(msg => msg._id !== selectedCategory._id)
                );
              }}>Aprove</button>
              <button className='bg-red-600 px-14 py-4 rounded-xl text-xl text-white'
                onClick={async () => {
                  await fetch('http://localhost:8080/api/category/aprove/point', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: selectedCategory._id, point: 0 })
                  })
                  setSelectedCategory(null)
                  setPendingPoints(prev =>
                    prev.filter(msg => msg._id !== selectedCategory._id)
                  );
                }}>reject</button>
            </div>
          </div>
        ) : (
          <div className="flex h-[100%] w-[100%] justify-center items-center">
            No Selected Category
          </div>
        )}
      </div>
    </div>
  )
}

export default Point
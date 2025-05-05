import React from 'react'
import { Link } from 'react-router-dom'

const contect = () => {
  return (
    <div className='h-screen bg-gradient-to-t from-[#fbc2ab] to-[#a6e1ee]'>
      <header className='bg-white'>
        <nav className=' flex items-center justify-between w-[92%] mx-auto'>
          <h2 className='text-[25px]'>hello world</h2>
          <div className='absolute bg-white min-h-[60vh] left-[0] top-[9%] w-full flex items-center   '>
            <ul className='flex items-center gap-[4vw] md:flex-row flex-col'>
              <li className='text-base hover:text-gray-500'>
                <Link to={'#'} >home</Link>
              </li>
              <li className='text-base hover:text-gray-500'>
                <Link to={'#'} >Product</Link>
              </li>
              <li className='text-base hover:text-gray-500'>
                <Link to={'#'} >contect</Link>
              </li>
              <li className='text-base hover:text-gray-500'>
                <Link to={'#'} >Blog</Link>
              </li>
              <li className='text-base hover:text-gray-500'>
                <Link to={'#'} >about</Link>
              </li>
            </ul>
          </div>
            <button className='bg-blue-500 px-5 py-2 rounded-full text-lg hover:bg-blue-800 text-white'>Sign In</button>
        </nav>
      </header>
    </div>
  )
}

export default contect

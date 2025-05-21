import { useState } from 'react'
import Category from './category';
import PlayerState from './PlayerState';
import Round from './Round';
import { AnimatePresence, motion } from 'framer-motion';
import AdminRole from './adminRole';

const GameMainPage = () => {

    const [selectedMenu, setSelectedMenu] = useState(3);

    return (
        <div className='h-screen flex flex-col'>
            <header className=''>
                <nav className='min-h-[50px] pb-1 bg-blue-600 flex justify-between items-center px-10'>
                    <h2 className='text-[25px] text-white'>Game Page</h2>
                    <ul className='flex flex-row gap-10 '>
                        <li className={'cursor-pointer  hover:text-black hover:text-lg duration-200 ' + (selectedMenu === 1 ? "text-black text-lg" : 'text-white')}
                            onClick={() => {
                                setSelectedMenu(1)
                            }}>
                            category
                        </li>
                        <li className={'cursor-pointer  hover:text-black hover:text-lg duration-200 ' + (selectedMenu === 2 ? "text-black text-lg" : 'text-white')}
                            onClick={() => {
                                setSelectedMenu(2)
                            }}>
                            Player State
                        </li>
                        <li className={'cursor-pointer  hover:text-black hover:text-lg duration-200 ' + (selectedMenu === 3 ? "text-black text-lg" : 'text-white')}
                            onClick={() => {
                                setSelectedMenu(3)
                            }}>
                            Round
                        </li>
                        <li className={'cursor-pointer  hover:text-black hover:text-lg duration-200 ' + (selectedMenu === 4 ? "text-black text-lg" : 'text-white')}
                            onClick={() => {
                                setSelectedMenu(4)
                            }}>
                            Admin Role
                        </li>
                    </ul>
                </nav>
            </header>
            <div className="h-full relative overflow-hidden">
                <AnimatePresence mode='wait' >
                    {selectedMenu === 4 ? (
                        <motion.div
                            key="category"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full h-full"
                        >
                            <AdminRole/>
                        </motion.div>
                    ) : selectedMenu === 2 ? (
                        <motion.div
                            key="player"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full h-full"
                        >
                            <PlayerState />
                        </motion.div>
                    ) : selectedMenu === 3 ? (
                        <motion.div
                            key="round"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full h-full"
                        >
                            <Round />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="point"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full h-full"
                        >
                            <Category />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>

    )
}

export default GameMainPage

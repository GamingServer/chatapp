import { useEffect, useState } from "react";
import { useSocketContext } from '../../../context/SocketContext';

const PlayerState = () => {
  const [isApprovePage, setIsApprovePage] = useState(0);
  const [approveList, setApproveList] = useState([]);
  const [pendingpoints, setPendingPoints] = useState([]);
  const { socket } = useSocketContext();



  useEffect(() => {
    try {
      fetch('http://localhost:8080/api/category/get/aprovepoint')
        .then(async (res) => {
          const data = await res.json();
          setApproveList(data);
        })
      fetch('http://localhost:8080/api/category/get/pendingpoint')
        .then((res) => res.json())
        .then((data) => {
          setPendingPoints(data.pendingPoint);
          console.log(data)
        });
      socket.on('aproveCategory', (data) => {
        setPendingPoints((prev) => [...prev, data]);
      });

      return () => {
        socket.off('aproveCategory');
      };
    }
    catch (error) {
      console.error('Error fetching data:', error);
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-row">
      <div className="h-full w-[3%] border-r-2 bg-gray-100 flex flex-col items-center pt-5 gap-3">
        <div
          className={`bg-gray-300 rounded-md cursor-pointer p-1 ${isApprovePage === 0 ? 'border-l-[3px] border-blue-600' : ''}`}
          onClick={() => setIsApprovePage(0)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
            <path fill="#2664eb" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z" />
          </svg>
        </div>
        <div
          className={`bg-gray-300 rounded-md cursor-pointer p-1 ${isApprovePage === 1 ? 'border-l-[3px] border-red-600' : ''}`}
          onClick={() => setIsApprovePage(1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
            <path fill="#eb262b" d="M14.55 16.55L11 13V8h2v4.175l2.95 2.95zM11 6V4h2v2zm7 7v-2h2v2zm-7 7v-2h2v2zm-7-7v-2h2v2zm8 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8" />
          </svg>
        </div>
      </div>
      <div className="flex-grow">
        {isApprovePage === 0 ? (
          <div className="w-full h-[93%] overflow-y-auto border border-gray-400">
            <table className="w-full table-fixed">
              <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                <tr>
                  <th className="border border-gray-400 px-4 py-2 w-[20%]">Player Name</th>
                  <th className="border border-gray-400 px-4 py-2 w-[30%]">Category</th>
                  <th className="border border-gray-400 px-4 py-2 w-[15%]">Point</th>
                  <th className="border border-gray-400 px-4 py-2 w-[15%]">Accepted</th>
                  <th className="border border-gray-400 px-4 py-2 w-[20%]">Image</th>
                </tr>
              </thead>
              <tbody>
                {approveList.length > 0 ? (
                  approveList.map((item) => (
                    <tr key={item._id}>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[20%]">{item.playerName}</td>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[30%]">{item.category}</td>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[15%]">{item.point}</td>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[15%]">
                        {item.accepted && item.point > 0 ? 'Yes' : 'No'}
                      </td>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[20%]">
                        <a
                          href={'http://localhost:8080' + item.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600"
                        >
                          Image
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="border border-gray-400 px-4 py-2 text-center">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full h-[93%] overflow-y-auto border border-gray-400">
            <table className="w-full table-fixed">
              <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                <tr>
                  <th className="border border-gray-400 px-4 py-2 w-[20%]">Player Name</th>
                  <th className="border border-gray-400 px-4 py-2 w-[30%]">Category</th>
                  <th className="border border-gray-400 px-4 py-2 w-[15%]">Pending Points</th>
                  <th className="border border-gray-400 px-4 py-2 w-[15%]">Accept</th>
                  <th className="border border-gray-400 px-4 py-2 w-[20%]">Image</th>
                </tr>
              </thead>
              <tbody>
                {pendingpoints.length > 0 ? (
                  pendingpoints.map((item) => (
                    <tr key={item._id}>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[20%]">{item.playerName}</td>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[30%]">{item.category}</td>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[15%]">{item.pendingPoint}</td>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[15%]">
                        {!item.accepted && (
                          <div className="flex flex-row gap-3 justify-center items-center">
                            <button className=" w-[40%] flex items-center justify-center rounded-lg bg-green-600"
                              onClick={async () => {
                                await fetch('http://localhost:8080/api/category/aprove/point', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ id: item._id })
                                })
                                setPendingPoints(prev =>
                                  prev.filter(msg => msg._id !== item._id)
                                );
                                const update = item;
                                update.accepted = true;
                                update.point = update.pendingPoint
                                setApproveList(prev => [...prev, update])
                              }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#ffffff" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z" /></svg>
                            </button>
                            <button className=" w-[40%] flex items-center justify-center rounded-lg bg-red-600" onClick={async () => {
                              await fetch('http://localhost:8080/api/category/aprove/point', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ id: item._id, point: 0 })
                              })
                              setPendingPoints(prev =>
                                prev.filter(msg => msg._id !== item._id)
                              );
                              const update = item;
                              update.accepted = true;
                              setApproveList(prev => [...prev, update])
                            }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path fill="#ffffff" d="M18 6L6 18M6 6l12 12" stroke="#ffffff" strokeWidth="2" />
                              </svg>                            </button>
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-400 px-4 py-2 text-center w-[20%]">
                        <a
                          href={'http://localhost:8080' + item.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600"
                        >
                          Image
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="border border-gray-400 px-4 py-2 text-center">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerState;
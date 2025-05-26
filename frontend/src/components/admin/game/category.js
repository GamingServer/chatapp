import { useEffect, useState } from "react"

const Category = () => {
  const [categoryList, setCategoryList] = useState([
    // {
    //   id: 1,
    //   category: 'H2H',
    //   round: 3,
    //   players: [
    //     { name: 'Alice', point: 80 },
    //     { name: 'Bob', point: 60 },
    //     { name: 'Charlie', point: 90 }
    //   ]
    // },
    // {
    //   id: 2,
    //   category: 'Team Meeting',
    //   round: 2,
    //   players: [
    //     { name: 'David', point: 50 },
    //     { name: 'Eve', point: 70 }
    //   ]
    // },
    // {
    //   id: 3,
    //   category: 'Team Sync',
    //   round: 1,
    //   players: []
    // }
  ]);

  useEffect(() => {
    fetch('http://localhost:8080/api/category/get').then((res) => {
      return res.json()
    }).then((data) => {
      setCategoryList(data);
    })
  }, [])


  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [editValue, setEditValue] = useState({ category: '', point: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ category: '', point: 0 });
  const [stats, setStats] = useState();


  const handleDelete = async (id) => {
    await fetch('http://localhost:8080/api/category/delete/' + id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    setCategoryList(prev => prev.filter(item => item.id !== id));
    setShowDeleteModal(false);
    if (selectedCategory && selectedCategory.id === id) {
      setSelectedCategory(null);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetch('http://localhost:8080/api/category/get/categorydata/' + selectedCategory.category).then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        } else {
          setStats()
        }

      })
    }

  }, [selectedCategory])

  const handleEdit = async () => {

    await fetch('http://localhost:8080/api/category/edit/' + currentEdit.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category: editValue.category, point: editValue.point })
    })

    setCategoryList(prev =>
      prev.map(item =>
        item.id === currentEdit.id ? { ...item, category: editValue.category } : item
      )
    );
    setShowEditModal(false);
    if (selectedCategory && selectedCategory.id === currentEdit.id) {
      console.log(selectedCategory)
      setSelectedCategory({ ...currentEdit, category: editValue.category, point: editValue.point });
    }
  };




  return (
    <div className='flex flex-row h-[100%]'>
      <div className='w-[30%] border-r-2 h-[100%]'>
        <header className='text-lg font-bold text-gray-600 p-4 flex flex-row justify-between border-b-2'>
          <h2>Category</h2>
          <button className='pt-1' onClick={() => setShowAddModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" /></svg>
          </button>
        </header>
        <div className="flex flex-col overflow-y-auto h-[90%]">
          {categoryList.map((item) => (
            <div
              key={item.id}
              className="m-2 border-[2px] border-black p-3 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedCategory(item)}
            >
              {item.category}
            </div>
          ))}
        </div>
      </div>

      <div className="w-[70%] h-[100%]">
        {selectedCategory ? (
          <div className="h-[100%] w-[100%]">
            <header className='text-lg font-bold text-gray-600 p-4 flex flex-row justify-between border-b-2'>
              <h2>{selectedCategory.category}</h2>
              <ul className="flex flex-row gap-3">
                <li onClick={() => {
                  setShowEditModal(true);
                  setCurrentEdit(selectedCategory);
                  setEditValue({ category: selectedCategory.category, point: selectedCategory.point });
                }} className="cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#2664eb" d="M3 21v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z" /></svg>
                </li>
                <li onClick={() => {
                  setShowDeleteModal(true);
                  setCurrentEdit(selectedCategory);
                }} className="cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#df1919" d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zm3-4q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17" /></svg>
                </li>
              </ul>
            </header>
            <div>
              {stats ? (
                <div className="p-4 space-y-2 text-sm">
                  {(() => {
                    return (
                      <>
                        <p><strong>Round No:</strong> {selectedCategory.round ?? 'N/A'}</p>
                        <p><strong>Total Players:</strong> {stats.totalPlayers ?? 'N/A'}</p>
                        <p><strong>Total Points:</strong> {stats.totalPoints ?? 'N/A'}</p>
                        <p><strong>Average Points:</strong> {stats.avgPoints ?? 'N/A'}</p>
                        <p><strong>Highest Points:</strong> {stats.highest?.point ?? 'N/A'} ({stats.highest?.player ?? 'N/A'})</p>
                        <p><strong>Lowest Points:</strong> {stats.lowest?.point ?? 'N/A'} ({stats.lowest?.player ?? 'N/A'})</p>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="p-4 text-sm text-gray-500">No player data available for this category.</div>
              )}


            </div>
          </div>
        ) : (
          <div className="flex h-[100%] w-[100%] justify-center items-center">
            No Selected Category
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center w-[300px]">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this category?</p>
            <div className="flex justify-around">
              <button
                onClick={() => handleDelete(currentEdit.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center w-[300px]">
            <h2 className="text-lg font-bold mb-4">Edit Category</h2>
            <input
              type="text"
              value={editValue.category}
              onChange={(e) => setEditValue({ ...editValue, category: e.target.value })}
              className="border p-2 w-full mb-4 rounded"
            />
            <input
              type="number"
              value={editValue.point}
              onChange={(e) => setEditValue({ ...editValue, point: e.target.value })}
              className="border p-2 w-full mb-4 rounded"
            />
            <div className="flex justify-around">
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center w-[300px]">
            <h2 className="text-lg font-bold mb-4">Add Category</h2>
            <input
              type="text"
              value={newCategory.category}
              onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
              className="border p-2 w-full mb-4 rounded"
              placeholder="Enter category name"
            />
            <input
              type="number"
              value={newCategory.point}
              onChange={(e) => setNewCategory({ ...newCategory, point: Number(e.target.value) })}
              className="border p-2 w-full mb-4 rounded"
              placeholder="Enter category point"
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={newCategory.isLimit}
                onChange={(e) => setNewCategory({ ...newCategory, isLimit: e.target.checked })}
                className="mr-2"
              />
              <label>Limit Players?</label>
            </div>
            {newCategory.isLimit && (
              <input
                type="number"
                value={newCategory.maxPlayerLimit}
                onChange={(e) => setNewCategory({ ...newCategory, maxPlayerLimit: Number(e.target.value) })}
                className="border p-2 w-full mb-4 rounded"
                placeholder="Enter max player limit"
                min="1"
              />
            )}
            <div className="flex justify-around">
              <button
                onClick={async () => {
                  if (newCategory.category.trim()) {
                    const payload = {
                      category: newCategory.category,
                      point: newCategory.point,
                      isLimit: newCategory.isLimit,
                      MaxPlayerLimit: newCategory.isLimit ? newCategory.maxPlayerLimit : 0,
                    };

                    const res = await fetch('http://localhost:8080/api/category/add', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(payload),
                    });

                    const data = await res.json();
                    if (res.ok) {
                      setCategoryList([...categoryList, data.newCategory]);
                      setNewCategory({ category: '', point: 0, isLimit: false, maxPlayerLimit: 0 });
                      setShowAddModal(false);
                    } else {
                      alert(data.message);
                    }
                  }
                }}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategory({ category: '', point: 0, isLimit: false, maxPlayerLimit: 0 });
                }}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Category;

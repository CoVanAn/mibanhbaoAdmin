import React, { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import Edit from '../Edit/Edit'

const List = ({ url }) => {

  const [list, setList] = useState([])

  const [edit, setEdit] = useState(false)

  const [currentItem, setCurrentItem] = useState(null)

  const fetchList = async () => {
    // const response = await axios.get('http://localhost:4000/api/food/list')
    const response = await axios.get(`${url}/api/food/list`)
    // toast.success(response.data.success)
    console.log(response.data)

    if (response.data) {
      setList(response.data)
      // setList(response.data.data)
    }
    else {
      toast.error("Error")
    }
  }

  const deleteItem = async (foodId) => {
    console.log(foodId)
    const response = await axios.post(`${url}/api/food/remove/`, { id: foodId })
    console.log(response.data)
    toast.success("Item Deleted Successfully")
    await fetchList()
    // const response = await axios.post(`${url}/api/food/re/${id}`)
  }

  const editItem = async (foodId) => {
    console.log(foodId)
    const item = list.find(item => item._id === foodId)
    setCurrentItem(foodId)
    setEdit(true)
    // const response = await axios.post(`${url}/api/food/edit/`, { id: foodId })
    console.log(response.data)
    // await fetchList()
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
    {edit ? <Edit setEdit={setEdit}/> : null}
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className='list-table'>
        <div className='list-table-format title'>
          <b>Image</b>
          <b>Name</b>
          {/* <b>Description</b> */}
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => (
          <div key={index} className='list-table-format'>
            <img src={`${url}/images/${item.image}`} alt={item.name} />
            <p>{item.name}</p>
            {/* <p>{item.description}</p> */}
            <p>{item.category}</p>
            <p>${item.price}</p>
            <div className='Action'>
              <p onClick={() => deleteItem(item._id)} className='cusor'>X</p>
              <p onClick={() => {editItem(item._id), setEdit(true)}} className='cusor'> <FontAwesomeIcon icon={faEdit} /> </p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}

export default List

import React, { useState } from 'react'
import './Orders.css'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import axios from 'axios'
import { assets } from "../../assets/assets.js"

const Orders = ({ url }) => {

  const [orders, setOrders] = useState([])


  const fetchAllOrders = async () => {
    const response = await axios.get(url + "/api/order/list")
    console.log(response.data.success)
    if (response.data) {
      setOrders(response.data.data)
      console.log(response.data.data)
    }
    else {
      toast.error("errer")
      // console.log(response.data.message)
    }
  }

  const statusHandler = async (e, id) => {
    const status = e.target.value
    const response = await axios.post(url + "/api/order/status", { orderId: id, status: status })
    if (response.data.success) {
      // toast.success(response.data.message)
      fetchAllOrders()
    }
    else {
      // toast.error(response.data.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className='order-list'>
        {orders.map((order, index) => (
          <div className='order-item' key={index}>
            <img src={assets.parcel_icon} alt="order" />
            <div>
              <p className='order-item-food'>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity
                  }
                  else {
                    return item.name + " x " + item.quantity + ", "
                  }
                })}
              </p>
              <p className='order-item-name'>{order.address.firstName + " " + order.address.lastName}</p>
              <div className='order-item-address'>
                <p>{order.address.street}</p>
                <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ', ' + order.address.zipcode}</p>
              </div>
              <p className='order-item-phone'>Phone: {order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p className='order-item-amount'>Amount: ${order.amount}</p>
            <select onChange={(event)=>statusHandler(event, order._id)} value={order.status}>
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders

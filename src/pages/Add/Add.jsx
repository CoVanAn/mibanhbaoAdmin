import React, { useEffect, useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Add = ({url}) => {

    const [image, setImage] = useState(false)
    const [data, setData] = useState({
        name: '',
        description: '',
        category: 'Salad',
        price: ''
    })

    const onChangeHandler = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    useEffect(() => {
        console.log(data)
    }, [data])

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('description', data.description)
        formData.append('category', data.category)
        formData.append('price', Number(data.price))
        formData.append('image', image)
        const response = await axios.post(`${url}/api/food/add`, formData)

        // const response = await axois.post('http://localhost:4000/api/food/add', formData)

        if (response.data.success) {
            setData({
                name: '',
                description: '',
                category: 'Salad',
                price: ''
            })
            setImage(false)
            // toast.success("Product Added")
            toast.success(response.data.success)
        }
        else {
            
            toast.error("Error Occured")
        }
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} />
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                </div>
                <div className="add-product-name flex-col">
                    <p>Product Name</p>
                    <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required/>
                </div>
                <div className="add-product-description flex-col">
                    <p>Product Description</p>
                    <textarea onChange={onChangeHandler} value={data.description} type="text" name='description' rows="6" placeholder='Type here' required />
                </div>
                <div className="add-category-price">

                    <div className='add-category flex-col'>
                        <p>Product Category</p>
                        <select onChange={onChangeHandler} value={data.category} name='category'>
                            <option value='Salad'>Salad</option>
                            <option value='Rolls'>Rolls</option>
                            <option value='Deserst'>Deserst</option>
                            <option value='Sandwich'>Sandwich</option>
                            <option value='Cake'>Cake</option>
                            <option value='Pure Veg'>Pure Veg</option>
                            <option value='Pasta'>Pasta</option>
                            <option value='Noodles'>Noodles</option>
                        </select>
                    </div>
                    <div className="add-price flex-col">
                        <p>Product Price</p>
                        <input onChange={onChangeHandler} value={data.price} type="number" name='price' placeholder='$20' />
                    </div>
                </div>
                <button type='submit' className='add-btn'>Add</button>
            </form>
        </div>
    )
}

export default Add

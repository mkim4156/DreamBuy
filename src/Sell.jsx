import React, { useState, useCallback, useEffect} from 'react'
import { useDropzone } from 'react-dropzone'
import ImageSlider from './ImageSlider'

const Sell = ({ token, user }) => {

  // authenticating:
    const fetchProtectedData = async () => {
      const token = localStorage.getItem('token');
      if(!token){
        console.error("No token found, redirecting to login...");
        return;
      }
  
      try{
        const response = await fetch('http://localhost:8000/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });
  
        const data = await response.json();
        if(!response.ok){
          console.error("Failed to fetch protected data:", data.message);
          if(response.status === 401){
            localStorage.removeItem('token');
          }
        }
        console.log("Protected data:", data);
        //setUsername(data.username);
  
      } catch (err){
        console.error("Network or esrver error:", err);
      }
    }
  
    useEffect(()=>{
       if(token){
        fetchProtectedData();
       }
    }, [token])
    

  const [image, setImage] = useState(null);
  const [imageCarousel, setImageCarousel] = useState([]); // this should be an array that collets object of images
  const [currentImageSliders, setCurrentImageSliders] = useState([]);

  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [condition, setCondition] = useState("");
  const conditionTypes = ["New", "Used"];
  const [price, setPrice] = useState("");
  const categories = ['Electronics', 'Clothing', 'Home', 'Arts', 'Collectibles', 'Sports', 'Outdoors', 'Health', 'Beauty', 'Automotive', 'Pet'];

const changeItemName = (event) =>{
  setItemName(event.target.value)
}

  const formatPrice = (event) =>{
    const newValue = event.target.value;
    
    const isValid = /^\d*(\.\d{0,2})?$/.test(newValue);
    const isSingleDot = newValue === '.';

    if (isValid || newValue === '' || isSingleDot) {
      setPrice(newValue);
    }
  }

  const addCategory = (type) =>{
    if(!selectedCategory.includes(type)){
      setSelectedCategory([...selectedCategory, type]);
    }
    else{
      const newList = selectedCategory.filter((topic) => topic !== type)
      setSelectedCategory(newList)
    }
  }

  const addCondition = (cond) => {
    setCondition(cond);
  }


  useEffect(()=>{
    console.log(selectedCategory)
  }, [selectedCategory])

  // this is a callback function that will triggered when a file is dropped
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      // Creating a url for the file so we can display it
      const imageUrl = URL.createObjectURL(file);

      const newImageObject = {
        file,
        preview: imageUrl
      }
      // saving an object in the useState*
      setImage(newImageObject);

      setCurrentImageSliders(currentImageSliders  => [...currentImageSliders , imageUrl]);
      setImageCarousel(currentCarousel  => [...currentCarousel , newImageObject]);
    }
  }, []);

  // uusing to print the latest images in the array for carousel
    useEffect(() => {
    console.log(imageCarousel);
  }, [imageCarousel]); // The effect re-runs whenever imageCarousel changes

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.jpg']
    },
    multiple: false // we can upload more than one image
  })

  const submitSell = async (event) =>{
    event.preventDefault();

    if(imageCarousel.length === 0 || condition === "" || price === "" || itemName === "" || selectedCategory.length == 0){
      console.error("Something is missing");
    }

    const formData = new FormData();

    imageCarousel.forEach((imageObject, index) => {
      formData.append(`images`, imageObject.file);
    })

    // Append other form data
    formData.append('itemName', itemName);
    formData.append('condition', condition);
    formData.append('price', price);
    formData.append('category', selectedCategory); // Join array into a string


    try{ 
      const response = await fetch(`http://localhost:8000/api/sell-item/${user.user_id}`, {
        method: 'POST',
        body: formData,       
      })

        if(!response.ok){
          const errorText = await response.text(); 
          throw new Error(errorText || 'Failed to save the item');
        }

        const data = await response.json();
        console.log(`Successfully added the item to Database: ${data}`)
        setItemName("");
        setSelectedCategory([]);
        setCondition("");
        setPrice("");
        setImageCarousel([]);
    } catch(error){
      console.error("There was an error saving the item in the Front End side.", error);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="relative min-h-screen flex items-center justify-center w-full max-w-6xl bg-[#1D1E1F]">
        <div className='absolute top-15 flex justify-center items-center bg-[#2D3032]'>
          <div className='flex-1 ' {...getRootProps()}>
            <div className='w-100 h-90 bg-[#0E1218]'>
            {imageCarousel.length !== 0 ? (
              <div className='w-100 h-90 mx-auto'>
                <ImageSlider slides={currentImageSliders}></ImageSlider>
              </div>
            ) : (
              <>
                <input {...getInputProps()}/>
                {isDragActive ? (
              <div className="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  height="50"
                  width="50"
                  fill="currentColor"
                  className='w-100 h-90'
                >
                  <path d="M1 14.5C1 12.1716 2.22429 10.1291 4.06426 8.9812C4.56469 5.044 7.92686 2 12 2C16.0731 2 19.4353 5.044 19.9357 8.9812C21.7757 10.1291 23 12.1716 23 14.5C23 17.9216 20.3562 20.7257 17 20.9811L7 21C3.64378 20.7257 1 17.9216 1 14.5ZM16.8483 18.9868C19.1817 18.8093 21 16.8561 21 14.5C21 12.927 20.1884 11.4962 18.8771 10.6781L18.0714 10.1754L17.9517 9.23338C17.5735 6.25803 15.0288 4 12 4C8.97116 4 6.42647 6.25803 6.0483 9.23338L5.92856 10.1754L5.12288 10.6781C3.81156 11.4962 3 12.927 3 14.5C3 16.8561 4.81833 18.8093 7.1517 18.9868L7.325 19H16.675L16.8483 18.9868ZM13 13V17H11V13H8L12 8L16 13H13Z"></path>
                </svg>
              </div>
                ) : (
                  <div className='w-100 h-90 bg-[#0E1218] text-white flex justify-center items-center hover:cursor-pointer'>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  height="50"
                  width="50"
                  fill="currentColor"
                  className='w-100 h-90'
                >
                  <path d="M1 14.5C1 12.1716 2.22429 10.1291 4.06426 8.9812C4.56469 5.044 7.92686 2 12 2C16.0731 2 19.4353 5.044 19.9357 8.9812C21.7757 10.1291 23 12.1716 23 14.5C23 17.9216 20.3562 20.7257 17 20.9811L7 21C3.64378 20.7257 1 17.9216 1 14.5ZM16.8483 18.9868C19.1817 18.8093 21 16.8561 21 14.5C21 12.927 20.1884 11.4962 18.8771 10.6781L18.0714 10.1754L17.9517 9.23338C17.5735 6.25803 15.0288 4 12 4C8.97116 4 6.42647 6.25803 6.0483 9.23338L5.92856 10.1754L5.12288 10.6781C3.81156 11.4962 3 12.927 3 14.5C3 16.8561 4.81833 18.8093 7.1517 18.9868L7.325 19H16.675L16.8483 18.9868ZM13 13V17H11V13H8L12 8L16 13H13Z"></path>
                </svg>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
          <div className='flex-1 w-120 h-90'>
            <form className='flex gap-3 flex-col max-w-95' onSubmit={submitSell}>

              <div className='flex items-center m-3'>
                <label className='w-24'>Item Name: </label>
                <input className='flex-1 bg-white border border-gray-300 p-2 rounded' onChange={changeItemName} />
              </div>
              <div className='flex items-center m-3'>
                <label className='w-24'>Condition: </label>
                <div className='flex'>
                  {conditionTypes.map(conditions => (
                    <div onClick={() => addCondition(conditions)} key={conditions} className={`flex-1 border-3 rounded-4xl px-3 py-0.5 hover:cursor-pointer active:bg-[#1F2021] mr-2 ${conditions === condition ? 'bg-[#1F2021]' : 'bg-[#2D3032]'}`}>
                      <div className='text-white' >{conditions}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='flex items-center m-3'>
                <label className='w-24'>Price: </label>
                <div className="text-gray-500 pl-4 font-medium flex-1 bg-white border border-gray-300 p-2 rounded ">
                  <span>$</span>
                  <input className='focus:outline-none' placeholder="0.00" value={price} onChange={formatPrice} type="text" />
                </div>
              </div>
              <div className='flex items-center m-3'>
                <label className='w-24'>Category: </label>
                <div className='flex flex-wrap max-h-7 items-center'>
                  {categories.map(category => (
                    <div 
                      key={category}
                      className={`
                        flex-1 border-3 rounded-4xl px-3 py-0.5 hover:cursor-pointer 
                        ml-2 active:bg-[#1F2021] 
                        ${selectedCategory.includes(category) ? 'bg-[#1F2021]' : 'bg-[#2D3032]'}
                      `}
                      onClick={() => addCategory(category)}
                    >
                      <div className='flex justify-center items-center text-white text-[13px]'>
                        {category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            <div className='absolute top-95 left-0 w-220 flex'>
              <button className='flex-1 rounded-2xl bg-gradient-to-r from-cyan-50 to-cyan-500 hover:cursor-pointer p-3 font-mono font-bold'>Sell</button>           
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sell

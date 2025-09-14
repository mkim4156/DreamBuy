import { useState, useEffect, useCallback} from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone'


function Profile({ token, setToken, user, setUser, setLogged }) {
  const navigate = useNavigate();

  // Image
  const [image, setImage] = useState(null);
  
  // Selling Item Information
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // pages
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // this is a callback function that will triggered when a file is dropped
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      // Creating a url for the file so we can display it
      const imageUrl = URL.createObjectURL(file);
      console.log("SEX: ", imageUrl)

      const newImageObject = {
        file,
        preview: imageUrl
      }
      // saving an object in the useState*
      setImage(newImageObject);
    }
  }, []);

  useEffect(()=>{
  if (image) {
    changeProfilePicture();
  }

  }, [image])

  useEffect(() =>{
    if (user) {
      displaySellingItems(currentPage);
    }
  }, [currentPage, user])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
      onDrop,
      accept: {
        'image/*': ['.jpeg', '.png', '.gif', '.jpg']
      },
      multiple: false // we can upload more than one image
    })

    const loggingOut = () => {
      localStorage.removeItem('token');
      setToken(null)
      setUser(null);
      setLogged(false);
      navigate('/sign-in');
    }

    // make sure to delete the items that the id user posted in the database
    const deleteAccount = async () =>{

      try{
        const response = await fetch(`http://localhost:8000/api/delete/${user.user_id}`, {
          method: 'DELETE'
        });

        if(!response.ok){
          const errorText = await response.text(); 
          throw new Error(errorText || 'Failed to Delete Account');
        }

        const data = await response.json();
        console.log("Successfully Deleted Account", data);
        loggingOut();
      }
      catch(error){
        console.error('Error during Deleting:', error.message);
      }
    }

    const changeProfilePicture = async () =>{
      const formData = new FormData();
      formData.append('profilePicture', image.file);

      try{
        const response = await fetch(`http://localhost:8000/api/changeProfile/${user.user_id}`, {
          method: 'PUT',
          body: formData,
        });

        if(!response.ok){
          const errorText = await response.text(); 
          throw new Error(errorText || 'Failed to Change Profile Picture');
        }

        const updatedUser = await response.json();
        console.log("Successfully Changed Profile Picture", updatedUser);

        setUser(updatedUser); 
        URL.revokeObjectURL(image.preview);
        setImage(null);
      }
      catch(error){
        console.error('Error during changing Profile picture:', error.message);
      }
    }

    const displaySellingItems = async (page = currentPage) => {
      try{
        const response = await fetch(`http://localhost:8000/api/profile/items/${user.user_id}/${page}`)

        if(!response.ok){
          const errorText = await response.text();
          throw new Error(errorText || "Failed to upload selling items for the user")
        }

        const data = await response.json();
        console.log("Total items from API:", data.totalItems); 
        setItems(data.data)
        setTotalItems(data.totalItems);
        setPages(Math.ceil(data.totalItems / 8)); // dont know if i have to change this again when i delete the item from the front end because it doesnt refresh the pages??
        setCurrentPage(page); // same with this
      } catch (error){
        console.error(`There was an error while trying to displaying the user's selling items: ${error}`)
      }
    }
    
    const deleteItem = async (id) => {
      if(!id){
        console.error(`ID does not exists`);
        return;
      }

      try{
        const response = await fetch(`http://localhost:8000/api/profile/items/delete/${id}`, {
          method: 'DELETE'
        });

        if(!response.ok){
          const errorText = await response.text(); 
          throw new Error(errorText || 'Failed to Delete an item in Profile');
        }

        console.log("Successfully deleted an item");
        displaySellingItems(currentPage); 
      } catch(error){
        console.error('There was an error in deleting an item: ', error);
        return;
      }

    }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  }

  return (
    <div className="flex justify-center">
      <div className="relative min-h-screen flex justify-center w-full max-w-6xl bg-[#1D1E1F]">
          <div className='flex flex-col gap-5 w-250'>
            <div className='flex mt-25 w-250 h-100'>
              <div className='flex-2/5 w-100 h-100'>

                <div className='flex-1 ' {...getRootProps()} >
                  <div className='w-100 h-100 bg-[#0E1218]'>
                  {image ? (
                    <div className='w-100 h-100 mx-auto hover:cursor-pointer '>
                      <input {...getInputProps()}/>
                        <img className=' w-full h-full bg-center bg-cover' src={image.preview} alt="" />
                    </div>
                  ) : (
                    <>
                      <input {...getInputProps()} />
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
                        <>
                        { user && user.profile_picture_url ? (
                          <div className='w-100 h-100 mx-auto hover:cursor-pointer '>
                            <input {...getInputProps()}/>
                              <img className=' w-full h-full bg-center bg-cover' src={user.profile_picture_url} alt="" />
                          </div>
                        ) : (
                          <div className='hover:cursor-pointer w-100 h-90 bg-[#0E1218] text-white flex justify-center items-center'>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              height="50"
                              width="50"
                              fill="currentColor"
                              className='w-50 h-100 mt-5'
                            >
                            <path d="M1 14.5C1 12.1716 2.22429 10.1291 4.06426 8.9812C4.56469 5.044 7.92686 2 12 2C16.0731 2 19.4353 5.044 19.9357 8.9812C21.7757 10.1291 23 12.1716 23 14.5C23 17.9216 20.3562 20.7257 17 20.9811L7 21C3.64378 20.7257 1 17.9216 1 14.5ZM16.8483 18.9868C19.1817 18.8093 21 16.8561 21 14.5C21 12.927 20.1884 11.4962 18.8771 10.6781L18.0714 10.1754L17.9517 9.23338C17.5735 6.25803 15.0288 4 12 4C8.97116 4 6.42647 6.25803 6.0483 9.23338L5.92856 10.1754L5.12288 10.6781C3.81156 11.4962 3 12.927 3 14.5C3 16.8561 4.81833 18.8093 7.1517 18.9868L7.325 19H16.675L16.8483 18.9868ZM13 13V17H11V13H8L12 8L16 13H13Z"></path>
                            </svg>
                          </div>
                        )}
                        </>
                      )}
                    </>
                  )}
                  </div>
                </div>

              </div>

              <div className='flex-3/5 border-red-100 border-8 w-100 h-100'>
                <div className='flex flex-col gap-5 items-center mt-30'>
                  {user && (
                    <>
                      <div className='text-white'> Username: {user.username} </div>
                      <div className='text-white'> ID: {user.user_id}        </div>
                      <div className='text-white'> Created: {user.created_at}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className='flex justify-end'>
              <button className='bg-red-300 rounded-full text-white px-5 mx-2 hover:cursor-pointer' onClick={loggingOut}>Log Out</button>
              <button className='bg-red-900 rounded-full text-white px-5 mx-2 hover:cursor-pointer' onClick={deleteAccount}>Delete Account</button>
            </div>

            {/* Item Being Sold*/}
            <div>
              <label className='text-white text-[40px] mt-6'>
                Selling Items
              </label>
            </div>
            <div className='flex flex-col items-center '>
              <div className='flex flex-row flex-wrap justify-start ml-2'>
                {items && items.length > 0 ? (
                  items.map((item, index) => (
                    <div key={item.id} className='flex flex-col'>
                      <div className='w-50 h-65 bg-[#2D3032] mx-5 transform transition-transform duration-500 hover:scale-105'>
                        <div key={index} className='w-50 h-50 bg-center bg-cover hover:cursor-pointer' style={{backgroundImage: `url(${item.item_images[0]})`}} onClick={() => navigateToBuyItemPage(item)}></div>
                        <div className='ml-3 text-white truncate'>{item.item_name}</div>
                        <div className='flex justify-end mr-1.5 text-white'>${item.price}</div>
                      </div>
                      <div className='flex justify-end w-55' onClick={()=>deleteItem(item.id)}>
                        {/* Add edit button here in the future */}
                        <button className='flex justify-center items-center bg-[#FF0000] text-white font-bold rounded-full p-3 w-25 hover:cursor-pointer'>Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-white'>No items to display.</div>
                )}
              </div>
              <div className='flex justify-center items-center h-5 w-5 pb-10 mt-2'>
                {Array.from({ length: pages }, (_, index) => (
                  <div key={index+1} className='flex-1 text-white hover:cursor-pointer mr-1'onClick={()=>handlePageChange(index + 1)}>
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default Profile

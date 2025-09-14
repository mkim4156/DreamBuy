import React from 'react'
import logo from '../pictures/DreamBuyBig_icon.png'

const About = () => {

  
  return (
    <div className="flex justify-center">
      <div className="relative min-h-screen flex items-start justify-start w-full max-w-6xl bg-[#121317]">

      <div className='flex flex-col'>
        <div className='w-full max-w-6xl flex flex-col p-8 ml-10 text-white'>
          <h1 className='text-5xl mb-5'>Our Story</h1>
          <p className='text-base mb-5 w-140'>
            Welcome to Dream Buy! We started this company because we believe that everyone deserves a simple, quick, and affordable way to sell and buy. We noticed that the process of buying and selling was often complicated, time-consuming, and expensive. We knew there had to be a better way.
          </p>
          <p className='text-base w-140'>
            And so, Dream Buy was born. Our mission is to make transactions so easy and fast that you can spend less time worrying about the process and more time enjoying your purchase, all while getting the best possible price.
          </p>
        </div>

        <div className='w-full max-w-6xl flex flex-col p-8 ml-10 mt-35 text-white'>
          <div className='flex-1'>
            <h2 className='text-6xl mb-5 '>What Makes Us Different</h2>
            <div className='mb-3'>
              <h3 className='text-4xl font-bold'>Easy</h3>
              <p className='mt-2 text-[20px] ml-10 mr-30'>
                We designed our platform with you in mind. Our user-friendly interface makes it simple to find what you need and complete your purchase in just a few clicks. No more complex steps or confusing forms.
              </p>
            </div>
          </div>

          <div className='w-full max-w-6xl flex flex-col text-white'>
            <div className='flex-1'>
              <h1 className='text-4xl font-bold'>Fast</h1>
              <p className='mt-2 mb-3 text-lg text-[20px] ml-10 mr-30'>
                We know your time is valuable. Our streamlined checkout process and efficient systems ensure your transaction is completed in a matter of moments. Your items will be delivered to you faster than ever.
              </p>
            </div>
          </div>

          <div className='w-full max-w-6xl flex flex-col text-white'>
            <div className='flex-1'>
              <h1 className='text-4xl font-bold'>Affordable</h1>
              <p className='mt-2 mb-3 text-lg text-[20px] ml-10 mr-30'>
                Everyone loves a good deal. By keeping our costs low and our processes efficient, we're able to pass those savings directly on to you. With Dream Buy, you get the best value without compromising on quality or speed.
              </p>
            </div>
          </div>

          <div className='w-full max-w-6xl flex flex-col text-white'>
            <div className='flex-1'>
              <h1 className='text-4xl font-bold'>Additional Discounts</h1>
              <p className='mt-2 mb-3 text-lg text-[20px] ml-10 mr-30'>
                But we don't stop there. We are constantly looking for new ways to save you money. Our customers enjoy exclusive access to additional discounts and special promotions, making your favorite items even more affordable. We believe that great value should come with even greater savings.
              </p>
            </div>
          </div>

          <div className='w-full max-w-6xl flex flex-col text-white'>
            <div className='flex-1'>
              <h1 className='text-4xl font-bold'>Our Promise</h1>
              <p className='mt-2 mb-3 text-lg text-[20px] ml-10 mr-30'>
                At Dream Buy, we are committed to providing you with a seamless and enjoyable shopping experience. We're here to make your life easier and your transactions better, giving you the best price possible every single time. Thank you for choosing us!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='absolute bg-gray-200 top-20 left-195 w-75 h-75'>
      </div>
      <div className='absolute bg-gray-500 top-15 left-190 w-75 h-75'>
        <img src={logo} alt="Failed to load Logo" />
      </div>
      <button className='absolute top-100 left-215 w-35 h-10 text-black rounded-full bg-gradient-to-l from-orange-400 to-orange-50 hover:cursor-pointer'>Contact Us</button>
      </div>
    </div>
  )
}

export default About

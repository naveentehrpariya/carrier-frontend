import React from 'react'

export default function Error404() {
  return (
      <section class="bg-dark1 h-screen flex items-center">
         <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div class="mx-auto max-w-screen-sm text-center">
                  <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-white ">404</h1>
                  <p class="mb-4 text-3xl tracking-tight font-bold text-gray-100 md:text-4xl ">Something's missing.</p>
                  <p class="mb-4 text-lg font-light text-gray-300">Sorry, we can't find that page. You'll find lots to explore on the home page. </p>
                  <a href="/" class="inline-flex text-main bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-lg text-center my-2">Back to Homepage</a>
            </div>   
         </div>
      </section>
  )
}

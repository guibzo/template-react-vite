import { useState } from 'react'

import { Button } from '@/components/ui/button'

export const Home = () => {
  const [counter, setCounter] = useState(0)

  return (
    <div className='gap-4 flex min-h-screen flex-col items-center justify-center'>
      <span className='text-3xl'>Hello World!</span>
      <Button onClick={() => setCounter((prev) => prev + 1)}>Click me</Button>
      <span className='text-xl font-semibold'>Count: {counter}</span>
    </div>
  )
}

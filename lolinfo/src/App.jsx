import { useState, useEffect } from 'react'
import { BrowserRouter } from "react-router-dom"
import Content from "./components/Content.jsx"
// import Menu from './components/Menu'
import './App.css'
import Menu from './components/Menu.jsx'
import Footer from './components/Footer.jsx'
import AdArea from './components/etc/AdArea.jsx'
import { trackDailyVisit } from './utils/visitTracker'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    trackDailyVisit()
  }, [])

  return (
    <>
      {/* Router는 주소에 의한 화면 분할을 처리하는 도구이며 설정된 영역 내에서만 작동함 */}
      <BrowserRouter basename={import.meta.env.VITE_BASE_URL}>
        <div className="app-layout">
          <Menu/>

          <main className="app-content">
            <div className="container-fluid my-5 pt-5">
              <Content/>
            </div>
          </main>
          
          <AdArea variant="bottom" />
          <Footer />
        </div>
      </BrowserRouter>
    </>
  )
}

export default App

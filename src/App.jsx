import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import DraggableGallery from './components/DraggableGallery'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <DraggableGallery />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App

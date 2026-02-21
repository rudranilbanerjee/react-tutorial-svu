import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './component/Home';
import About from './component/About';
import Contact from './component/Contact';
import CSSSelectors from './pages/CSSSelectors/CSSSelectors';
import BoxModel from './pages/CSSSelectors/BoxModel/BoxModel';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/about' element={<About/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/css-selectors' element={<CSSSelectors/>} />
        <Route path='/box-model' element={<BoxModel/>} />
      </Routes>
    </BrowserRouter>
    
    </>
    
  );
}

export default App;

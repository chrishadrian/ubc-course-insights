import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import pages from './pages/pages';
import Sidebar from './components/SideBar';

function App() {
	return (
		<div className='w-full h-full flex'>
			<Sidebar />
			<Routes>
				{pages.map((page) => (
					<Route key={page.name} path={page.path} element={page.element} />
				))}
				<Route path='*' element={<Navigate replace to='/' />} />
			</Routes>
		</div>
	);
}

export default App;

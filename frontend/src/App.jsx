import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import NavigationBar from './pages/NavigationBar';
import pages from './pages/pages';

function App() {
	return (
		<div className='w-full'>
			<Routes>
				<Route path='/' element={<NavigationBar />}>
					{pages.map((page) => (
						<Route key={page.name} path={page.path} element={page.element} />
					))}
				</Route>
				<Route path='*' element={<Navigate replace to='/' />} />
			</Routes>
		</div>
	);
}

export default App;

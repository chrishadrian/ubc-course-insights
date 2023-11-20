import React from 'react';
import { Navbar, Collapse, Typography, IconButton } from '@material-tailwind/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Outlet, useNavigate } from 'react-router-dom';
import pages from './pages';

// https://www.material-tailwind.com/docs/react/navbar
function NavList() {
	return (
		<ul className='my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6'>
			{pages.map((page) => (
				<Typography as='li' variant='small' color='blue-gray' className='p-1 font-medium' key={page.name}>
					<a href={page.path} className='flex items-center hover:text-blue-500 transition-colors text-white'>
						{page.name}
					</a>
				</Typography>
			))}
		</ul>
	);
}

export default function NavigationBar() {
	const [openNav, setOpenNav] = React.useState(false);
	const handleWindowResize = () => window.innerWidth >= 960 && setOpenNav(false);
	const navigate = useNavigate();

	React.useEffect(() => {
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, []);

	return (
		<div>
			<Navbar className='w-full px-6 py-3 max-w-full rounded-none border-0' color='red'>
				<div className='flex items-center justify-between text-white'>
					<Typography
						as='a'
						href='#'
						variant='h6'
						className='mr-4 cursor-pointer py-1.5'
						onClick={() => navigate('/')}
					>
						Formula 1
					</Typography>
					<div className='hidden lg:block'>
						<NavList />
					</div>
					<IconButton
						variant='text'
						className='ml-auto h-6 w-6 text-inherit hover:bg-transparent
					focus:bg-transparent active:bg-transparent lg:hidden'
						ripple={false}
						onClick={() => setOpenNav(!openNav)}
					>
						{openNav ? (
							<XMarkIcon className='h-6 w-6' strokeWidth={2} />
						) : (
							<Bars3Icon className='h-6 w-6' strokeWidth={2} />
						)}
					</IconButton>
				</div>
				<Collapse open={openNav}>
					<NavList />
				</Collapse>
			</Navbar>
			<div>
				<Outlet />
			</div>
		</div>
	);
}

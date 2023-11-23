import { Option, Select, Typography } from '@material-tailwind/react';
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

export default function DropdownMenus({ attributes, errors }) {
	return (
		<div className='flex flex-col justify-between lg:flex-row lg:space-x-5'>
			{attributes.map((attribute) => {
				const error =
					(attribute.label === 'Subject' && errors.courseError) ||
					(attribute.label === 'Course Number' && errors.numberError);
				return (
					<div key={attribute.label} className='mb-4'>
						<Select
							value={attribute.selectedAttribute}
							onChange={(value) => {
								attribute.setSelectedAttribute(value);
							}}
							label={attribute.label}
							error={error}
						>
							{attribute.values &&
								attribute.values.map((val) => (
									<Option key={val} value={val}>
										{val}
									</Option>
								))}
						</Select>
						{error && (
							<div className='flex space-x-2 bg-red-100 border border-red-500 p-2 rounded-md shadow-md'>
								<ExclamationTriangleIcon className='w-5 h-5 text-red-500' />
								<Typography variant='small' className='text-red-800'>
									{attribute.label === 'Subject' && 'Please fill in the course subject'}
									{attribute.label === 'Course Number' && 'Please fill in the course number'}
								</Typography>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

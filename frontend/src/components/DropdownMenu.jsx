import { Option, Select } from '@material-tailwind/react';
import React from 'react';

export default function DropdownMenu({ attributes }) {
	return (
		<div className='flex flex-col justify-between w-1/3 lg:flex-row lg:space-x-5'>
			{attributes.map((attribute) => (
				<div className='mb-4'>
					<Select
						value={attribute.selectedAttribute}
						onChange={(value) => {
							attribute.setSelectedAttribute(value);
						}}
						label={attribute.label}
					>
						{attribute.values.map((val) => (
							<Option key={val} value={val}>
								{val}
							</Option>
						))}
					</Select>
				</div>
			))}
		</div>
	);
}

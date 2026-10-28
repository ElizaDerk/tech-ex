import type {Service} from './types';

export const servicesHeading = 'Our services';

export const services: Service[] = [
	{
		id: 'pedestrian-bridges',
		name: 'Pedestrian bridges',
		description: 'Safe and elegant footbridges for parks, rivers and city streets.',
	},
	{
		id: 'road-bridges',
		name: 'Road bridges',
		description: 'Durable bridges for highways, local roads and heavy traffic.',
	},
	{
		id: 'cable-stayed-bridges',
		name: 'Cable-stayed bridges',
		description: 'Long-span crossings supported by towers and steel cables.',
	},
	{
		id: 'reconstruction',
		name: 'Reconstruction',
		description: 'Repair and strengthening of ageing bridges to extend their life.',
	},
];

import type {Project} from './types';

export const projectsHeading = 'Recent projects';

export const projects: Project[] = [
	{
		id: 'riverside-footbridge',
		title: 'Riverside Footbridge',
		description: 'A light steel footbridge linking two riverside parks.',
		image: '/images/project-1.svg',
		imageAlt: 'Illustration of a slim arched footbridge over a calm river',
	},
	{
		id: 'northgate-viaduct',
		title: 'Northgate Viaduct',
		description: 'A multi-span concrete road bridge carrying a busy regional route.',
		image: '/images/project-2.svg',
		imageAlt: 'Illustration of a long road viaduct resting on several concrete piers',
	},
	{
		id: 'harbor-crossing',
		title: 'Harbor Crossing',
		description: 'A cable-stayed bridge with a single tower across a harbor channel.',
		image: '/images/project-3.svg',
		imageAlt: 'Illustration of a cable-stayed bridge with one tall tower and fanned cables',
	},
];

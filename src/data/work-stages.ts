import type {WorkStage} from './types';

export const workStagesHeading = 'How we work';

export const workStages: WorkStage[] = [
	{id: 'design', position: 1, name: 'Design', description: 'We study the site and prepare the engineering design.'},
	{id: 'permits', position: 2, name: 'Permits', description: 'We handle approvals and paperwork with the authorities.'},
	{
		id: 'construction',
		position: 3,
		name: 'Construction',
		description: 'Our crews build the bridge to plan, safely and on schedule.',
	},
	{id: 'handover', position: 4, name: 'Handover', description: 'We inspect, test and hand over the finished bridge.'},
];

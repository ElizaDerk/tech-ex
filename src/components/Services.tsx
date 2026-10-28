import type {Service} from '@/data/types';
import {Section} from './Section';

type ServicesProps = {
	heading: string;
	services: Service[];
};

export function Services({heading, services}: ServicesProps) {
	return (
		<Section
			headingId="services-heading"
			heading={heading}
		>
			<ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{services.map(service => (
					<li
						key={service.id}
						className="min-w-0 rounded border border-slate-300 p-6 break-words"
					>
						<h3 className="text-xl font-semibold">{service.name}</h3>
						<p className="mt-2 text-slate-700">{service.description}</p>
					</li>
				))}
			</ul>
		</Section>
	);
}

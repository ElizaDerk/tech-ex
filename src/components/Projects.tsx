import Image from 'next/image';
import type {Project} from '@/data/types';
import {Section} from './Section';

type ProjectsProps = {
	heading: string;
	projects: Project[];
};

export function Projects({heading, projects}: ProjectsProps) {
	return (
		<Section
			headingId="projects-heading"
			heading={heading}
		>
			<ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{projects.map(project => (
					<li
						key={project.id}
						className="min-w-0 overflow-hidden rounded border border-slate-300 break-words"
					>
						<Image
							src={project.image}
							alt={project.imageAlt}
							width={800}
							height={600}
							sizes="(min-width: 768px) 33vw, 100vw"
							className="h-auto w-full"
						/>
						<div className="p-6">
							<h3 className="text-xl font-semibold">{project.title}</h3>
							<p className="mt-2 text-slate-700">{project.description}</p>
						</div>
					</li>
				))}
			</ul>
		</Section>
	);
}

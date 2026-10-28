import type {WorkStage} from '@/data/types';
import {Section} from './Section';

type WorkStagesProps = {
	heading: string;
	stages: WorkStage[];
};

export function WorkStages({heading, stages}: WorkStagesProps) {
	const sorted = [...stages].sort((a, b) => a.position - b.position);

	return (
		<Section
			headingId="work-stages-heading"
			heading={heading}
		>
			<ol className="grid grid-cols-1 gap-6 md:grid-cols-4">
				{sorted.map(stage => (
					<li
						key={stage.id}
						className="min-w-0 rounded border border-slate-300 p-6 break-words"
					>
						<span className="text-3xl font-bold text-slate-600">{stage.position}</span>
						<h3 className="mt-2 text-xl font-semibold">{stage.name}</h3>
						<p className="mt-2 text-slate-700">{stage.description}</p>
					</li>
				))}
			</ol>
		</Section>
	);
}

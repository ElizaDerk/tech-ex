import type {ReactNode} from 'react';

type SectionProps = {
	headingId: string;
	heading: string;
	children: ReactNode;
};

export function Section({headingId, heading, children}: SectionProps) {
	return (
		<section
			aria-labelledby={headingId}
			className="px-4 py-12 md:py-16"
		>
			<div className="mx-auto max-w-5xl min-w-0">
				<h2
					id={headingId}
					className="mb-8 text-2xl font-bold md:text-3xl"
				>
					{heading}
				</h2>
				{children}
			</div>
		</section>
	);
}

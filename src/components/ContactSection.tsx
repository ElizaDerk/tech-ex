import type {ReactNode} from 'react';
import type {ContactContent} from '@/data/types';

type ContactSectionProps = ContactContent & {
	children?: ReactNode;
};

export function ContactSection({id, heading, intro, children}: ContactSectionProps) {
	return (
		<section
			id={id}
			aria-labelledby="contact-heading"
			className="scroll-mt-8 bg-slate-100 px-4 py-12 md:py-16"
		>
			<div className="mx-auto max-w-5xl min-w-0 break-words">
				<h2
					id="contact-heading"
					className="text-2xl font-bold md:text-3xl"
				>
					{heading}
				</h2>
				{intro && <p className="mt-4 text-slate-700">{intro}</p>}
				{children}
			</div>
		</section>
	);
}

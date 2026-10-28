import type {FooterContent} from '@/data/types';

export function Footer({companyName, notice}: FooterContent) {
	return (
		<footer className="bg-slate-900 px-4 py-8 text-slate-200">
			<div className="mx-auto max-w-5xl min-w-0 break-words">
				<p className="font-semibold text-white">{companyName}</p>
				<p className="mt-2 text-sm">{notice}</p>
			</div>
		</footer>
	);
}

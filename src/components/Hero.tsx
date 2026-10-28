import type {HeroContent} from '@/data/types';

export function Hero({headline, subtitle, ctaLabel, ctaTargetId}: HeroContent) {
	return (
		<header className="bg-slate-900 px-4 py-16 md:py-24">
			<div className="mx-auto max-w-5xl min-w-0 break-words">
				<h1 className="text-3xl font-bold text-white md:text-5xl">{headline}</h1>
				<p className="mt-4 max-w-2xl text-lg text-slate-200">{subtitle}</p>
				<a
					href={`#${ctaTargetId}`}
					className="mt-8 inline-block rounded bg-amber-400 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
				>
					{ctaLabel}
				</a>
			</div>
		</header>
	);
}

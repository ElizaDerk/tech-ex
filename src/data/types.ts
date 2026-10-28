export type SiteMetadata = {
	title: string;
	description: string;
};

export type HeroContent = {
	headline: string;
	subtitle: string;
	ctaLabel: string;
	ctaTargetId: string;
};

export type Service = {
	id: string;
	name: string;
	description: string;
};

export type Project = {
	id: string;
	title: string;
	description: string;
	image: string;
	imageAlt: string;
};

export type WorkStage = {
	id: string;
	position: number;
	name: string;
	description: string;
};

export type ContactContent = {
	id: string;
	heading: string;
	intro?: string;
};

export type FooterContent = {
	companyName: string;
	notice: string;
};

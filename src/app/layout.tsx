import type {Metadata} from 'next';
import {siteMetadata} from '@/data/metadata';
import './globals.css';

export const metadata: Metadata = {
	title: siteMetadata.title,
	description: siteMetadata.description,
};

export default function RootLayout({children}: LayoutProps<'/'>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}

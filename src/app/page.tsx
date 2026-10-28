import {ContactForm} from '@/components/ContactForm';
import {ContactSection} from '@/components/ContactSection';
import {Footer} from '@/components/Footer';
import {Hero} from '@/components/Hero';
import {Projects} from '@/components/Projects';
import {Services} from '@/components/Services';
import {WorkStages} from '@/components/WorkStages';
import {contact} from '@/data/contact';
import {footer} from '@/data/footer';
import {hero} from '@/data/hero';
import {projects, projectsHeading} from '@/data/projects';
import {services, servicesHeading} from '@/data/services';
import {workStages, workStagesHeading} from '@/data/work-stages';

export default function Page() {
	return (
		<>
			<main>
				<Hero {...hero} />
				<Services
					heading={servicesHeading}
					services={services}
				/>
				<Projects
					heading={projectsHeading}
					projects={projects}
				/>
				<WorkStages
					heading={workStagesHeading}
					stages={workStages}
				/>
				<ContactSection {...contact}>
					<ContactForm />
				</ContactSection>
			</main>
			<Footer {...footer} />
		</>
	);
}

export interface Seo {
	title: string;
	description: string;
	tags: string[];
}

export default interface CreateBlogPost {
	title: string;
	content: string;
	description: string;
	image?: string;
	featured: string;
	tags: string[];
	seo?: Seo;
}

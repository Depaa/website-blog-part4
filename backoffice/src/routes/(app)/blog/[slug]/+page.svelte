<script lang="ts">
	import { PUBLIC_BASE_URL, PUBLIC_IMAGE_URL } from '$env/static/public';
	import RelatedPostsGrid from '$lib/components/3-grid.svelte';
	import BlogPostCard from '$lib/components/blog-post-card.svelte';
	import SocialShare from '$lib/components/social-share.svelte';
	import Tag from '$lib/components/tag.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	export const dateOptions: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	};

	onMount(async () => {
		document.title = data.post?.seo?.title || '';
		var meta = document.createElement('meta');
		meta.name = 'description';
		meta.content = data.post?.seo?.description || '';
		document.getElementsByTagName('head')[0].appendChild(meta);
		console.log('data', data);
	});
</script>

<link rel="preconnect" href={PUBLIC_BASE_URL} />
<link rel="dns-prefetch" href={PUBLIC_BASE_URL} />
<link rel="preconnect" href={PUBLIC_IMAGE_URL} />
<link rel="dns-prefetch" href={PUBLIC_IMAGE_URL} />

<article id="markdown-content">
	<div class="header">
		<h1 class="post-title">{data.post.title}</h1>
		<div class="note">
			Published on {new Date(data.post.publishedAt ?? data.post.createdAt).toLocaleDateString(
				'en-UK',
				dateOptions
			)}
		</div>
		<div class="note">{`~ ${data.post.readingTime ?? 0} min read`}</div>
		<div class="tags">
			{#if data.post.tags}
				{#each data.post.tags as tag}
					<Tag>{tag}</Tag>
				{/each}
			{/if}
		</div>
	</div>
	<div class="cover-image">
		<!-- <Image path={data.post.image} filename="cover" alt="Cover Image" /> -->
		<img src={data.post.image} alt="Article cover" loading="eager" decoding="async" />
	</div>
	<div class="content">
		{@html data.post.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
	</div>
	<div class="social-share">
		<SocialShare />
	</div>
</article>
<div class="related-container">
	<div class="related-posts">
		<h2>Related posts</h2>
		<RelatedPostsGrid>
			{#each data.related as post}
				<BlogPostCard {post} showImage={false} onDelete={() => undefined} />
			{/each}
		</RelatedPostsGrid>
	</div>
</div>

<style lang="scss">
	.cover-image {
		padding-top: 60%;
		position: relative;
		img {
			position: absolute;
			bottom: 0;
			top: 0;
			left: 0;
			right: 0;
			width: 100%;
			height: 100%;
			object-fit: scale-down !important;
		}
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authGuard, isLogged } from '$lib/auth/auth';

	export let isLoggedIn: boolean;

	function handleLogout() {
		authGuard()
			.logout()
			.then((res) => {
				isLogged.update((state) => false);
				goto('/blog');
			})
			.catch((err) => console.error(err));
	}
</script>

<header>
	<div>
		<a style="margin-right: 1rem" class={$page.url.pathname === '/' ? 'active-page' : ''} href="/"
			>Home</a
		>
		<a class={$page.url.pathname === '/blog' ? 'active-page' : ''} href="/blog">Blog</a>
	</div>
	<div>
		{#if isLoggedIn === false}
			<a class={$page.url.pathname === '/admin/' ? 'active-page' : ''} href="/admin">Login</a>
		{/if}
		{#if isLoggedIn}
			<button on:click={handleLogout}>Logout</button>
		{/if}
	</div>
</header>

<style>
	header {
		height: 10vh;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 50px;
		background-color: var(--header-background-color);
	}

	a:hover,
	a.active-page {
		color: var(--color-theme-1);
	}
</style>

<script lang="ts">
	export let article: HTMLElement | undefined | null = undefined;
	export let disabled = true;
</script>

<article
	bind:this={article}
	class="relative w-full aspect-square border-2 border-black bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
	class:disabled
>
	<slot />
</article>

<style lang="scss">
	.disabled:hover {
		box-shadow: none;
	}
</style>

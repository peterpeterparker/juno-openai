<script lang="ts">
	export let disabled = true;
	export let ariaLabel: string;
	export let active = false;
</script>

<button
	class="w-8 h-8 inline-flex items-center justify-center border-2 rounded-full hover:bg-[#79F7FF] hover:border-black hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF]"
	class:bg-violet-400={active}
	class:border-black={active}
	class:border-transparent={!active}
	class:opacity-10={disabled}
	{disabled}
	on:click
	aria-label={ariaLabel}><slot /></button
>

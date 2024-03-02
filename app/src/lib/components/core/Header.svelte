<script lang="ts">
	import IconGitHub from '$lib/components/icons/IconGitHub.svelte';
	import { userInitialized, userSignedIn } from '$lib/derived/user.derived';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import IconLogout from '$lib/components/icons/IconLogout.svelte';
	import { signIn, signOut } from '$lib/services/auth.services';
	import IconLogin from '$lib/components/icons/IconLogin.svelte';
	import Prompt from '$lib/components/core/Prompt.svelte';
	import IconJuno from '$lib/components/icons/IconJuno.svelte';
</script>

<header class="w-full fixed top-0 z-40 md:py-6 md:max-w-[50vw] md:left-1/2 md:-translate-x-1/2">
	<div
		class="w-full h-20 m-auto flex justify-between items-center px-5 border-b-2 md:border-2 border-black bg-white"
	>
		<Prompt />
		<nav class="w-1/2 h-full">
			<ul class="flex justify-end items-center space-x-4 h-full">
				<li class="h-full flex items-center border-l-2 border-black pl-5">
					<a
						href="https://github.com/peterpeterparker/juno-openai"
						target="_blank"
						class="w-8 h-8 inline-flex items-center justify-center border-2 border-transparent rounded-full hover:bg-[#79F7FF] hover:border-black hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF]"
						rel="noopener noreferrer"
						aria-label="Go to Juno <> OpenAI source code on GitHub"><IconGitHub /></a
					>
				</li>
				<li class="h-full flex items-center">
					<a
						href="https://juno.build"
						target="_blank"
						class="w-8 h-8 inline-flex items-center justify-center border-2 border-transparent rounded-full hover:bg-[#79F7FF] hover:border-black hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF]"
						rel="noopener noreferrer"
						aria-label="Go to Juno website and documentation"><IconJuno /></a
					>
				</li>
				<li class="h-full flex items-center">
					{#if $userInitialized}
						{#if $userSignedIn}
							<ButtonIcon disabled={false} on:click={signOut} ariaLabel="Sign-out">
								<IconLogout />
							</ButtonIcon>
						{:else}
							<ButtonIcon
								disabled={false}
								on:click={async () => await signIn()}
								ariaLabel="Sign-in"
							>
								<IconLogin />
							</ButtonIcon>
						{/if}
					{/if}
				</li>
			</ul>
		</nav>
	</div>
</header>

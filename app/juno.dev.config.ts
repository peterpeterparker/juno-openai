import { defineDevConfig } from '@junobuild/config';

export default defineDevConfig(() => ({
	satellite: {
		collections: {
			db: [
				{
					collection: 'renderings',
					memory: 'Stable' as const,
					read: 'managed' as const,
					write: 'managed' as const,
					mutablePermissions: true
				},
				{
					collection: 'prompts',
					memory: 'Stable' as const,
					read: 'managed' as const,
					write: 'managed' as const,
					mutablePermissions: true
				}
			],
			storage: [
				{
					collection: 'sketches',
					memory: 'Stable' as const,
					read: 'managed' as const,
					write: 'managed' as const,
					mutablePermissions: true,
					max_size: undefined
				}
			]
		},
		controllers: []
	}
}));

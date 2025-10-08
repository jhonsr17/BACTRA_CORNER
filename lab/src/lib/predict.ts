export type Test = 'POS' | 'NEG' | 'ND'
export type Species = 'E_COLI' | 'SHIGELLA' | 'INCONCLUSO'

export function predictSpecies (indole: Test, motility: Test): Species {
	if (indole === 'POS' && motility === 'POS') return 'E_COLI'
	if (indole === 'NEG' && motility === 'NEG') return 'SHIGELLA'
	return 'INCONCLUSO'
}



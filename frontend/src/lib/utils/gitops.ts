import type { GitOpsSync } from '#lib/types/automation.js';
import { toGitPathUrl } from '#lib/utils/navigation.js';

function composeDirectory(sync: GitOpsSync): string {
	return sync.composePath.split('/').slice(0, -1).join('/');
}

// Mirrors the backend's workspace lock, which deliberately omits the project-root .env.
function syncedPaths(sync: GitOpsSync): string[] {
	try {
		const parsed: unknown = JSON.parse(sync.syncedFiles ?? '[]');
		return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === 'string' && entry) : [];
	} catch {
		return [];
	}
}

export function gitOpsProjectUrl(sync: GitOpsSync | undefined | null): string | null {
	if (!sync?.repository?.url) return null;
	return toGitPathUrl(sync.repository.url, sync.branch, composeDirectory(sync), 'tree');
}

// A single-file sync writes the local copy as compose.yaml whatever the repository calls it.
export function gitOpsComposeEditUrl(sync: GitOpsSync | undefined | null): string | null {
	if (!sync?.repository?.url) return null;
	return toGitPathUrl(sync.repository.url, sync.branch, sync.composePath, 'edit');
}

export function gitOpsFileEditUrl(sync: GitOpsSync | undefined | null, relativePath: string): string | null {
	if (!sync?.repository?.url || !syncedPaths(sync).includes(relativePath)) return null;
	const directory = composeDirectory(sync);
	return toGitPathUrl(sync.repository.url, sync.branch, directory ? `${directory}/${relativePath}` : relativePath, 'edit');
}

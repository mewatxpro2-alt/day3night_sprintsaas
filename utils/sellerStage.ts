/**
 * Seller Stage System
 * Determines seller trust level based on projects completed
 */

export type SellerStage = 'new' | 'early' | 'proven' | 'top';

export interface SellerStageInfo {
    stage: SellerStage;
    label: string;
    description: string;
    badgeColor: string;
    showRating: boolean;
}

/**
 * Determine seller stage based on completed projects
 */
export function getSellerStage(projectsCompleted: number): SellerStage {
    if (projectsCompleted === 0) return 'new';
    if (projectsCompleted <= 3) return 'early';
    if (projectsCompleted <= 15) return 'proven';
    return 'top';
}

/**
 * Get complete seller stage info for UI rendering
 */
export function getSellerStageInfo(
    projectsCompleted: number,
    isVerified: boolean
): SellerStageInfo {
    const stage = getSellerStage(projectsCompleted);

    switch (stage) {
        case 'new':
            return {
                stage: 'new',
                label: isVerified ? '🆕 New & Verified Creator' : '🆕 New Creator',
                description: isVerified
                    ? 'This creator is new on the platform. Profile and work reviewed by admin.'
                    : 'This creator is new on the platform.',
                badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
                showRating: false // Never show rating for new sellers
            };
        case 'early':
            return {
                stage: 'early',
                label: '✨ Early Seller',
                description: 'Early seller with successful deliveries.',
                badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
                showRating: true
            };
        case 'proven':
            return {
                stage: 'proven',
                label: '✓ Proven Creator',
                description: 'Reliable creator with repeat buyers.',
                badgeColor: 'bg-green-500/10 text-green-600 border-green-200',
                showRating: true
            };
        case 'top':
            return {
                stage: 'top',
                label: '🏆 Top Creator',
                description: 'One of the most trusted creators on SprintSaaS.',
                badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200',
                showRating: true
            };
    }
}

/**
 * Check if a stat should be displayed (not null/undefined/0)
 */
export function shouldShowStat(value: number | null | undefined): boolean {
    return value !== null && value !== undefined && value > 0;
}

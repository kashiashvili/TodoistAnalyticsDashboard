export const PRIMARY_LINE_COLOR = 'rgba(179, 42, 22, 0.9)';
export const SECONDARY_LINE_COLOR = 'rgba(57, 84, 162, 0.9)';
export const PRIMARY_BAR_COLOR = 'rgba(179, 42, 22, 0.7)';
export const PRIMARY_HOVER_COLOR = 'rgba(179, 42, 22, 1)';

export function extractTaskNameWithoutTags(task) {
    return task.split('@')[0].trim();
}
/**
 * Buffer update function for scoreboard data
 * Manages in-memory scoreboard buffer with versioning
 */

export default function updateBuffer(buffer, newData) {
    try {
        // Validate input data
        if (!newData || !Array.isArray(newData)) {
            console.warn('Invalid data provided to updateBuffer:', newData);
            return false;
        }

        // Update buffer with new data
        buffer.scoreboard = {
            version: (buffer.scoreboard?.version || 0) + 1,
            ts: new Date().toISOString(),
            rows: newData
        };

        console.log(`Buffer updated successfully. Version: ${buffer.scoreboard.version}, Rows: ${newData.length}`);
        return true;
    } catch (error) {
        console.error('Error updating buffer:', error);
        return false;
    }
}
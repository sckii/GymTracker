import LZString from 'lz-string';

export const generateShareLink = (plan) => {
    try {
        // Strip sensitive/local data before sharing if needed (e.g., local IDs if they shouldn't clash? actually UUIDs are fine)
        // We might want to remove 'isActive' so the imported plan doesn't auto-activate
        const cleanPlan = {
            ...plan,
            isActive: false,
            id: undefined // Let the importer generate a new ID
        };

        const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(cleanPlan));
        const url = `${window.location.origin}/?share=${compressed}`;
        return url;
    } catch (error) {
        console.error("Error generating link:", error);
        return null;
    }
};

export const parseShareLink = (token) => {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(token);
        if (!decompressed) return null;
        const plan = JSON.parse(decompressed);
        return plan;
    } catch (error) {
        console.error("Error parsing link:", error);
        return null;
    }
};

export const readBlobAsBase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                const base64data = reader.result.split(',')[1];
                resolve(base64data);
            } else {
                reject(new Error('Failed to read the Blob as base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export const decodeBase64ToBlob = (base64: string) => atob(base64);



export const cleanExpiredViews = () =>{
    const viewTimeLimit = 60* 60 * 1000;
        
        const now = Date.now();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("view_")) {
                const stored = localStorage.getItem(key);
                if (!stored) continue;
                try {
                    const parsed = JSON.parse(stored);
                    if (now - parsed.time > viewTimeLimit) {
                        localStorage.removeItem(key);
                        i--; 
                    }
                } catch (e) {
                    console.warn("Invalid localStorage entry:", key);
                }
        }
    }
};
export const uploadImage = async (formData, filename) => {
    try {
        const response = await fetch(
            `http://localhost:8080/upload?filename=${filename}`,
            {
                method: 'POST',
                body: formData
            }
        );
        return await response.json();
    } catch (e) {
        throw e
    }
}

export const getSecurity = async () => {
    const response = await fetch('http://localhost:8080');
    return await response.json();
}

export const updateSecurityValidation = async (securityId, security) => {
    try {
        await fetch('http://localhost:8080', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            mode: "cors",
            body: JSON.stringify({
                security: Object.keys(security).length > 0 ? security : undefined,
                securityId: parseInt(securityId)
            })
        });
    } catch (e) {
        console.error(e)
    }
}

export const getSecurityById = async (securityId) => {
    const response = await fetch(`http://localhost:8080/${securityId}`);
    return await response.json();
}

export const searchSecurities = async (query) => {
    const response = await fetch('http://localhost:8080/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query
        })
    })
    return await response.json();
}

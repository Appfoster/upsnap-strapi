import axios from 'axios';

export const request = async (url: string, options = {}) => {
    const response = await axios({
        url: `/upsnap${url}`,
        ...options,
    });
    return response.data;
};
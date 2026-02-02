import axios from 'axios';

export const request = async (url: string, options = {}) => {
    const response = await axios({
        url: `/upsnap${url}`,
        ...options,
    });
    return response.data;
};

export const formatDate = (dateString: string): string => {
   const date = new Date(dateString);
   if (isNaN(date.getTime())) {
       return 'N/A';
   }
    // Format: MM/DD/YYYY, HH:mm:ss
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}
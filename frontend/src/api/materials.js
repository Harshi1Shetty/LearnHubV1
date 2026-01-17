// src/api/materials.js
import axios from 'axios';

const API_URL = '/api/materials';

export const uploadMaterial = async (file, difficulty, interest, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('difficulty', difficulty);
    formData.append('user_id', userId);
    if (interest) formData.append('interest', interest);

    const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getMaterials = async (userId) => {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
};

export const getMaterialRoadmap = async (id, userId) => {
    const response = await axios.get(`${API_URL}/${id}`, {
        params: { user_id: userId }
    });
    return response.data;
};

export const getMaterialNodeContent = async (id, nodeLabel, userId) => {
    const formData = new FormData();
    formData.append('node_label', nodeLabel);
    formData.append('user_id', userId);
    
    const response = await axios.post(`${API_URL}/${id}/content`, formData, {
        headers: { 
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// updateData
/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    const urlType = type === 'password' ? 'updateMyPassword' : 'updateMe';
    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://localhost:3000/api/v1/users/${urlType}`,
            data,
        });

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
        }
    } catch (error) {
        showAlert('error', err.response.data.message);
    }
};

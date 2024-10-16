import { Component } from 'react'
import Api from './Api';
class Endpoints extends Component {

    async sign_up(data) {
        return Api.post(`/user/signup`,data);
    }

    async login(data) {
        return Api.post(`/user/login`, data);
    }

    async contact_us(data){
        return Api.post(`/user/contact_us`, data);
    }

    async forgotpassword(data) {
        return Api.post(`/user/forgotpassword`, data);
    }

    async resetpassword(id, data) {
        return Api.patch(`/user/resetpassword/${id}`, data);
    }

    async user_profile() {
        return Api.get(`/user/profile`);
    }
    
    async create_stream(data) {
        return Api.post(`/create-stream`,data);
    }
    async create_rtmp_stream(data) {
        return Api.post(`/create-rtmp-stream`,data);
    }

    async stop_stream(id) {
        return Api.get(`/kill-stream/${id}`,);
    }

    async lists_streams() {
        return Api.get(`/my-streams`);
    }
    
    async pricingPlanLists() {
        return Api.get(`/pricing-plans`);
    }
    async adminpricingPlanLists(signal) {
        return Api.get(`/admin-pricing-plans`, {signal});
    }
    
    async pricingPlanLists(signal) {
        return Api.get(`/pricing-plans`, {signal});
    }

    async update_payment_status(data) {
        return Api.post(`/update-payment-status`, data);
    }

    async subscribePlan(data) {
        return Api.post(`/create-order`,data);
    }

    async mymedia(type, page, limit) {
        return Api.get(`/my-media/${type}?page=${page}&limit=${limit}`);
    }

    async delete_media(id) {
        return Api.get(`/delete/media/${id}`);
    }

    async uploadMedia(data, onProgress,signal) {
        const config = {
            onUploadProgress: progressEvent => {
                console.log('Progress event:', progressEvent);
                if (onProgress) {
                    const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log('Percent complete:', percentComplete);
                    onProgress(percentComplete);
                }
            }
        };
        return Api.post(`/cloud/upload`, data, config, {signal});
    }

    async getAuthToken() {
        return Api.get(`/auth`);
    }
    async verifyAuthToken(code, scope) {
        return Api.get(`/oauth2callback?code=${code}&scope=${scope}`);
    }
    
    async checkYtStatus() {
        return Api.get(`/check-youtube-link-status`);
    }
    async unLinkYoutube() {
        return Api.get(`/unLinkYoutube`);
    }
    
    render() {
        return <></>
    }
}

export default Endpoints;
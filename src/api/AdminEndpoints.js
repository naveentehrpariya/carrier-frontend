import { Component } from 'react'
import AdminApi from './AdminApi';
class AdminEndpoints extends Component {
    async create_plan(data) {
        return AdminApi.post(`/create-pricing-plan`,data);
    }
    render() {
        return <></>
    }
}

export default AdminEndpoints;
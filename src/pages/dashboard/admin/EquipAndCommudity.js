import React from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Commodity from './Commodity';
import EquipmentLists from './EquipmentLists';

export default function EquipAndCommudity() {
  return (
      <AuthLayout> 
          <Commodity />
          <EquipmentLists />
      </AuthLayout>
  )
}

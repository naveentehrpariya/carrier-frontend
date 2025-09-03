import React from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Commodity from './Commodity';
import EquipmentLists from './EquipmentLists';
import ChargesItems from './ChargesItems';

export default function EquipAndCommodity() {
  return (
      <AuthLayout> 
          {/* <Commodity /> */}
          <EquipmentLists />
          <ChargesItems />
      </AuthLayout>
  )
}

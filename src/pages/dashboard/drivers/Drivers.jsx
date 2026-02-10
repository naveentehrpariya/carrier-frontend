import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import EmployeeCard from '../../../components/employees/EmployeeCard';
import { EmployeeGridSkeleton } from '../../../components/employees/EmployeeCardSkeleton';
import EmptyEmployeeState from '../../../components/employees/EmptyEmployeeState';
import EmployeeDocuments from '../employees/EmployeeDocuments';
import AddDriver from './AddDriver';
import { toast } from 'react-hot-toast';
import Popup from '../../common/Popup';

export default function Drivers() {
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState([]);
  const { Errors } = useContext(UserContext);
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchLists = () => {
    setLoading(true);
    const resp = Api.get(`/driver/listings`);
    resp.then((res) => {
      setLoading(false);
      if (res.data.status === true) {
        setLists(res.data.lists || []);
      } else {
        setLists([]);
      }
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
      Errors && Errors(err);
    });
  }

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <AuthLayout>
      <div className='flex justify-between items-center'>
        <h2 className='text-white text-2xl'>Drivers</h2>
        <AddDriver text="Add Driver" classes="btn md text-black font-bold" fetchLists={fetchLists} />
      </div>

      <div className='mt-8'>
        {loading ? (
          <EmployeeGridSkeleton />
        ) : lists && lists.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {lists.map((employee, index) => {
              return (
                <EmployeeCard
                  key={`driver-${employee._id || index}`}
                  employee={employee}
                  fetchLists={fetchLists}
                  onOpenDocuments={(emp) => {
                    setSelectedEmployee(emp);
                    setShowDocuments(true);
                  }}
                  onDeleteRequest={(emp) => { setDeleteItem(emp); setDeleteOpen(true); }}
                />
              )
            })}
          </div>
        ) : (
          <EmptyEmployeeState fetchLists={fetchLists} mode="driver" title="No drivers found" />
        )}
      </div>
      
      {showDocuments && selectedEmployee && (
        <EmployeeDocuments 
          employee={selectedEmployee} 
          isOpen={showDocuments} 
          entityType="driver"
          onClose={() => { setShowDocuments(false); setSelectedEmployee(null); }} 
        />
      )}
      
      <Popup open={deleteOpen} onClose={() => setDeleteOpen(false)} showTrigger={false} size="md:max-w-md" space="p-8" bg="bg-black">
        <div className='w-full'>
          <h3 className='text-white text-xl font-bold mb-3'>Delete Driver</h3>
          <p className='text-gray-300 text-sm'>Are you sure you want to delete {deleteItem ? deleteItem.name : 'this driver'}?</p>
          <div className='flex justify-end gap-2 mt-6'>
            <button className='btn sm bg-gray-800 text-gray-200' onClick={() => setDeleteOpen(false)}>Cancel</button>
            <button 
              className='btn sm bg-red-700 text-white' 
              onClick={() => { 
                if (deleteItem?._id) {
                  Api.get(`/driver/remove/${deleteItem._id}`).then(() => {
                    toast.success('Driver removed');
                    fetchLists();
                  }).catch(() => toast.error('Failed to remove'));
                }
                setDeleteOpen(false); 
                setDeleteItem(null); 
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Popup>
    </AuthLayout>
  )
}

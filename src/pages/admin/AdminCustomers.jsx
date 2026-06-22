import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiSearch, FiShield } from 'react-icons/fi';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/ban`);
      toast.success(response.data.message);
      
      // Update local state
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isBanned: response.data.user.isBanned } : u
      ));
    } catch (err) {
      toast.error('Failed to update ban status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this customer? This cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success('Customer deleted successfully');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to delete customer');
      }
    }
  };

  // Search filter
  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchTerm))
    );
  });

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Search Header */}
      <div className="border-b border-luxury-gold/10 pb-4">
        <h2 className="font-serif text-lg text-luxury-black font-semibold mb-4">Customer Directory</h2>
        
        <div className="relative font-sans text-xs max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH BY CUSTOMER NAME, EMAIL, PHONE..."
            className="w-full bg-white border border-luxury-gold/20 pl-4 pr-10 py-3 uppercase tracking-wider focus:outline-none"
          />
          <span className="absolute right-3 top-3 text-luxury-gray text-lg">
            <FiSearch />
          </span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white p-6 border border-luxury-gold/25">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(n => <div key={n} className="h-14 skeleton"></div>)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-luxury-gold/20 text-luxury-gray font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Join Date</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((customer) => (
                    <tr key={customer._id} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-luxury-black">{customer.name}</p>
                        <p className="text-[9px] text-luxury-gray">{customer.email}</p>
                      </td>
                      <td className="py-3 px-4">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-mono">{customer.phoneNumber || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleBan(customer._id)}
                          className={`px-3 py-1 font-bold uppercase text-[9px] border transition-colors ${
                            customer.isBanned
                              ? 'bg-red-50 text-red-700 border-red-700 hover:bg-red-700 hover:text-white'
                              : 'bg-green-50 text-green-700 border-green-700 hover:bg-green-700 hover:text-white'
                          }`}
                        >
                          {customer.isBanned ? 'Suspended / Lift' : 'Active / Suspend'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(customer._id)}
                          className="text-red-700 hover:text-red-900 text-lg"
                          aria-label="Delete customer"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-luxury-gray italic">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;

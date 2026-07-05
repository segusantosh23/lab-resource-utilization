import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/equipment/${id}`);
        setEquipment(response.data);
      } catch (err) {
        setError('Failed to load equipment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
    </div>
  );

  if (error || !equipment) return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-12 text-center">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
      <p>{error || 'Equipment not found'}</p>
      <button onClick={() => navigate('/equipment')} className="mt-6 px-4 py-2 bg-white/[0.05] rounded-lg">Back to Inventory</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans relative">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{equipment.name}</h1>
            <p className="text-gray-400 mt-1">ID: #{equipment.id} &bull; Added to inventory</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden">
          
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
            
            {/* Primary Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border inline-block
                    ${equipment.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      equipment.status === 'UNDER_MAINTENANCE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {equipment.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Category</p>
                <p className="text-lg font-medium">{equipment.category}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Quantity</p>
                <p className="text-lg font-medium">{equipment.quantity} units</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                <p className="text-base text-gray-300 leading-relaxed">{equipment.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* Secondary Details */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Location & Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Department</p>
                  <p className="text-sm">{equipment.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Institution</p>
                  <p className="text-sm">{equipment.institution || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Manufacturer</p>
                  <p className="text-sm">{equipment.manufacturer || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Model Number</p>
                  <p className="text-sm">{equipment.modelNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Serial Number</p>
                  <p className="text-sm">{equipment.serialNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Purchase Date</p>
                  <p className="text-sm">{equipment.purchaseDate || '-'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Bar */}
          <div className="bg-[#161720] border-t border-white/[0.05] p-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">To edit this item, return to the inventory list.</p>
            <button onClick={() => navigate('/equipment')} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition shadow-lg shadow-purple-500/20">
              View All Equipment
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;

'use client';

import { useState, useEffect } from 'react';
import { appointmentAPI, providerAPI, uploadAPI, Appointment, Provider, ProviderWithTimeslots, Timeslot, Product } from '@/lib/api';

export default function ClientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [providerTimeslots, setProviderTimeslots] = useState<Timeslot[]>([]);
  const [providerProducts, setProviderProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [timeslotsLoading, setTimeslotsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeslot, setSelectedTimeslot] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadAppointments();
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      loadProviderTimeslots(selectedProvider.id);
      loadProviderProducts(selectedProvider.id);
    }
  }, [selectedProvider]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await appointmentAPI.getAll();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      setProvidersLoading(true);
      const data = await providerAPI.getAll(searchTerm);
      setProviders(data);
    } catch (err: any) {
      console.error('Failed to load providers:', err);
    } finally {
      setProvidersLoading(false);
    }
  };

  const loadProviderTimeslots = async (providerId: string) => {
    try {
      setTimeslotsLoading(true);
      const data = await providerAPI.getTimeslots(providerId);
      setProviderTimeslots(data.timeslots);
    } catch (err: any) {
      setError(err.message || 'Failed to load timeslots');
    } finally {
      setTimeslotsLoading(false);
    }
  };

  const loadProviderProducts = async (providerId: string) => {
    try {
      setProductsLoading(true);
      const data = await uploadAPI.getProviderProducts(providerId);
      setProviderProducts(data.products || []);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setProviderProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProviders();
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeslot || !appointmentDate) {
      setError('Please select a timeslot and date');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await appointmentAPI.create({
        timeslot_id: selectedTimeslot,
        appointment_date: appointmentDate,
      });
      setSuccess('Appointment booked successfully!');
      setSelectedTimeslot('');
      setAppointmentDate('');
      await loadAppointments();
      if (selectedProvider) {
        await loadProviderTimeslots(selectedProvider.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    }
  };

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setSelectedTimeslot('');
    setAppointmentDate('');
    setSelectedProduct(null);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await appointmentAPI.cancel(appointmentId);
      setSuccess('Appointment cancelled successfully!');
      await loadAppointments();
      if (selectedProvider) {
        await loadProviderTimeslots(selectedProvider.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Client Dashboard</h1>
          <p className="text-gray-600">Book appointments and manage your schedule</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-start shadow-sm">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg flex items-start shadow-sm">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Provider Search Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Find a Provider</h2>
              <p className="text-gray-600 text-sm">Search and browse available service providers</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, profession, or description..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Search
              </button>
            </div>
          </form>

          {providersLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No providers found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => handleSelectProvider(provider)}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    selectedProvider?.id === provider.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {provider.first_name[0]}{provider.last_name[0]}
                    </div>
                    {selectedProvider?.id === provider.id && (
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {provider.first_name} {provider.last_name}
                  </h3>
                  <p className="text-indigo-600 font-semibold mb-2">{provider.profession}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{provider.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProvider(provider);
                    }}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    View Timeslots
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Provider Timeslots and Booking */}
        {selectedProvider && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4">
                  {selectedProvider.first_name[0]}{selectedProvider.last_name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedProvider.first_name} {selectedProvider.last_name}
                  </h2>
                  <p className="text-indigo-600 font-semibold mb-2">{selectedProvider.profession}</p>
                  <p className="text-gray-600">{selectedProvider.description}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setProviderTimeslots([]);
                  setSelectedTimeslot('');
                  setAppointmentDate('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {timeslotsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Loading timeslots...</p>
              </div>
            ) : providerTimeslots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No available timeslots for this provider.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Timeslots
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {providerTimeslots.map((timeslot) => (
                      <button
                        key={timeslot.id}
                        onClick={() => {
                          setSelectedTimeslot(timeslot.id);
                          setError('');
                        }}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          selectedTimeslot === timeslot.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md bg-white'
                        } ${timeslot.booked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={timeslot.booked}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{timeslot.workingDays}</p>
                          {timeslot.booked && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Booked</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {timeslot.startTime} - {timeslot.endTime}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTimeslot && (
                  <form onSubmit={handleBookAppointment} className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Appointment
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="appointment_date" className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Date
                        </label>
                        <input
                          id="appointment_date"
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* My Appointments */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
              <p className="text-gray-600 text-sm">View and manage your booked appointments</p>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium mb-2">No appointments yet</p>
              <p>Book your first appointment above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                          {appointment.provider_first_name?.[0]}{appointment.provider_last_name?.[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {appointment.provider_first_name} {appointment.provider_last_name}
                          </h3>
                          {appointment.profession && (
                            <p className="text-indigo-600 font-medium mb-2">{appointment.profession}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {appointment.workingDays && (
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                              <p className="font-semibold text-gray-900">
                                {appointment.workingDays} - {appointment.startTime} to {appointment.endTime}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'booked' 
                            ? 'bg-green-100 text-green-800' 
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'booked' && (
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          {appointment.status}
                        </span>
                        <p className="text-xs text-gray-400">ID: {appointment.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    {appointment.status === 'booked' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="ml-4 flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CreditCard, Clock, Package, TrendingUp, PlusCircle, XCircle, Users } from 'lucide-react';
import { io } from 'socket.io-client';

const STATUS_OPTIONS = [
  'Accepted', 'Picked Up', 'Sorting', 'Washing', 
  'Drying', 'Ironing', 'Packaging', 'Quality Check', 
  'Ready For Pickup', 'Completed', 'Cancelled'
];

const STATUS_PROGRESS = {
  'Accepted': 10, 'Picked Up': 20, 'Sorting': 30,
  'Washing': 45, 'Drying': 55, 'Ironing': 70, 'Packaging': 80,
  'Quality Check': 90, 'Ready For Pickup': 95, 'Completed': 100, 'Cancelled': 0
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [mainTab, setMainTab] = useState('orders'); // orders | customers
  const [subTab, setSubTab] = useState('all'); // all | pending | active | completed
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [createOrderModal, setCreateOrderModal] = useState(null);
  const [orderForm, setOrderForm] = useState({
    serviceType: '', pickupDate: '', deliveryDate: '', phone: '',
    pickupAddress: { street: '', city: '', state: '', zipCode: '' },
    paymentMethod: 'Pay At Office', deliveryType: 'Normal', specialInstructions: '',
    laundryWeight: '', quantity: '', price: ''
  });
  const socketRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchServices();

    const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['polling'],
        reconnection: true,
        reconnectionDelay: 1000,
      });
    }

    const socket = socketRef.current;
    socket.on('newOrder', fetchOrders);
    socket.on('orderStatusUpdated', fetchOrders);
    socket.on('paymentUpdated', fetchOrders);

    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdated');
      socket.off('paymentUpdated');
    };
  }, []);

  const fetchOrders = async () => {
    try { 
      const res = await api.get('/orders/all'); 
      setOrders(res.data); 
    } catch (e) { 
      console.error('Error fetching orders:', e); 
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/users');
      setCustomers(res.data.filter(u => u.role === 'Customer'));
    } catch (e) { 
      console.error('Error fetching customers:', e); 
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.filter(s => s.isActive));
    } catch (e) { 
      console.error('Error fetching services:', e); 
    }
  };

  const handleCreateOrder = async () => {
    if (!orderForm.serviceType || !orderForm.pickupDate || !orderForm.deliveryDate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        customerId: createOrderModal._id,
        serviceType: orderForm.serviceType,
        pickupDate: orderForm.pickupDate,
        deliveryDate: orderForm.deliveryDate,
        pickupAddress: orderForm.pickupAddress,
        phone: orderForm.phone || createOrderModal.phone,
        paymentMethod: orderForm.paymentMethod,
        deliveryType: orderForm.deliveryType,
        specialInstructions: orderForm.specialInstructions,
        laundryWeight: orderForm.laundryWeight ? Number(orderForm.laundryWeight) : undefined,
        quantity: orderForm.quantity ? Number(orderForm.quantity) : undefined,
        price: orderForm.price ? Number(orderForm.price) : undefined
      };

      await api.post('/orders/create', payload);
      setCreateOrderModal(null);
      setOrderForm({
        serviceType: '', pickupDate: '', deliveryDate: '', phone: '',
        pickupAddress: { street: '', city: '', state: '', zipCode: '' },
        paymentMethod: 'Pay At Office', deliveryType: 'Normal', specialInstructions: '',
        laundryWeight: '', quantity: '', price: ''
      });
      await fetchOrders();
      alert('Order created successfully!');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create order');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      const progress = STATUS_PROGRESS[status] ?? 50;
      await api.put('/orders/status', { orderId, status, progress });
      await fetchOrders();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentUpdate = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      await api.put('/orders/payment', {
        orderId: paymentModal._id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        note: paymentNote
      });
      setPaymentModal(null);
      setPaymentAmount('');
      setPaymentMethod('Cash');
      setPaymentNote('');
      await fetchOrders();
      alert('Payment recorded successfully!');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update payment');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const activeOrders = orders.filter(o => o.status !== 'Pending' && o.status !== 'Completed' && o.status !== 'Cancelled');
  const completedOrders = orders.filter(o => o.status === 'Completed');

  const filteredOrders = subTab === 'pending' ? pendingOrders :
                         subTab === 'active' ? activeOrders :
                         subTab === 'completed' ? completedOrders : orders;

  const openCreateOrderModal = (customer) => {
    setCreateOrderModal(customer);
    setOrderForm({
      serviceType: services[0]?._id || '',
      pickupDate: '',
      deliveryDate: '',
      phone: customer.phone || '',
      pickupAddress: { street: '', city: '', state: '', zipCode: '' },
      paymentMethod: 'Pay At Office',
      deliveryType: 'Normal',
      specialInstructions: '',
      laundryWeight: '',
      quantity: '',
      price: ''
    });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Order <span className="gradient-text">Management</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Assign orders to customers, track progress, and manage payments.</p>
      </motion.div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setMainTab('orders')}
          className={mainTab === 'orders' ? 'premium-btn' : 'premium-btn-outline'}
          style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Package size={16} /> All Orders ({orders.length})
        </button>
        <button
          onClick={() => setMainTab('customers')}
          className={mainTab === 'customers' ? 'premium-btn' : 'premium-btn-outline'}
          style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Users size={16} /> Customers ({customers.length})
        </button>
      </div>

      {/* Orders Main Tab */}
      {mainTab === 'orders' && (
        <>
          {/* Sub-tabs for orders */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All', count: orders.length, icon: Package },
              { id: 'pending', label: 'Pending', count: pendingOrders.length, icon: Clock },
              { id: 'active', label: 'Active', count: activeOrders.length, icon: TrendingUp },
              { id: 'completed', label: 'Completed', count: completedOrders.length, icon: CheckCircle }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                className={subTab === t.id ? 'premium-btn' : 'premium-btn-outline'}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <t.icon size={14} />
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Paid</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        {subTab === 'all' ? 'No orders yet. Go to Customers tab to create orders.' : 
                         `No ${subTab} orders found.`}
                      </td>
                    </tr>
                  )}
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                      <td>
                        <div>{order.customer?.name || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{order.customer?.phone}</div>
                      </td>
                      <td>{order.serviceType?.name || 'N/A'}</td>
                      <td style={{ color: '#FFD700', fontWeight: 600 }}>Rs. {order.price || 0}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>Rs. {order.paidAmount || 0}</td>
                      <td>
                        <span className={`badge ${
                          order.paymentStatus === 'Paid' ? 'badge-completed' :
                          order.paymentStatus === 'Partial' ? 'badge-active' : 'badge-pending'
                        }`}>
                          {order.paymentStatus || 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          order.status === 'Completed' ? 'badge-completed' :
                          order.status === 'Cancelled' ? 'badge-rejected' : 'badge-active'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${order.progress || 0}%`, 
                              height: '100%', 
                              background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#FFD700' }}>{order.progress || 0}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order._id}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className="premium-input"
                              style={{ padding: '0.3rem', fontSize: '0.75rem', height: 'auto', width: 'auto' }}
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
                              ))}
                            </select>
                          )}

                          {order.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => setPaymentModal(order)}
                              className="premium-btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: '#10b981', color: '#10b981' }}
                            >
                              <CreditCard size={12} /> Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Customers Main Tab */}
      {mainTab === 'customers' && (
        <motion.div className="card-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="#FFD700" />
            All Customers ({customers.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Active Orders</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No customers registered yet.
                    </td>
                  </tr>
                )}
                {customers.map((customer) => {
                  const customerOrders = orders.filter(o => o.customer?._id === customer._id);
                  const activeCount = customerOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
                  
                  return (
                    <tr key={customer._id}>
                      <td style={{ fontWeight: 600 }}>{customer.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{customer.email}</td>
                      <td style={{ fontSize: '0.85rem' }}>{customer.phone || 'N/A'}</td>
                      <td>
                        <span style={{ color: '#FFD700', fontWeight: 600 }}>{customerOrders.length}</span>
                      </td>
                      <td>
                        <span style={{ color: '#3b82f6', fontWeight: 600 }}>{activeCount}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => openCreateOrderModal(customer)}
                          className="premium-btn"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <PlusCircle size={14} /> Create Order
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create Order Modal */}
      <AnimatePresence>
        {createOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '1rem', overflowY: 'auto'
            }}
            onClick={() => setCreateOrderModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-3d"
              style={{ padding: '2rem', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PlusCircle size={20} color="#FFD700" />
                  Create Order for {createOrderModal.name}
                </h3>
                <button onClick={() => setCreateOrderModal(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <XCircle size={24} />
                </button>
              </div>

              <div style={{ background: 'rgba(255,215,0,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>Customer Details</div>
                <div style={{ fontWeight: 600, marginTop: '0.3rem' }}>{createOrderModal.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{createOrderModal.email} • {createOrderModal.phone || 'No phone'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Service *</label>
                  <select
                    value={orderForm.serviceType}
                    onChange={(e) => {
                      const service = services.find(s => s._id === e.target.value);
                      setOrderForm({
                        ...orderForm,
                        serviceType: e.target.value,
                        price: service?.price || ''
                      });
                    }}
                    className="premium-input"
                    style={{ width: '100%' }}
                    required
                  >
                    <option value="" style={{ background: '#111' }}>Select Service</option>
                    {services.map(s => (
                      <option key={s._id} value={s._id} style={{ background: '#111' }}>
                        {s.name} - Rs. {s.price} ({s.priceType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Price (Rs.) *</label>
                  <input
                    type="number"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm({...orderForm, price: e.target.value})}
                    placeholder="Total price"
                    className="premium-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Phone</label>
                  <input
                    type="text"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                    placeholder="Contact number"
                    className="premium-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Pickup Date *</label>
                  <input
                    type="date"
                    value={orderForm.pickupDate}
                    onChange={(e) => setOrderForm({...orderForm, pickupDate: e.target.value})}
                    className="premium-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Delivery Date *</label>
                  <input
                    type="date"
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm({...orderForm, deliveryDate: e.target.value})}
                    className="premium-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Delivery Type</label>
                  <select
                    value={orderForm.deliveryType}
                    onChange={(e) => setOrderForm({...orderForm, deliveryType: e.target.value})}
                    className="premium-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Normal" style={{ background: '#111' }}>Normal (48 Hours)</option>
                    <option value="Express" style={{ background: '#111' }}>Express (24 Hours)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Payment Method</label>
                  <select
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                    className="premium-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Pay At Office" style={{ background: '#111' }}>Pay At Office</option>
                    <option value="WhatsApp Payment" style={{ background: '#111' }}>WhatsApp Payment</option>
                    <option value="Cash" style={{ background: '#111' }}>Cash</option>
                    <option value="Bank Transfer" style={{ background: '#111' }}>Bank Transfer</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Street Address</label>
                  <input
                    type="text"
                    value={orderForm.pickupAddress.street}
                    onChange={(e) => setOrderForm({...orderForm, pickupAddress: {...orderForm.pickupAddress, street: e.target.value}})}
                    placeholder="Street address"
                    className="premium-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>City</label>
                  <input
                    type="text"
                    value={orderForm.pickupAddress.city}
                    onChange={(e) => setOrderForm({...orderForm, pickupAddress: {...orderForm.pickupAddress, city: e.target.value}})}
                    placeholder="City"
                    className="premium-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>State</label>
                  <input
                    type="text"
                    value={orderForm.pickupAddress.state}
                    onChange={(e) => setOrderForm({...orderForm, pickupAddress: {...orderForm.pickupAddress, state: e.target.value}})}
                    placeholder="State"
                    className="premium-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Weight (kg)</label>
                  <input
                    type="number"
                    value={orderForm.laundryWeight}
                    onChange={(e) => setOrderForm({...orderForm, laundryWeight: e.target.value})}
                    placeholder="Optional"
                    className="premium-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Quantity (items)</label>
                  <input
                    type="number"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                    placeholder="Optional"
                    className="premium-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Special Instructions</label>
                  <textarea
                    value={orderForm.specialInstructions}
                    onChange={(e) => setOrderForm({...orderForm, specialInstructions: e.target.value})}
                    placeholder="Any special instructions..."
                    className="premium-input"
                    style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleCreateOrder}
                  className="premium-btn"
                  style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
                >
                  <CheckCircle size={16} /> Create Order
                </button>
                <button
                  onClick={() => setCreateOrderModal(null)}
                  className="premium-btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '1rem'
            }}
            onClick={() => setPaymentModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-3d"
              style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="#FFD700" />
                Record Payment
              </h3>
              
              <div style={{ background: 'rgba(255,215,0,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#888' }}>Order #{paymentModal._id.slice(-6).toUpperCase()}</span>
                  <span style={{ color: '#FFD700', fontWeight: 600 }}>Rs. {paymentModal.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#888' }}>Already Paid</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Rs. {paymentModal.paidAmount || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                  <span style={{ color: '#888' }}>Remaining</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>Rs. {(paymentModal.price - (paymentModal.paidAmount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Amount (Rs.)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="premium-input"
                    style={{ width: '100%' }}
                    max={paymentModal.price - (paymentModal.paidAmount || 0)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="premium-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Cash" style={{ background: '#111' }}>Cash</option>
                    <option value="Bank Transfer" style={{ background: '#111' }}>Bank Transfer</option>
                    <option value="WhatsApp Payment" style={{ background: '#111' }}>WhatsApp Payment</option>
                    <option value="JazzCash" style={{ background: '#111' }}>JazzCash</option>
                    <option value="EasyPaisa" style={{ background: '#111' }}>EasyPaisa</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Note (Optional)</label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Any note..."
                    className="premium-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={handlePaymentUpdate}
                    className="premium-btn"
                    style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
                  >
                    <CheckCircle size={16} /> Record Payment
                  </button>
                  <button
                    onClick={() => setPaymentModal(null)}
                    className="premium-btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
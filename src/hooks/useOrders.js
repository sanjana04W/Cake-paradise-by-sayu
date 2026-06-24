import { useState, useEffect } from 'react';
import { 
  getOrders, 
  getOrderById, 
  subscribeToOrders,
  createOrder,
  updateOrderStatus
} from '../firebase/firestore';

export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // In a real app, we'd use the realtime listener
        // For now, we'll just fetch once to simplify
        const data = await getOrders(filters);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [JSON.stringify(filters)]);

  return { orders, loading, error, setOrders };
};

export const useOrderDetail = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      setLoading(true);
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return { order, loading, error, setOrder };
};

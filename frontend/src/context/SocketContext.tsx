import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle real-time task updates
    newSocket.on('task:created', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    newSocket.on('task:updated', ({ task, changes }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['task', task._id] });
      
      // Only show toast if the update was made by someone else
      // (The mutation already shows a toast for the current user)
      const taskCreatorId = typeof task.creatorId === 'string' 
        ? task.creatorId 
        : task.creatorId?.id || task.creatorId?._id;
      const taskAssigneeId = typeof task.assignedToId === 'string'
        ? task.assignedToId
        : task.assignedToId?.id || task.assignedToId?._id;
      
      // Don't show toast if current user is creator or assignee (they already see the mutation toast)
      if (user && taskCreatorId !== user.id && taskAssigneeId !== user.id) {
        if (changes.includes('status') || changes.includes('priority') || changes.includes('assignee')) {
          toast.success(`📋 Task "${task.title}" has been updated`);
        }
      }
    });

    newSocket.on('task:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Handle notifications
    newSocket.on('notification:new', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast(notification.message, { icon: '🔔' });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

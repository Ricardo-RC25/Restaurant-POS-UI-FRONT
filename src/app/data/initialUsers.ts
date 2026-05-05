import { User } from '../types';

export const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Administrador Principal',
    email: 'admin@restaurant.com',
    phone: '555-0001',
    role: 'admin',
    active: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    username: 'cajero',
    password: 'cajero123',
    name: 'Juan Pérez',
    email: 'cajero@restaurant.com',
    phone: '555-0002',
    role: 'cashier',
    active: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    username: 'mesero',
    password: 'mesero123',
    name: 'María García',
    email: 'mesero@restaurant.com',
    phone: '555-0003',
    role: 'waiter',
    active: true,
    createdAt: new Date('2024-01-01'),
  },
];

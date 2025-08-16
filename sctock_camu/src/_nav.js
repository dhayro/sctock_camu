import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilPeople,
  cilUser,
  cilStorage,
  cilBasket,
  cilTruck,
  cilClipboard,
  cilLockLocked,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  
  // Nuevo grupo de menú para el sistema de Stock Camu
  {
    component: CNavTitle,
    name: 'Sistema Stock Camu',
  },
  {
    component: CNavGroup,
    name: 'Maestros del Sistema',
    to: '/maestros',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Roles',
        to: '/maestros/roles',
      },
      {
        component: CNavItem,
        name: 'Áreas',
        to: '/maestros/areas',
      },
      {
        component: CNavItem,
        name: 'Cargos',
        to: '/maestros/cargos',
      },
      {
        component: CNavItem,
        name: 'Personal',
        to: '/maestros/personal',
      },
      {
        component: CNavItem,
        name: 'Usuarios',
        to: '/maestros/usuarios',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Gestión de Socios',
    to: '/socios',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Socios',
        to: '/socios',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Gestión de Productos',
    to: '/productos',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Tipos de Fruta',
        to: '/productos/tipos-fruta',
      },
      {
        component: CNavItem,
        name: 'Unidades de Medida',
        to: '/productos/unidades-medida',
      },
      {
        component: CNavItem,
        name: 'Productos',
        to: '/productos',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Gestión de Clientes',
    to: '/clientes',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Clientes',
        to: '/clientes', // Ensure this matches your route for managing clients
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Gestión de Pedidos',
    to: '/pedidos',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Ordenes de Compra',
        to: '/pedidos/ordenes-compra',
      },
      {
        component: CNavItem,
        name: 'Ingresos',
        to: '/pedidos/ingresos',
      }
    ],
  }
  
  
]

export default _nav
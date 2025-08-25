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
  cilSearch,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
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
        to: '/clientes',
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
  },
  {
    component: CNavGroup,
    name: 'Consultas',
    to: '/consultas',
    icon: <CIcon icon={cilSearch} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Consulta de Socios',
        to: '/consultas/socios',
      },
      {
        component: CNavItem,
        name: 'Consulta de Clientes',
        to: '/consultas/clientes',
      },
      {
        component: CNavItem,
        name: 'Ingresos por Socio',
        to: '/consultas/ingresos-por-socio',
      }
    ],
  }
]

export default _nav
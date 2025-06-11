import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UserTypeSelection from './pages/UserTypeSelection'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import AddCompany from './pages/AddCompany'
import MyCompanies from './pages/MyCompanies'
import CompanyDetail from './pages/CompanyDetail'
import Layout from './components/Layout'
import './styles/App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<UserTypeSelection />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-company" element={<AddCompany />} />
        <Route path="/my-companies" element={<MyCompanies />} />
        <Route path="/company/:id" element={<CompanyDetail />} />
      </Routes>
    </Layout>
  )
}

export default App

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import NewCase from './pages/NewCase'
import Capture from './pages/Capture'
import Result from './pages/Result'

export default function App () {
	return (
		<Routes>
			<Route path='/' element={<Layout />}> 
				<Route index element={<NewCase />} />
				<Route path='capture/:id' element={<Capture />} />
				<Route path='result/:id' element={<Result />} />
			</Route>
		</Routes>
	)
}



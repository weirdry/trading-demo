import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Market from './pages/Market'

function App() {
	return (
		<Router>
			<div className="App">
				<Routes>
					<Route path="/" element={<Market />} />
				</Routes>
			</div>
		</Router>
	)
}

export default App

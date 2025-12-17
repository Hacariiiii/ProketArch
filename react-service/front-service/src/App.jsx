import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/Auth/PrivateRoute';
import Home from './components/Home/Home';
import Profile from "./components/Home/Profile";
import Shop from "./components/Home/Shop";
import About from "./components/Home/About";
import Location from "./components/Home/Location";
import MyOrders from "./components/Home/MyOrders.jsx";


export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
                    <Route path="/location" element={<PrivateRoute><Location /></PrivateRoute>} />
                    <Route path="/shop" element={<PrivateRoute><Shop /></PrivateRoute>} />
                    <Route
                        path="/my-orders"
                        element={
                            <PrivateRoute>
                                <MyOrders />
                            </PrivateRoute>
                        }
                    />


                    <Route path="/" element={<Navigate to="/home" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

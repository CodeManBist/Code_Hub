import React, { useEffect } from "react";
import { useNavigate, useRoutes } from 'react-router-dom';

// Page List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

// Auth Context
import { useAuth, AuthProvider } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const Navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userId");

        if(userId) {
            setCurrentUser(userId);
        }

        if(!userId && !["/auth", "/signup"].includes(window.location.pathname)) {
            Navigate("/auth");
        }; 

        if(userId && ["/auth", "/signup"].includes(window.location.pathname)) {
            Navigate("/dashboard");
        }
    }, [currentUser,setCurrentUser, Navigate]);

    let element = useRoutes([
        {
            path: "/dashboard",
            element: <Dashboard />
        },
        {
            path: "/profile",
            element: <Profile />
        },
        {
            path: "/auth",
            element: <Login />
        },
        {
            path: "/signup",
            element: <Signup />
        },
    ]);

    return element;
}

export default ProjectRoutes;
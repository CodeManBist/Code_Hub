import React, { useEffect } from "react";
import { Navigate as Redirect, useLocation, useNavigate, useRoutes } from 'react-router-dom';

// Page List
import Dashboard from "./components/dashboard/Dashboard";
import Users from "./components/user/Users";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

// Auth Context
import { useAuth, AuthProvider } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (userId && currentUser !== userId) {
            setCurrentUser(userId);
        }

        if (!userId && !["/auth", "/signup"].includes(location.pathname)) {
            navigate("/auth", { replace: true });
        }

        if (userId && ["/auth", "/signup"].includes(location.pathname)) {
            navigate("/dashboard", { replace: true });
        }
    }, [currentUser, location.pathname, navigate, setCurrentUser, userId]);

    let element = useRoutes([
        {
            path: "/",
            element: <Redirect to={userId ? "/dashboard" : "/auth"} replace />
        },
        {
            path: "/dashboard",
            element: <Dashboard />
        },
        {
            path: "/users",
            element: <Users />
        },
        {
            path: "/profile",
            element: <Profile />
        },
        {
            path: "/profile/:id",
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
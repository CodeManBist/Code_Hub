import React, { useEffect } from "react";
import { Navigate as Redirect, useRoutes } from 'react-router-dom';

// Page List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import RepoDetail from "./components/repo/RepoDetail";
import RepoIssues from "./components/repo/RepoIssues";
import CreateRepository from "./components/repo/CreateRepository";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const isAuthenticated = Boolean(userId && token);

    useEffect(() => {
        if (isAuthenticated && currentUser !== userId) {
            setCurrentUser(userId);
            return;
        }

        if (!isAuthenticated && currentUser !== null) {
            setCurrentUser(null);
        }
    }, [currentUser, isAuthenticated, setCurrentUser, userId]);

    let element = useRoutes([
        {
            path: "/",
            element: <Redirect to={isAuthenticated ? "/dashboard" : "/auth"} replace />
        },
        {
            path: "/dashboard",
            element: isAuthenticated ? <Dashboard /> : <Redirect to="/auth" replace />
        },
        {
            path: "/repo/:id",
            element: isAuthenticated ? <RepoDetail /> : <Redirect to="/auth" replace />
        },
        {
            path: "/repo/:id/issues",
            element: isAuthenticated ? <RepoIssues /> : <Redirect to="/auth" replace />
        },
        {
            path: "/repo/create",
            element: isAuthenticated ? <CreateRepository /> : <Redirect to="/auth" replace />
        },
        {
            path: "/profile",
            element: isAuthenticated ? <Profile /> : <Redirect to="/auth" replace />
        },
        {
            path: "/profile/:id",
            element: isAuthenticated ? <Profile /> : <Redirect to="/auth" replace />
        },
        {
            path: "/auth",
            element: isAuthenticated ? <Redirect to="/dashboard" replace /> : <Login />
        },
        {
            path: "/signup",
            element: isAuthenticated ? <Redirect to="/dashboard" replace /> : <Signup />
        },
    ]);

    return element;
}

export default ProjectRoutes;
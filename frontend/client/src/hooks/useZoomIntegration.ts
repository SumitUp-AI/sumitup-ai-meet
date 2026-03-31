import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../utils/apiHeaders";

// Custom Hook for useZoomIntegration, Implemented Later
const useZoomIntegration = () => {
    
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1/";
    const { token, user } = useAuth();

    const fetchStatus = async () => {
        if (!token || !user) throw new Error("User or Token must not be null!")
        const res = await fetch(`${BASE_URL}/zoom/status`, {
            headers: getAuthHeaders(token, user?.tenant_id)
        })
        const data = await res.json()
        setStatus(data.zoom_connected)
        setLoading(false)
    }

    const connect = () => {
        // redirect to /zoom/authorize
    }

    const disconnect = async () => {
        // call /zoom/disconnect
    }

    useEffect(() => { fetchStatus() }, [])

    return { status, loading, connect, disconnect }
}
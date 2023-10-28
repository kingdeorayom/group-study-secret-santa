'use client'

import Layout from '@/layouts/Layout';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const Home = () => {

    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('secret-santa-login-token');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            router.push('/'); // Redirect to login page
        }
    }, []);

    const handleLogout = () => {
        if (isLoggedIn) {
            localStorage.removeItem('secret-santa-login-token');
            router.push('/'); // Redirect to login page
        } else {
            console.error('Logout failed. User is not logged in.');
        }
    }

    return (
        <Layout>
            <Button onClick={handleLogout}>Log out</Button>
        </Layout>
    )
}

export default Home;

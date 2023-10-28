'use client'

import Layout from '@/layouts/Layout';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Home = () => {

    const router = useRouter();

    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('secret-santa-login-token');
        if (!token) {
            router.push('/');
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = () => {
        if (isLoggedIn) {
            setIsLoggedIn(false);
            localStorage.removeItem('secret-santa-login-token');
            router.push('/');
        } else {
            console.error('Logout failed. User is not logged in.');
        }
    }

    return !isLoading && isLoggedIn && (
        <Layout>
            <Button onClick={handleLogout}>Log out</Button>
        </Layout>
    );

}

export default Home;

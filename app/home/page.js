'use client'

import Layout from '@/layouts/Layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Profile from '@/components/Profile';
import SecretSantaGenerator from '@/components/SecretSantaGenerator';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return !isLoading && isLoggedIn && (
        <Layout>
            <Tabs defaultValue="secretSantaGenerator" className="mb-20">
                <TabsList className="mb-6">
                    <TabsTrigger value="secretSantaGenerator">Pick a participant</TabsTrigger>
                    <TabsTrigger value="profile">Your Profile</TabsTrigger>
                </TabsList>
                <TabsContent value="secretSantaGenerator">
                    <SecretSantaGenerator />
                </TabsContent>
                <TabsContent value="profile">
                    <Profile
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                        router={router}
                    />
                </TabsContent>
            </Tabs>

        </Layout>
    );

}

export default Home;

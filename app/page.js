'use client'

import LoginForm from "@/components/forms/LoginForm"
import RegistrationForm from "@/components/forms/RegistrationForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Layout from "@/layouts/Layout"
import { useEffect, useState } from 'react';

const Home = () => {

  // Define a state variable to track the user's login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the token is present in local storage
    const token = localStorage.getItem('token');
    if (token) {
      // The user is logged in if the token is present
      setIsLoggedIn(true);
    } else {
      // The user is not logged in
      setIsLoggedIn(false);
    }
  }, []);

  return (

    <Layout>
      {isLoggedIn ? ( // Check the login status to conditionally render content
        <div>
          {/* Render content for logged-in users, e.g., user dashboard */}
          <p>Logged in</p>
        </div>
      ) : (
        <Tabs defaultValue="login">
          <TabsList className="mb-4">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="registration">
            <RegistrationForm />
          </TabsContent>
        </Tabs>
      )}
    </Layout>



  )
}

export default Home
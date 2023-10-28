'use client'

import Authentication from "@/components/auth/Authentication";
import Layout from "@/layouts/Layout"
import { useEffect, useState } from 'react';
import TokenProgress from "@/components/auth/TokenProgress";
import { useRouter } from "next/navigation";

const App = () => {

  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      const token = localStorage.getItem('secret-santa-login-token');
      if (token) {
        setIsLoggedIn(true);
        // Redirect to "/home" if the user is logged in
        router.push('/home'); // Use router.push to navigate
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    }, 2000);
    const progressTimer = setTimeout(() => setProgress(90), 500);
    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(progressTimer);
    };
  }, []);

  return (
    <>
      {
        !isLoggedIn && isLoading && (
          <TokenProgress progress={progress} />
        )
      }
      {
        !isLoggedIn && !isLoading && (
          <Layout>
            <Authentication />
          </Layout>
        )
      }
    </>
  );

}

export default App;

'use client'

import Authentication from "@/components/auth/Authentication";
import Layout from "@/layouts/Layout"
import { useEffect, useState } from 'react';
import TokenProgress from "@/components/auth/TokenProgress";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const App = () => {

  const router = useRouter();

  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      const token = localStorage.getItem('secret-santa-login-token');
      if (token) {
        setIsLoggedIn(true);
        router.push('/home');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsLoggedIn]);

  return (
    <>
      {
        !isLoggedIn && isLoading && (
          <Layout>
            <TokenProgress progress={progress} />
          </Layout>
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

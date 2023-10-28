'use client'

import Authentication from "@/components/auth/Authentication";
import Layout from "@/layouts/Layout"
import { useEffect, useState } from 'react';
import TokenProgress from "@/components/auth/TokenProgress";

const Home = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      const token = localStorage.getItem('secret-santa-login-token');
      if (token) {
        setIsLoggedIn(true);
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
        isLoggedIn && (
          <Layout>
            <div>
              <p>Logged in</p>
            </div>
          </Layout>
        )
      }
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

export default Home;

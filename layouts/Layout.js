import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <main className="w-full max-w-screen-xl mx-auto my-10 px-4 py-4 md:my-10 md:px-4 flex-grow flex flex-col items-center justify-center">
                {children}
            </main>
            <Footer />
        </>
    );
};

export default Layout;

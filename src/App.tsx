import { Route, Routes } from 'react-router-dom';
import './globals.css';
import SigninForm from './auth/forms/SigninForm';
import { Home } from './root/pages';
import SignupForm from './auth/forms/SignupForm';
import AuthLayout from './auth/AuthLayout';
import RootLayout from './root/RootLayout';

const App = () => {
    return (
        // takes the entire screen height
        <main className='flex h-screen'>
            <Routes>
                {/* public routes */}
                <Route element={<AuthLayout />}>
                    <Route path='/sign-in' element={<SigninForm />} />
                    <Route path='/sign-up' element={<SignupForm />} />
                </Route>
                {/* private routes */}
                <Route element={<RootLayout />}>
                    <Route index element={<Home />} />
                </Route>
            </Routes>
        </main>
    );
};

export default App;
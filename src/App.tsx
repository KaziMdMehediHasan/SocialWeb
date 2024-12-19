import { Route, Routes } from 'react-router-dom';
import './globals.css';
import SigninForm from './auth/forms/SigninForm';
import { AllUsers, CreatePost, Explore, Home, LikedPosts, PostDetails, Profile, Saved, UpdatePost, UpdateProfile } from './root/pages';
import SignupForm from './auth/forms/SignupForm';
import AuthLayout from './auth/AuthLayout';
import RootLayout from './root/RootLayout';
import { Toaster } from "@/components/ui/toaster"

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
                    <Route index path='/' element={<Home />} />
                    <Route path='/explore' element={<Explore />} />
                    <Route path='/saved' element={<Saved />} />
                    <Route path='/all-users' element={<AllUsers />} />
                    <Route path='/create-post' element={<CreatePost />} />
                    <Route path='/update-post/:id' element={<UpdatePost />} />
                    <Route path='/posts/:id' element={<PostDetails />} />
                    <Route path='/profile/:id/*' element={<Profile />} />
                    <Route path='/update-profile/:id' element={<UpdateProfile />} />
                    <Route path='/liked-posts' element={<LikedPosts />} />
                </Route>
            </Routes>
            <Toaster />
        </main>
    );
};

export default App;
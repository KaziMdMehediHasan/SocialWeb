import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations"
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";

const Topbar = () => {

    const { mutate: signOut, isSuccess } = useSignOutAccount();
    const navigate = useNavigate();
    const { user } = useUserContext()

    // reloads the page on isSuccess
    useEffect(() => {
        if (isSuccess) {
            navigate(0); //navigates to sign-in page
        }
    }, [isSuccess])


    return (
        <section className="topbar">
            {/* wrapping div */}
            <div className="flex-between py-4 px-5">
                {/* website logo */}
                <Link to='/' className="flex gap-3 items-center">
                    <img
                        src='../../../public/assets/images/logo.svg'
                        alt='logo'
                        width={130}
                        height={325}
                    />
                </Link>
                <div className="flex gap-4">
                    {/* logout button */}
                    <Button
                        variant='ghost'
                        className="shad-button_ghost"
                        onClick={() => signOut()}
                    >
                        <img
                            src="../../../public/assets/icons/logout.svg"
                            alt="logout"
                        />
                    </Button>
                    {/* profile link with the avatar*/}
                    <Link to={`/profile/${user.id}`} className="flex-center gap-3">
                        <img
                            src={user.imageUrl || '/assets/images/profile-placeholder.svg'}
                            alt="profile"
                            className="h-8 w-8 rounded-full"
                        />
                    </Link>
                </div>
            </div>
            TopBar
        </section >
    )
}

export default Topbar
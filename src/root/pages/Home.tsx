import Loader from "@/components/shared/Loader";
import PostComponent from "@/components/shared/PostComponent";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";

const Home = () => {
    const { data: posts, isPending: isPostLoading, isError: postsFetchingError } = useGetRecentPosts();

    console.log(posts?.documents);
    return (
        <div className="flex flex-1">
            <div className="home-container">
                <div className="home-posts">
                    <h2 className="h3-bold md:h2-bold text-left w-full">
                        Home Feed
                    </h2>
                    {
                        isPostLoading && !posts ? (
                            <Loader />
                        ) : (
                            <ul className="flex flex-col flex-1 gap-0 w-full">
                                {
                                    posts?.documents.map((post: Models.Document, index) => (
                                        <PostComponent post={post} key={index} />
                                    ))
                                }
                            </ul>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Home
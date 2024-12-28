import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite"
import { useState, useEffect } from "react";
import Loader from "./Loader";

type Props = {
    post: Models.Document;
    userId: string;
}

const PostNumbers = ({ post, userId }: Props) => {
    // list of the users who liked the post
    const likesList = post.likes.map((user: Models.Document) => user.$id);

    const [likes, setLikes] = useState(likesList);
    const [isSaved, setIsSaved] = useState(false);

    const { mutate: likePost } = useLikePost();
    const { mutate: savePost, isPending: savingPostLoader } = useSavePost();
    const { mutate: deleteSavedPost, isPending: removeSavedPostLoader } = useDeleteSavedPost();

    const { data: currentUser } = useGetCurrentUser();

    // getting the post that user saved
    const alreadySavedPost = currentUser?.save.find((savedPost: Models.Document) => savedPost.post.$id === post.$id);

    useEffect(() => {
        // setIsSaved(savedPostRecord? true: false);
        setIsSaved(!!alreadySavedPost); // this expression makes a truthy value falsy and falsy value truthy
    }, [currentUser])


    const handleLikePost = (e: React.MouseEvent) => {
        e.stopPropagation();
        let newLikes = [...likes];

        const hasLiked = newLikes.includes(userId);
        if (hasLiked) {
            newLikes = newLikes.filter((id) => id !== userId);
        } else {
            newLikes.push(userId);
        }

        setLikes(newLikes);
        likePost({ postId: post.$id, likesArray: newLikes });
    }
    const handleSavePost = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (alreadySavedPost) {
            setIsSaved(false);
            deleteSavedPost(alreadySavedPost.$id);

        } else {
            savePost({ postId: post.$id, userId });
            setIsSaved(true);
        }

    }
    return (
        <div className="flex justify-between items-center z-20">
            <div className="flex gap-2 mr-5">
                <img
                    src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
                    alt="like"
                    width={20}
                    height={20}
                    onClick={handleLikePost}
                    className="cursor-pointer"
                />
                <p className="small-medium lg:base-medium">{likes.length}</p>
            </div>
            <div className="flex gap-2">
                {savingPostLoader || removeSavedPostLoader ?
                    (<Loader />) :
                    (<img
                        src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
                        alt="like"
                        width={20}
                        height={20}
                        onClick={handleSavePost}
                        className="cursor-pointer"
                    />)}

            </div>
        </div>
    )
}

export default PostNumbers



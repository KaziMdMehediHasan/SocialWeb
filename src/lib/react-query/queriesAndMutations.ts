import { INewPost, INewUser } from "@/types"
import { createUserAccount, saveNewPostToDB, signInAccount, signOutAccount } from "../appwrite/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}
export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: { email: string; password: string }) => signInAccount(user)
    })
}
export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: () => signOutAccount()
    })
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: INewPost) => saveNewPostToDB(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: 'getRecentPosts',
            });
        },
    });
}

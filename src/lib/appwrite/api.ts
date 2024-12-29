import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { ID, ImageGravity, Query } from "appwrite";

// a new user registration 
export async function createUserAccount(user: INewUser) {
    try {
        // registering a new account to appwrite
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.username
        )

        if (!newAccount) throw Error;

        // getting the avatarUrl from the new account and storing it for later use
        const avatarUrl = avatars.getInitials(user.name);

        // storing the user to appwrite database
        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            email: newAccount.email,
            name: newAccount.name,
            username: user.username,
            imageUrl: avatarUrl
        })

        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}

// saving user to the database
export const saveUserToDB = async (user: { accountId: string; email: string; name: string; imageUrl: string; username?: string }) => {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        )
        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const signInAccount = async (user: { email: string; password: string }) => {
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);
        return session;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];

    } catch (error) {
        console.log(error);
    }
}

export const signOutAccount = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        console.log(error);
    }
}

/*-------------------------------------------------------------post upload functions----------------------------------------------*/
// upload file to appwrite storage

export const uploadFileToStorage = async (file: File) => {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId, //include the storage id where you want to upload the file
            ID.unique(), //the unique id of the file
            file //the file to upload
        )
        return uploadedFile;
    } catch (error) {
        console.log(error);
    }
}

// getting the uploaded file url

export const getFileUrl = async (fileId: string) => {
    try {
        const fileUrl = await storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            ImageGravity.Top,
            100
        );

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}

// deleting the file from the storage
export const deleteFileFromDB = async (fileId: string) => {
    try {
        await storage.deleteFile(
            appwriteConfig.storageId,
            fileId
        )
        return { status: 'Deletion successful' };
    } catch (error) {
        console.log(error);
    }
}

// creating the post
export const saveNewPostToDB = async (post: INewPost) => {
    try {
        // uploading file to appwrite storage
        const uploadedFile = await uploadFileToStorage(post.file[0]);

        if (!uploadedFile) throw Error;

        //getting the file url

        const fileUrl = await getFileUrl(uploadedFile.$id);

        console.log('uploaded file url:', fileUrl);

        // if the fileUrl is not available, delete the file from the storage and throw an error
        if (!fileUrl) {
            await deleteFileFromDB(uploadedFile.$id);
            throw Error;
        };

        // converting tags to an array

        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // create the actual post

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags
            }
        );

        // this check ensures that the post is created successfully, if not, delete the file from the storage and throw an error
        if (!newPost) {
            await deleteFileFromDB(uploadedFile.$id);
            throw Error;
        }

        return newPost;

    } catch (error) {
        console.log(error);
    }
};
/*-----------------------------------------------------------post upload functions end---------------------------------------------*/
// fetching recent posts

export const getRecentPosts = async () => {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    )

    if (!posts) throw new Error;
    return posts;
}

// like post

export const likePost = async (postId: string, likesArray: string[]) => {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray,
            }
        )

        if (updatedPost) throw new Error;

        return updatedPost;
    } catch (error) {
        console.log(error)
    }
}

// save post
export const savePost = async (postId: string, userId: string) => {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId
            }
        )

        if (updatedPost) throw new Error;

        return updatedPost;
    } catch (error) {
        console.log(error)
    }
}
// delete saved post
export const deleteSavedPost = async (savedRecordId: string,) => {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId
        )

        if (!statusCode) throw new Error;

        return { status: 'Post unsaved successfully' };
    } catch (error) {
        console.log(error)
    }
}

// post details

export const getPostById = async (id: string) => {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            id,
        )
        return post;
    } catch (error) {
        console.log(error);
    }
}

//update post


export const updatePostToDB = async (post: IUpdatePost) => {
    const hasFileToUpdate = post.file.length > 0;
    try {

        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        }

        if (hasFileToUpdate) {
            // uploading file to appwrite storage
            const uploadedFile = await uploadFileToStorage(post.file[0]);
            if (!uploadedFile) throw Error;
            //getting the file url

            const fileUrl = await getFileUrl(uploadedFile.$id);

            console.log('uploaded file url:', fileUrl);

            // if the fileUrl is not available, delete the file from the storage and throw an error
            if (!fileUrl) {
                await deleteFileFromDB(uploadedFile.$id);
                throw Error;
            };

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
        }


        // converting tags to an array

        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // create the actual post

        const updatePost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags
            }
        );

        // this check ensures that the post is created successfully, if not, delete the file from the storage and throw an error
        if (!updatePost) {
            await deleteFileFromDB(post.imageId);
            throw Error;
        }

        return updatePost;

    } catch (error) {
        console.log(error);
    }
};

// delete post

export const deletePost = async (postId: string, imageId: string) => {
    if (!postId || !imageId) throw Error;

    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
    } catch (error) {
        console.log(error);
    }
}

// infinite posts

export const getInfinitePosts = async ({ pageParam }: { pageParam: number }) => {
    const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)];

    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        )

        if (!posts) throw Error;

        return posts;

    } catch (error) {
        console.log(error);
    }
}


export const searchPosts = async (searchTerm: string) => {

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        )

        if (!posts) throw Error;

        return posts;

    } catch (error) {
        console.log(error);
    }
}

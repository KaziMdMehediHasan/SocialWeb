import { INewUser } from "@/types";
import { account, appwriteConfig, avatars, databases } from "./config";
import { ID, Query } from "appwrite";

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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import FileUploader from "../shared/FileUploader"
import { PostValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useCreatePost } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"


type PostFormProps = {
    post?: Models.Document;
}

const PostForm = ({ post }: PostFormProps) => {
    // react query hook

    const { mutateAsync: saveNewPostToDB, isPending: createPostLoading } = useCreatePost();
    const { user } = useUserContext();
    const { toast } = useToast();
    const navigate = useNavigate()

    // 1. Define your form.
    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            caption: post ? post?.caption : '',
            file: [],
            location: post ? post?.location : '',
            tags: post ? post?.tags.join(',') : '',
        },
    })

    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof PostValidation>) => {

        const newPost = await saveNewPostToDB({
            ...values,
            userId: user.id,
        });

        if (!newPost) {
            toast({
                title: 'Please try again'
            })
        }

        navigate('/');

    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
                {/* caption field */}
                <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Caption</FormLabel>
                            <FormControl>
                                <Textarea className="shad-textarea custom-scrollbar" placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                {/* image file upload field */}
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Photos</FormLabel>
                            <FormControl>
                                <FileUploader
                                    fieldChange={field.onChange}
                                    mediaUrl={post?.imageUrl}
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                {/* location */}
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Location</FormLabel>
                            <FormControl>
                                <Input type='text' className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                {/* tags */}
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Tags (separated by comma " , " )</FormLabel>
                            <FormControl>
                                <Input type='text' className="shad-input" placeholder="Art, Expression, Learn"  {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                {/* buttons section */}
                <div className="flex gap-4 items-center justify-end">
                    <Button type="button" className="shad-button_dark_4">Cancel</Button>
                    <Button type="submit" className="shad-button_primary whitespace-nowrap">Submit</Button>
                </div>
            </form>
        </Form>
    )
}

export default PostForm
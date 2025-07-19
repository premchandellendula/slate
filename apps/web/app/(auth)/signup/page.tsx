"use client"
import BottomWarning from "@/components/ui/BottomWarning";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/Heading";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/PasswordInput";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import axios from 'axios';
import { toast } from "sonner";
import Spinner from "@/components/loaders/Spinner";

export default function Signup(){
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const router = useRouter();

    const canSubmit =
        formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.password.trim() !== "" &&
        formData.confirmPassword.trim() !== "" &&
        formData.password === formData.confirmPassword;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if(name === "confirmPassword"){
            if(value !== formData.password){
                setConfirmPasswordError("Passwords do not match")
            }else{
                setConfirmPasswordError("")
            }
        }

        if (name === "password" && formData.confirmPassword.length > 0) {
            if (formData.confirmPassword !== value) {
                setConfirmPasswordError("Passwords do not match");
            } else {
                setConfirmPasswordError("");
            }
        }
    }

    const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) =>  {
        e.preventDefault();

        setLoading(true);

        try {
            await axios.post('/api/auth/signup', formData, {
                withCredentials: true,
            })

            toast.success("Signup successful")
        }catch(err) {
            let errorMessage = "Something went wrong";

            if(axios.isAxiosError(err)){
                errorMessage = err.response?.data.message || err.message
            }
            console.log("Error signing up: ", err)
            setError(errorMessage);
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-background rounded-lg shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] w-96 p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-3">
                        <Heading size="2xl" text="Signup" />
                        <Input placeholder="Full Name" name="name" id="name" onChange={handleChange} />
                        <Input placeholder="Email Address" type="email" name="email" id="email" onChange={handleChange} />
                        <PasswordInput placeholder="Password" name="password" id="password" onChange={handleChange} />
                        <PasswordInput placeholder="Confirm Password" name="confirmPassword" id="confirmPassword" onChange={handleChange} />
                        {error && <p className="text-red-500">{error}</p>}

                        {confirmPasswordError && <p className="text-red-500">{confirmPasswordError}</p>}
                        <Button type="submit">
                            {loading ? (
                                <Spinner />
                            ) : (
                                "Signup"
                            )}
                        </Button>
                        <BottomWarning label="Already have an account?" buttonText="Signin" to="/signin" />
                    </div>
                </form>
            </div>
        </div>
    )
}
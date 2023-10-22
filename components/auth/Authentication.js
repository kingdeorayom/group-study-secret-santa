import LoginForm from "@/components/forms/LoginForm"
import RegistrationForm from "@/components/forms/RegistrationForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Authentication = () => {
    return (
        <Tabs defaultValue="login">
            <TabsList className="mb-4">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="registration">Registration</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <LoginForm />
            </TabsContent>
            <TabsContent value="registration">
                <RegistrationForm />
            </TabsContent>
        </Tabs>
    )
}

export default Authentication
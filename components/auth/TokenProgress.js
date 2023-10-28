import { Progress } from "@/components/ui/progress"

const TokenProgress = ({ progress }) => {
    return (
        <div className="text-center sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/3 mx-auto px-4 mb-12">
            <Progress value={progress} className="w-full mb-5" />
            <p className="text-slate-500 font-light text-sm">
                Checking security issues on your browser and verifying your credentials. Please wait...
            </p>
        </div>
    )
}

export default TokenProgress
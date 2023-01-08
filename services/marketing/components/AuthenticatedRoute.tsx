import useToken, { getToken } from "./hooks/useToken";

const AuthenticatedRoute = (WrappedComponent: any) => {
    
    return (props: any) => {
        if (typeof window !== "undefined") {
            const token = getToken();
            if (!token) {
                window.location.href = '/chatGPT/login'
                return null;
            }
            return <WrappedComponent {...props} />;
        }
        // If we are on server, return null
        return null;
    };
 };
 
 export default AuthenticatedRoute;
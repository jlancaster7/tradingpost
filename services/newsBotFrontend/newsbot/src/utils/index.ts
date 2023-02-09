import { toast } from 'react-toastify';

export const notify = (msg: string) => {
    toast(msg,
            {position: toast.POSITION.TOP_CENTER})
        }
export const isEmail = (email: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

import { useState } from 'react';


export default function useToken() {
  const getToken = () => {
    const tokenString = sessionStorage.getItem('token');
    if (!tokenString) return '';
    const userToken = JSON.parse(tokenString);
    return userToken?.token
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken: {token: string}) => {
    sessionStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken.token);
  };

  return {
    setToken: saveToken,
    token
  }
}
export function saveToken (userToken: {token: string}) {
    localStorage.setItem('token', JSON.stringify(userToken));
}
export function getToken() {
    const tokenString = localStorage.getItem('token');
    if (!tokenString) return '';
    const userToken = JSON.parse(tokenString);
    return userToken?.token
} 
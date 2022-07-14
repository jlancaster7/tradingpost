import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import FileUpload from "./FileUpload";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


const x = ({changeSecurity, security}) => (<form className="space-y-8 divide-y divide-gray-200">
    <div className="space-y-8 divide-y divide-gray-200">
        <div>
            <div className="pt-8">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Security Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can receive
                        mail.</p>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                    {/* Logo URL*/}
                    <div className="sm:col-span-6">
                        <label htmlFor="logo-url"
                               className="block text-sm font-medium text-gray-700">Logo</label>
                        <div className="mt-1 flex items-center space-x-5">
                                  <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                    <img src={security.logUrl} alt={"security image"}/>
                                  </span>
                            <FileUpload/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>)
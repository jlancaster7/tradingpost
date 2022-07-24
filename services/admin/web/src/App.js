import {useEffect, useState} from "react";
import * as api from "./api";
import FileUpload from "./FileUpload";

const App = () => {
    const [security, setSecurity] = useState({});
    const [iexSecurity, setIexSecurity] = useState({});
    const [oldSecurityValues, setOldSecurityValues] = useState({});

    const [isLoading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [securitySuggestions, setSecuritiesList] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const {security, iexSecurity} = await api.getSecurity();
            setSecurity(security);
            setIexSecurity(iexSecurity)
            setOldSecurityValues(security);
        }
        getData().catch(err => console.error(err));
    }, []);

    const getSecurity = async (securityId) => {
        const {security, iexSecurity} = await api.getSecurityById(securityId);
        setSecurity(security);
        setIexSecurity(iexSecurity)
        setOldSecurityValues(security);
    }

    const searchSecurity = async (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim() === '') {
            setSecuritiesList([])
            return
        }
        setSecuritiesList(await api.searchSecurities(value));
    }

    const updateLogoUrl = (logoUrl) => {
        setSecurity({
            ...security, logoUrl: logoUrl
        });
    }

    const validate = async (e) => {
        e.preventDefault();
        const securityId = security.id;
        delete (security["id"]);
        await api.updateSecurityValidation(securityId, security);
        setLoading(true);
        const {security: newSecurity, iexSecurity} = await api.getSecurity()
        setSecurity(newSecurity);
        setOldSecurityValues(newSecurity);
        setIexSecurity(iexSecurity)
        setLoading(false);
    }

    const changeSecurity = (name, val) => {
        setSecurity({
            ...security, [name]: val
        })
    }

    if (isLoading) return (<div>Loading....</div>)

    return (<div className="space-y-6">
        <div>
            <TypeaheadDropdown query={query} setQuery={searchSecurity} suggestions={securitySuggestions}
                               setSuggestion={getSecurity}/>
        </div>
        <Form
            changeSecurity={changeSecurity}
            security={security}
            iexSecurity={iexSecurity}
            updateLogoUrl={updateLogoUrl}
            onSubmit={validate}
        />
    </div>);
}

const TypeaheadDropdown = ({query, setQuery, suggestions, setSuggestion}) => {
    const [isOpen, setToggleOpen] = useState(false);
    return (<div>
        <input
            onChange={setQuery}
            placeholder={"Pick Security"}
            value={query}
            type="text"
            className={"typeahead-dropdown-input"}
            onFocus={() => setToggleOpen(true)}
            onBlur={(e) => {
                if (e.nativeEvent.explicitOriginalTarget && e.nativeEvent.explicitOriginalTarget === e.nativeEvent.originalTarget) {
                    return
                }

                if (isOpen) {
                    setTimeout(() => {
                        setToggleOpen(false)
                    }, 200);
                }
            }}
        />
        <div className="typeahead-dropdown" hidden={!isOpen}>
            {suggestions && suggestions.map(suggestion => {
                return (<ul key={suggestion.symbol}>
                    <li
                        onClick={() => setSuggestion(suggestion.id)}
                    >
                        <div>
                            <img src={suggestion.logoUrl} alt={`${suggestion.name} Logo`}/>
                        </div>
                        <div>
                            <div className="suggestion-name">{suggestion.name}</div>
                            <div>{suggestion.symbol}</div>
                        </div>
                    </li>
                </ul>)
            })}
        </div>
    </div>)
}

const Form = ({changeSecurity, security, iexSecurity, updateLogoUrl, onSubmit}) => {
    return (<div className="bg-white shadow px-5 py-5 sm:rounded-lg sm:p-10 divide-x">
        <div className="md:grid md:grid-cols-2 md:gap-6 divide-x-3">
            <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Security Information Validator</h3>
                <p className="mt-1 text-sm text-gray-500">Update/Validate Security Information</p>
            </div>

            <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={onSubmit}>
                    <div className="grid grid-cols-6 gap-6">
                        {/* Security ID */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="security-id" className="block text-sm font-medium text-gray-700">
                                Security ID
                            </label>
                            <input
                                type="text"
                                name="security-id"
                                id="security-id"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={security.id}
                                disabled
                            />
                        </div>

                        {/* Security Symbol */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="security-symbol" className="block text-sm font-medium text-gray-700">
                                Security Symbol
                            </label>
                            <input
                                type="text"
                                name="security-symbol"
                                id="security-symbol"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={security.symbol}
                                disabled
                            />
                        </div>

                        {/* Exchange Name */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="exchange-name" className="block text-sm font-medium text-gray-700">
                                Exchange Name
                            </label>
                            <input
                                type="text"
                                name="exchange-name"
                                id="exchange-name"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.exchange}
                                onChange={(e) => changeSecurity('exchange', e.target.value)}
                            />
                        </div>

                        {/* Iex Security ID */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="security-id" className="block text-sm font-medium text-gray-700">
                                IEX Security ID
                            </label>
                            <input
                                type="text"
                                name="security-id"
                                id="security-id"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.id}
                                disabled
                            />
                        </div>

                        {/* IEX Security Symbol */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="security-symbol" className="block text-sm font-medium text-gray-700">
                                IEX Security Symbol
                            </label>
                            <input
                                type="text"
                                name="security-symbol"
                                id="security-symbol"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.symbol}
                                disabled
                            />
                        </div>

                        {/* IEX Exchange Name */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="exchange-name" className="block text-sm font-medium text-gray-700">
                                Exchange Name
                            </label>
                            <input
                                type="text"
                                name="exchange-name"
                                id="exchange-name"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.exchange}
                                disabled
                            />
                        </div>

                        {/* Website */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                Website
                            </label>
                            <input
                                type="text"
                                name="website"
                                id="website"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.website}
                                onChange={(e) => changeSecurity('website', e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <input
                                type="text"
                                name="description"
                                id="description"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.description}
                                onChange={(e) => changeSecurity('description', e.target.value)}
                            />
                        </div>

                        {/* Company Name */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                                Company Name
                            </label>
                            <input
                                type="text"
                                name="company-name"
                                id="company-name"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.companyName}
                                onChange={(e) => changeSecurity('companyName', e.target.value)}
                            />
                        </div>

                        {/* IEX Website */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                IEX Website
                            </label>
                            <input
                                type="text"
                                name="website"
                                id="website"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.website}
                                disabled
                            />
                        </div>

                        {/* IEX Description */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                IEX Description
                            </label>
                            <input
                                type="text"
                                name="description"
                                id="description"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.description}
                                disabled
                            />
                        </div>

                        {/* IEX Company Name */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                                Company Name
                            </label>
                            <input
                                type="text"
                                name="company-name"
                                id="company-name"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.companyName}
                                disabled
                            />
                        </div>

                        {/* Industry */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                                Industry
                            </label>
                            <input
                                type="text"
                                name="industry"
                                id="industry"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.industry}
                                onChange={(e) => changeSecurity('industry', e.target.value)}
                            />
                        </div>

                        {/* CEO */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="ceo" className="block text-sm font-medium text-gray-700">
                                CEO
                            </label>
                            <input
                                type="text"
                                name="ceo"
                                id="ceo"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.ceo}
                                onChange={(e) => changeSecurity('ceo', e.target.value)}
                            />
                        </div>

                        {/* Column Holder */}
                        <div className="col-span-6 sm:col-span-2"></div>

                        {/* IEX Industry */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                                IEX Industry
                            </label>
                            <input
                                type="text"
                                name="industry"
                                id="industry"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.industry}
                                disabled
                            />
                        </div>

                        {/* IEX CEO */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="ceo" className="block text-sm font-medium text-gray-700">
                                IEX CEO
                            </label>
                            <input
                                type="text"
                                name="ceo"
                                id="ceo"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.ceo}
                                disabled
                            />
                        </div>

                        {/* Column Holder */}
                        <div className="col-span-6 sm:col-span-2"></div>

                        {/* Logo */}
                        <div className="col-span-6 sm:col-span-6">
                            <div className="mt-1 flex items-center space-x-5">
                                  <span className="inline-block h-24 w-24 overflow-hidden bg-gray-100">
                                    <img className="object-scale-down" src={security.logoUrl} alt={security.symbol}/>
                                  </span>
                                <FileUpload symbol={security.symbol} updateLogoUrl={updateLogoUrl}/>
                                <input
                                    type="text"
                                    name="iexSecurityLogoUrl"
                                    id="iexSecurityLogoUrl"
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    value={iexSecurity.logoUrl}
                                    onChange={(e) => {
                                        updateLogoUrl(e.target.value)
                                    }}
                                />
                            </div>
                        </div>

                        {/* IEX Logo */}
                        <div className="col-span-6 sm:col-span-6">
                            <div className="mt-1 flex items-center space-x-5">
                                  <span className="inline-block h-24 w-24 overflow-hidden bg-gray-100">
                                    <img className="object-scale-down" src={iexSecurity.logoUrl}
                                         alt={iexSecurity.symbol}/>
                                  </span>
                                <label htmlFor="iexSecurityLogoUrl" className="block text-sm font-medium text-gray-700">
                                    IEX Logo URL
                                </label>
                                <input
                                    type="text"
                                    name="iexSecurityLogoUrl"
                                    id="iexSecurityLogoUrl"
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                    value={iexSecurity.logoUrl}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.tags}
                                onChange={(e) => changeSecurity('tags', e.target.value)}
                            />
                        </div>

                        {/* Security Name */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="security-name" className="block text-sm font-medium text-gray-700">
                                Security Name
                            </label>
                            <input
                                type="text"
                                name="security-name"
                                id="security-name"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.securityName}
                                onChange={(e) => changeSecurity('securityName', e.target.value)}
                            />
                        </div>

                        {/* Employees */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
                                Employees
                            </label>
                            <input
                                type="text"
                                name="employees"
                                id="employees"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.employees}
                                onChange={(e) => changeSecurity('employees', e.target.value)}
                            />
                        </div>

                        {/* IEX Tags */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                IEX Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.tags}
                                disabled
                            />
                        </div>

                        {/* IEX Security Name */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="security-name" className="block text-sm font-medium text-gray-700">
                                IEX Security Name
                            </label>
                            <input
                                type="text"
                                name="security-name"
                                id="security-name"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.securityName}
                                disabled
                            />
                        </div>

                        {/* IEX Employees */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
                                IEX Employees
                            </label>
                            <input
                                type="text"
                                name="employees"
                                id="employees"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.employees}
                                disabled
                            />
                        </div>

                        {/* Issue Type */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700">
                                Issue Type
                            </label>
                            <input
                                type="text"
                                name="issue-type"
                                id="issue-type"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.issueType}
                                onChange={(e) => changeSecurity('issueType', e.target.value)}
                            />
                        </div>

                        {/* Sector */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                                Sector
                            </label>
                            <input
                                type="text"
                                name="sector"
                                id="sector"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.sector}
                                onChange={(e) => changeSecurity('sector', e.target.value)}
                            />
                        </div>

                        {/* Primary Sic Code */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="primary-sic-code" className="block text-sm font-medium text-gray-700">
                                Primary Sic Code
                            </label>
                            <input
                                type="text"
                                name="primary-sic-code"
                                id="primary-sic-code"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.primarySicCode}
                                onChange={(e) => changeSecurity('primarySicCode', e.target.value)}
                            />
                        </div>

                        {/* IEX Issue Type */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700">
                                IEX Issue Type
                            </label>
                            <input
                                type="text"
                                name="issue-type"
                                id="issue-type"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.issueType}
                                disabled
                            />
                        </div>

                        {/* IEX Sector */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                                IEX Sector
                            </label>
                            <input
                                type="text"
                                name="sector"
                                id="sector"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={security.sector}
                                disabled
                            />
                        </div>

                        {/* IEX Primary Sic Code */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="primary-sic-code" className="block text-sm font-medium text-gray-700">
                                IEX Primary Sic Code
                            </label>
                            <input
                                type="text"
                                name="primary-sic-code"
                                id="primary-sic-code"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.primarySicCode}
                                disabled
                            />
                        </div>

                        {/* Address */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.address}
                                onChange={(e) => changeSecurity('address', e.target.value)}
                            />
                        </div>

                        {/* Address 2 */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                                Address 2
                            </label>
                            <input
                                type="text"
                                name="address2"
                                id="address2"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.address2}
                                onChange={(e) => changeSecurity('address2', e.target.value)}
                            />
                        </div>

                        {/* State */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                id="state"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.state}
                                onChange={(e) => changeSecurity('state', e.target.value)}
                            />
                        </div>

                        {/* IEX Address */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                IEX Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.address}
                                disabled
                            />
                        </div>

                        {/* IEX Address 2 */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                                IEX Address 2
                            </label>
                            <input
                                type="text"
                                name="address2"
                                id="address2"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.address2}
                                disabled
                            />
                        </div>

                        {/* IEX State */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                IEX State
                            </label>
                            <input
                                type="text"
                                name="state"
                                id="state"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.state}
                                disabled
                            />
                        </div>

                        {/* Zip */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                                Zip
                            </label>
                            <input
                                type="text"
                                name="zip"
                                id="zip"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.zip}
                                onChange={(e) => changeSecurity('zip', e.target.value)}
                            />
                        </div>

                        {/* Country */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                Country
                            </label>
                            <input
                                type="text"
                                name="country"
                                id="country"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.country}
                                onChange={(e) => changeSecurity('country', e.target.value)}
                            />
                        </div>

                        {/* Phone */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={security.phone}
                                onChange={(e) => changeSecurity('phone', e.target.value)}
                            />
                        </div>


                        {/* IEX Zip */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                                IEX Zip
                            </label>
                            <input
                                type="text"
                                name="zip"
                                id="zip"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.zip}
                                disabled
                            />
                        </div>

                        {/* IEX Country */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                IEX Country
                            </label>
                            <input
                                type="text"
                                name="country"
                                id="country"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.country}
                                disabled
                            />
                        </div>

                        {/* IEX Phone */}
                        <div className="col-span-6 sm:col-span-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                IEX Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:border-slate-200 disabled:shadow-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={iexSecurity.phone}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onSubmit={onSubmit}
                        >
                            Validate
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>)
}

export default App;

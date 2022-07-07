import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {useEffect, useState} from "react";

const App = () => {
    const [security, setSecurity] = useState({});
    const [viewingSecurity, setViewingSecurity] = useState({});
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        const getData = async () => {
            const security = await getSecurity();
            setSecurity(security);
            setViewingSecurity(security);
        }
        getData();
    }, [])

    const validate = async (e) => {
        e.preventDefault();
        const securityKeys = Object.keys(security);
        let update = {};
        securityKeys.forEach(securityKey => {
            if (viewingSecurity[securityKey] !== security[securityKey]) {
                update[securityKey] = security[securityKey]
            }
        });

        const securityId = viewingSecurity.id;
        delete (security["id"]);
        await updateSecurityValidation(securityId, update);
        setLoading(true);
        const newSecurity = await getSecurity()
        setSecurity(newSecurity);
        setViewingSecurity(newSecurity);
        setLoading(false);
    }

    const changeSecurity = (name, val) => {
        setSecurity({
            ...security,
            [name]: val
        })
    }

    if (isLoading) return (
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    )

    return (
        <div>
            <div style={{
                width: '50%'
            }}>
                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Security ID
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.id}
                        onChange={(e) => {
                            changeSecurity('id', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Symbol
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.symbol}
                        onChange={(e) => {
                            changeSecurity('symbol', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Company Name
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.companyName}
                        onChange={(e) => {
                            changeSecurity('companyName', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Exchange
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.exchange}
                        onChange={(e) => {
                            changeSecurity('exchange', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Industry
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.industry}
                        onChange={(e) => {
                            changeSecurity('industry', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Website
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.website}
                        onChange={(e) => {
                            changeSecurity('website', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Description
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.description}
                        onChange={(e) => {
                            changeSecurity('description', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        CEO
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.ceo}
                        onChange={(e) => {
                            changeSecurity('ceo', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Security Name
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.securityName}
                        onChange={(e) => {
                            changeSecurity('securityName', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Issue Type
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.issueType}
                        onChange={(e) => {
                            changeSecurity('issueType', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Sector
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.sector}
                        onChange={(e) => {
                            changeSecurity('sector', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Primary Sic Code
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.primarySicCode}
                        onChange={(e) => {
                            changeSecurity('primarySicCode', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Employees
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.employees}
                        onChange={(e) => {
                            changeSecurity('employees', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Tags
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.tags}
                        onChange={(e) => {
                            changeSecurity('tags', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Address
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.address}
                        onChange={(e) => {
                            changeSecurity('address', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Address 2
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.address2}
                        onChange={(e) => {
                            changeSecurity('address2', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        State
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.state}
                        onChange={(e) => {
                            changeSecurity('state', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Zip
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.zip}
                        onChange={(e) => {
                            changeSecurity('zip', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Country
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.country}
                        onChange={(e) => {
                            changeSecurity('Country', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Phone
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.phone}
                        onChange={(e) => {
                            changeSecurity('phone', e.target.value)
                        }}
                    />
                </InputGroup>

                <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Logo Url
                    </InputGroup.Text>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value={security.logoUrl}
                        onChange={(e) => {
                            changeSecurity('logoUrl', e.target.value)
                        }}
                    />
                </InputGroup>
                <div>
                    <img src={security.logoUrl} alt={"thing"}/>
                </div>
            </div>
            <div style={{
                padding: '50px'
            }}>
                <div>
                    <Button variant="success" onClick={validate}>Validate</Button>
                </div>
            </div>
        </div>
    );
}

const updateSecurityValidation = async (securityId, security) => {
    try {
        await fetch('http://localhost:8080', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            mode: "cors",
            body: JSON.stringify({
                security: Object.keys(security).length > 0 ? security : undefined,
                securityId: parseInt(securityId)
            })
        });
    } catch (e) {
        console.error(e)
    }
}

const getSecurity = async () => {
    const response = await fetch('http://localhost:8080');
    return await response.json();
}

export default App;
